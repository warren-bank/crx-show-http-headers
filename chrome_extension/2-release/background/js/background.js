// -----------------------------------------------------------------------------

// https://developer.chrome.com/docs/extensions/reference/runtime/#property-lastError
// https://developer.chrome.com/docs/extensions/reference/pageAction/#method-show
// https://developer.chrome.com/docs/extensions/reference/pageAction/#method-hide
const pageAction_noop_callback = () => {
  if (chrome.runtime.lastError)
    console.log(chrome.runtime.lastError.message)
}

const enable_popup = (tab_id) => {
  chrome.pageAction.show(tab_id, pageAction_noop_callback)
}

const disable_popup = (tab_id) => {
  chrome.pageAction.hide(tab_id, pageAction_noop_callback)
}

// -----------------------------------------------------------------------------

let user_options = null

const update_url_patterns = (arr) => {
  return arr
    .filter(pattern => !!pattern)
    .map(pattern => (pattern[0] === '^') ? new RegExp(pattern.toLowerCase()) : pattern.toLowerCase())
}

const update_user_options = (user_options_json, skip_reset = false) => {
  try {
    const data = JSON.parse(user_options_json)
    if (!data || !data.exclude || !data.include || !Array.isArray(data.exclude.url_patterns) || !Array.isArray(data.include.url_patterns))
      throw new Error('bad data format')

    data.exclude.url_patterns = update_url_patterns(data.exclude.url_patterns)
    data.include.url_patterns = update_url_patterns(data.include.url_patterns)

    user_options = data
  }
  catch(e) {
    if (!skip_reset)
      reset_default_options()
  }
}

// https://developer.chrome.com/docs/extensions/reference/storage/#usage
const get_options = () => {
  chrome.storage.local.get(
    ['user_options_json'],
    function(items){
      update_user_options(items.user_options_json)
    }
  )
}

const reset_default_options = () => {
  return new Promise(resolve => {
    const user_options_json = `
      {
        "exclude": {
          "all_requests":  false,
          "all_responses": false,
          "url_patterns":  []
        },
        "include": {
          "url_patterns":  [
            "^https?://.*(?:widevine|clearkey|playready|drm|license).*$"
          ]
        }
      }
    `

    update_user_options(user_options_json, true)

    chrome.storage.local.set({user_options_json}, resolve)
  })
}

// https://developer.chrome.com/docs/extensions/reference/api/storage#event-onChanged
chrome.storage.onChanged.addListener(
  function(changes, areaName){
    if ((areaName === 'local') && changes.user_options_json && changes.user_options_json.newValue) {
      update_user_options(changes.user_options_json.newValue)
    }
  }
)

// -----------------------------------------------------------------------------

const user_agent_regex_pattern = /^.*Chrome\/(\d+)\..*$/i

const get_chrome_major_version = () => {
  const user_agent_string = navigator.userAgent

  return (user_agent_string && user_agent_regex_pattern.test(user_agent_string))
    ? parseInt( user_agent_string.replace(user_agent_regex_pattern, '$1'), 10)
    : 0
}

// -----------------------------------------------------------------------------

const all_tab_data = {}  // tab_id => {tab_url, records: []}

const find_tab_ids_for_origin = (tab_url_origin) => {
  const tab_ids = []

  if (tab_url_origin) {
    for (let tab_id in all_tab_data) {
      const tab_data = all_tab_data[tab_id]

      if (tab_data.tab_url.toLowerCase().startsWith(tab_url_origin.toLowerCase()))
        tab_ids.push(Number(tab_id))
    }
  }

  return tab_ids
}

const get_new_tab_data = (tab_url) => ({tab_url: (tab_url || ""), records: []})

const delete_tab_data = (tab_id, hide_popup) => {
  delete all_tab_data[tab_id]

  if (hide_popup)
    disable_popup(tab_id)
}

const get_headers = (tab_id) => {
  const tab_data = all_tab_data[tab_id]

  return {
    records: (tab_data && Array.isArray(tab_data.records)) ? tab_data.records : []
  }
}

const clear_headers = (tab_id, hide_popup) => {
  const tab_data = all_tab_data[tab_id]

  if (tab_data && Array.isArray(tab_data.records) && tab_data.records)
    tab_data.records = []

  if (hide_popup)
    disable_popup(tab_id)
}

const process_web_request = (tab_id, details) => {
  let tab_data = all_tab_data[tab_id]

  // should not occur; tab_data is initialized when the tab_url changes
  if (!tab_data) {
    tab_data = get_new_tab_data()
    all_tab_data[tab_id] = tab_data
  }

  // update variable reference; popup tests for equality.
  tab_data.records = [...tab_data.records, details]

  enable_popup(tab_id)
}

