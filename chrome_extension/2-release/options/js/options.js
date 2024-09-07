const dom = {
  exclude_all_requests:  document.getElementById('exclude_all_requests'),
  exclude_all_responses: document.getElementById('exclude_all_responses'),
  exclude_urls:          document.getElementById('exclude_urls'),
  include_urls:          document.getElementById('include_urls'),
  save:                  document.getElementById('save')
}

// Saves options to chrome.storage
const save_options = () => {
  const data = {
    exclude: {
      "all_requests":  dom.exclude_all_requests.checked,
      "all_responses": dom.exclude_all_responses.checked,
      "url_patterns":  []
    },
    include: {
      "url_patterns":  []
    }
  }

  let inputNodes

  inputNodes = [...dom.exclude_urls.querySelectorAll(':scope > ol > li > input.url')]
  data.exclude.url_patterns = inputNodes.map(inputNode => inputNode.value.trim()).filter(url => !!url)

  inputNodes = [...dom.include_urls.querySelectorAll(':scope > ol > li > input.url')]
  data.include.url_patterns = inputNodes.map(inputNode => inputNode.value.trim()).filter(url => !!url)

  const user_options_json = JSON.stringify(data)

  chrome.storage.local.set(
    {user_options_json},
    function(){
      // Add success notification
      const status = document.getElementById('status')
      status.textContent = 'Options saved.'

      // Remove success notification after a timeout
      setTimeout(
        function(){
          status.textContent = ''
        },
        750
      )
    }
  )
}

const add_empty_url = (blockElement) => {
  const parentNode  = blockElement.querySelector(':scope > ol')

  const newNode     = document.createElement('li')
  newNode.innerHTML = `<input type="text" class="url" value="" />`

  parentNode.appendChild(newNode)
}

const restore_urls = (blockElement, urls) => {
  const parentNode    = blockElement.querySelector(':scope > ol')
  const referenceNode = parentNode.querySelector(':scope > li:last-child')

  urls.forEach(url => {
    const newNode     = document.createElement('li')
    newNode.innerHTML = `<input type="text" class="url" value="${url}" />`
    parentNode.insertBefore(newNode, referenceNode)
  })
}

// https://developer.chrome.com/docs/extensions/reference/storage/#usage
const get_options = () => {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(
      ['user_options_json'],
      function(items){
        try {
          const data = JSON.parse(items.user_options_json)
          if (!data || !data.exclude || !data.include || !Array.isArray(data.exclude.url_patterns) || !Array.isArray(data.include.url_patterns))
            throw new Error('bad data format')

          resolve(data)
        }
        catch(e) {
          reject()
        }
      }
    )
  })
}

// Restore option form field values from chrome.storage
const restore_options = async () => {
  let data

  try {
    data = await get_options()
  }
  catch(e) {
    const bg_window = chrome.extension.getBackgroundPage()

    if (bg_window) {
      await bg_window.reset_options()
      data = await get_options()
    }
  }

  if (data) {
    dom.exclude_all_requests.checked  = !!data.exclude.all_requests
    dom.exclude_all_responses.checked = !!data.exclude.all_responses

    restore_urls(dom.exclude_urls, data.exclude.url_patterns)
    restore_urls(dom.include_urls, data.include.url_patterns)
  }
}

document.addEventListener('DOMContentLoaded', restore_options)

dom.save.addEventListener('click', save_options)
dom.exclude_urls.querySelector(':scope button.add_url').addEventListener('click', add_empty_url.bind(null, dom.exclude_urls))
dom.include_urls.querySelector(':scope button.add_url').addEventListener('click', add_empty_url.bind(null, dom.include_urls))