const process_raw_web_request = (details) => {
  const tab_ids = (details.tabId !== chrome.tabs.TAB_ID_NONE)
    ? [details.tabId]
    : find_tab_ids_for_origin(details.initiator)  // support fetch() from service worker

  for (let tab_id of tab_ids) {
    if (tab_id !== chrome.tabs.TAB_ID_NONE) {
      process_web_request(tab_id, details)
    }
  }
}

const should_ignore_url = (details) => {
  const request_url = details.url.trim().toLowerCase()

  // blacklist
  for (let pattern of user_options.exclude.url_patterns) {
    if (pattern instanceof RegExp) {
      if (pattern.test(request_url))
        return true
    }
    else if (typeof pattern === 'string') {
      if (request_url.indexOf(pattern) >= 0)
        return true
    }
  }

  // whitelist
  for (let pattern of user_options.include.url_patterns) {
    if (pattern instanceof RegExp) {
      if (pattern.test(request_url))
        return false
    }
    else if (typeof pattern === 'string') {
      if (request_url.indexOf(pattern) >= 0)
        return false
    }
  }

  return (user_options.include.url_patterns.length > 0)
}

const should_ignore_request = (details) => {
  if (!user_options)
    return false

  if (user_options.exclude.all_requests && user_options.exclude.all_responses)
    return true

  return should_ignore_url(details)
}

const should_ignore_response = (details) => {
  if (!user_options)
    return false

  if (user_options.exclude.all_responses)
    return true

  return should_ignore_url(details)
}

// https://developer.chrome.com/docs/extensions/reference/webRequest/#registering-event-listeners
// https://developer.chrome.com/docs/extensions/reference/webRequest/#type-ResourceType
// https://developer.chrome.com/docs/extensions/reference/webRequest/#event-onSendHeaders
// https://developer.chrome.com/docs/extensions/reference/webRequest/#type-OnSendHeadersOptions
chrome.webRequest.onSendHeaders.addListener(
  function(details){
    if (should_ignore_request(details))
      return

    if (user_options && user_options.exclude.all_requests) {
      // add a minimal request object to display the requested page before its list of response headers
      const new_details = {}
      for (let key of ['tabId', 'initiator', 'method', 'url']) {
        new_details[key] = details[key]
      }
      new_details.requestHeaders = []
      details = new_details
    }

    process_raw_web_request(details)
  },
  {
    urls:["<all_urls>"]
  },
  (get_chrome_major_version() >= 72)
    ? ['requestHeaders', 'extraHeaders']
    : ['requestHeaders']
)

// https://developer.chrome.com/docs/extensions/reference/webRequest/#event-onHeadersReceived
// https://developer.chrome.com/docs/extensions/reference/webRequest/#type-OnHeadersReceivedOptions
chrome.webRequest.onHeadersReceived.addListener(
  function(details){
    if (should_ignore_response(details))
      return

    process_raw_web_request(details)
  },
  {
    urls:["<all_urls>"]
  },
  (get_chrome_major_version() >= 72)
    ? ['responseHeaders', 'extraHeaders']
    : ['responseHeaders']
)

const tab_url_regex_pattern = /^(?:https?|file):/i

// https://developer.chrome.com/docs/extensions/reference/tabs/#event-onUpdated
chrome.tabs.onUpdated.addListener(
  function(tab_id, change_info, tab){
    const tab_url   =  change_info.url
    const is_reload = (change_info.status === 'loading') && !tab_url

    // reloading the same url in the same tab?
    if (is_reload)
      clear_headers(tab_id, true)

    // not a change to the tab_url?
    if (!tab_url)
      return

    // not a supported url scheme?
    if (!tab_url_regex_pattern.test(tab_url))
      return

    let tab_data = all_tab_data[tab_id]

    if (!tab_data || (tab_data.tab_url !== tab_url)) {
      tab_data = get_new_tab_data(tab_url)
      all_tab_data[tab_id] = tab_data

      disable_popup(tab_id)
    }
  }
)

// https://developer.chrome.com/docs/extensions/reference/tabs/#event-onRemoved
chrome.tabs.onRemoved.addListener(
  function(tab_id){
    delete_tab_data(tab_id, false)
  }
)

// -----------------------------------------------------------------------------
// message sent from popup by: "ff_private_bg_window_proxy"

if (typeof browser !== 'undefined') {
  browser.runtime.onMessage.addListener((message) => {
    if (message && (typeof message === 'object') && message.method) {
      switch(message.method) {
        case "clear_headers": {
            const {tab_id, hide_popup} = message.params
            clear_headers(tab_id, hide_popup)
            return Promise.resolve(true)
          }
          break

        case "get_headers": {
            const {tab_id} = message.params
            const headers = get_headers(tab_id)
            return Promise.resolve(headers)
          }
          break
      }
    }
    return false
  })
}

// -----------------------------------------------------------------------------

// exports
window.get_headers   = get_headers
window.clear_headers = clear_headers
window.reset_options = reset_default_options

// initialize
get_options()
