;

(function () {
  "use strict";

  function ownKeys(object, enumerableOnly) {
    var keys = Object.keys(object);

    if (Object.getOwnPropertySymbols) {
      var symbols = Object.getOwnPropertySymbols(object);
      if (enumerableOnly) symbols = symbols.filter(function (sym) {
        return Object.getOwnPropertyDescriptor(object, sym).enumerable;
      });
      keys.push.apply(keys, symbols);
    }

    return keys;
  }

  function _objectSpread(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i] != null ? arguments[i] : {};

      if (i % 2) {
        ownKeys(Object(source), true).forEach(function (key) {
          _defineProperty(target, key, source[key]);
        });
      } else if (Object.getOwnPropertyDescriptors) {
        Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
      } else {
        ownKeys(Object(source)).forEach(function (key) {
          Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
        });
      }
    }

    return target;
  }

  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }

    return obj;
  }

  function _toConsumableArray(arr) {
    return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread();
  }

  function _nonIterableSpread() {
    throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }

  function _unsupportedIterableToArray(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _arrayLikeToArray(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(o);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
  }

  function _iterableToArray(iter) {
    if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter);
  }

  function _arrayWithoutHoles(arr) {
    if (Array.isArray(arr)) return _arrayLikeToArray(arr);
  }

  function _arrayLikeToArray(arr, len) {
    if (len == null || len > arr.length) len = arr.length;

    for (var i = 0, arr2 = new Array(len); i < len; i++) {
      arr2[i] = arr[i];
    }

    return arr2;
  }

  function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
    try {
      var info = gen[key](arg);
      var value = info.value;
    } catch (error) {
      reject(error);
      return;
    }

    if (info.done) {
      resolve(value);
    } else {
      Promise.resolve(value).then(_next, _throw);
    }
  }

  function _asyncToGenerator(fn) {
    return function () {
      var self = this,
          args = arguments;
      return new Promise(function (resolve, reject) {
        var gen = fn.apply(self, args);

        function _next(value) {
          asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
        }

        function _throw(err) {
          asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
        }

        _next(undefined);
      });
    };
  }

  var state = {};

  var get_tab_id = function get_tab_id() {
    return new Promise(function (resolve, reject) {
      chrome.tabs.query({
        active: true,
        lastFocusedWindow: true
      }, function (matching_tabs_array) {
        var tab_id = matching_tabs_array && Array.isArray(matching_tabs_array) && matching_tabs_array.length ? matching_tabs_array[0].id : null;

        if (tab_id && tab_id !== chrome.tabs.TAB_ID_NONE) {
          state.tab_id = tab_id;
          resolve();
        } else {
          reject();
        }
      });
    });
  };

  var ff_private_bg_window_proxy = {
    clear_headers: function clear_headers(tab_id, hide_popup) {
      return browser.runtime.sendMessage({
        "method": "clear_headers",
        "params": {
          tab_id: tab_id,
          hide_popup: hide_popup
        }
      });
    },
    get_headers: function get_headers(tab_id) {
      return browser.runtime.sendMessage({
        "method": "get_headers",
        "params": {
          tab_id: tab_id
        }
      });
    }
  };

  var get_background_window = function get_background_window() {
    state.bg_window = chrome.extension.getBackgroundPage();

    if (!state.bg_window) {
      if (typeof browser !== 'undefined') state.bg_window = ff_private_bg_window_proxy;else throw new Error('');
    }
  };

  var initialize_state = function () {
    var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee() {
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              get_background_window();
              _context.next = 3;
              return get_tab_id();

            case 3:
            case "end":
              return _context.stop();
          }
        }
      }, _callee);
    }));

    return function initialize_state() {
      return _ref.apply(this, arguments);
    };
  }();

  var HEADER_DESCRIPTIONS = {
    'age': 'The time in seconds the object has been in a proxy cache.',
    'cache-control': 'Specifies directives for caching mechanisms in both, requests and responses.',
    'expires': 'The date/time after which the response is considered stale.',
    'pragma': 'Implementation-specific header that may have various effects anywhere along the request-response chain. Used for backwards compatibility with HTTP/1.0 caches where the Cache-Control header is not yet present.',
    'warning': 'A general warning field containing information about possible problems.',
    'last-modified': 'It is a validator, the last modification date of the resource, used to compare several versions of the same resource. It is less accurate than ETag, but easier to calculate in some environments. Conditional requests using If-Modified-Since and If-Unmodified-Since use this value to change the behavior of the request.',
    'etag': 'It is a validator, a unique string identifying the version of the resource. Conditional requests using If-Match and If-None-Match use this value to change the behavior of the request.',
    'if-match': 'Makes the request conditional and applies the method only if the stored resource matches one of the given ETags.',
    'if-none-match': 'Makes the request conditional and applies the method only if the stored resource doesn\'t match any of the given ETags. This is used to update caches (for safe requests), or to prevent to upload a new resource when one is already existing.',
    'if-modified-since': 'Makes the request conditional and expects the entity to be transmitted only if it has been modified after the given date. This is used to transmit data only when the cache is out of date.',
    'if-unmodified-since': 'Makes the request conditional and expects the entity to be transmitted only if it has not been modified after the given date. This is used to ensure the coherence of a new fragment of a specific range with previous ones, or to implement an optimistic concurrency control system when modifying existing documents.',
    'connection': 'Controls whether or not the network connection stays open after the current transaction finishes.',
    'keep-alive': 'Controls how long a persistent connection should stay open.',
    'accept': 'Informs the server about the types of data that can be sent back. It is MIME-type.',
    'accept-charset': 'Informs the server about which character set the client is able to understand.',
    'accept-encoding': 'Informs the server about the encoding algorithm, usually a compression algorithm, that can be used on the resource sent back.',
    'accept-language': 'Informs the server about the language the server is expected to send back. This is a hint and is not necessarily under the full control of the user: the server should always pay attention not to override an explicit user choice (like selecting a language in a drop down list).',
    'content-security-policy': 'Controls resources the user agent is allowed to load for a given page.',
    'content-security-policy-report-only': 'Allows web developers to experiment with policies by monitoring (but not enforcing) their effects. These violation reports consist of JSON documents sent via an HTTP POST request to the specified URI.',
    'cookie': 'Contains stored HTTP cookies previously sent by the server with the Set-Cookie header.',
    'set-cookie': 'Send cookies from the server to the user agent.',
    'cookie2': 'Used to contain an HTTP cookie, previously sent by the server with the Set-Cookie2 header, but has been obsoleted by the specification. Use Cookie instead.',
    'set-cookie2': 'Used to send cookies from the server to the user agent, but has been obsoleted by the specification. Use Set-Cookie instead.',
    'access-control-allow-origin': 'Indicates whether the response can be shared.',
    'access-control-allows-credentials': 'Indicates whether or not the response to the request can be exposed when the credentials flag is true.',
    'access-control-allow-headers': 'Used in response to a preflight request to indicate which HTTP headers can be used when making the actual request.',
    'access-control-allow-methods': 'Specifies the method or methods allowed when accessing the resource in response to a preflight request.',
    'access-control-expose-headers': 'Indicates which headers can be exposed as part of the response by listing their names.',
    'access-control-max-age': 'Indicates how long the results of a preflight request can be cached.',
    'access-control-request-headers': 'Used when issuing a preflight request to let the server know which HTTP headers will be used when the actual request is made.',
    'access-control-request-method': 'Used when issuing a preflight request to let the server know which HTTP method will be used when the actual request is made.',
    'origin': 'Indicates where a fetch originates from.',
    'dnt': 'Used for expressing the user\'s tracking preference.',
    'tk': 'Indicates the tracking status that applied to the corresponding request.',
    'content-disposition': 'Is a response header if the ressource transmitted should be displayed inline (default behavior when the header is not present), or it should be handled like a download and the browser should present a \'Save As\' window.',
    'strict-transport-security': 'Force communication using HTTPS instead of HTTP.',
    'content-length': 'indicates the size of the entity-body, in decimal number of octets, sent to the recipient.',
    'content-type': 'Indicates the media type of the resource.',
    'content-encoding': 'Used to specify the compression algorithm.',
    'content-language': 'Describes the language(s) intended for the audience, so that it allows a user to differentiate according to the users\' own preferred language.',
    'content-location': 'Indicates an alternate location for the returned data.',
    'via': 'Added by proxies, both forward and reverse proxies, and can appear in the request headers and the response headers.',
    'location': 'Indicates the URL to redirect a page to.',
    'from': 'Contains an Internet email address for a human user who controls the requesting user agent.',
    'host': 'Specifies the domain name of the server (for virtual hosting), and (optionally) the TCP port number on which the server is listening.',
    'referer': 'The address of the previous web page from which a link to the currently requested page was followed.',
    'referrer-policy': 'Governs which referrer information sent in the Referer header should be included with requests made.',
    'user-agent': 'Contains a characteristic string that allows the network protocol peers to identify the application type, operating system, software vendor or software version of the requesting software user agent. See also the Firefox user agent string reference.',
    'server': 'Contains information about the software used by the origin server to handle the request.',
    'accept-range': 'Indicates if the server supports range requests and, if so, in which unit the range can be expressed.',
    'if-range': 'Create a conditional range request that is only fulfilled if the etag or date given in parameter match the remote resource. Used to prevent downloading two ranges from incompatible version of the resource.',
    'transfer-encoding': 'Specifies the the form of encoding used to safely transfer the entity to the user.',
    'te': 'Specifies the transfer encodings the user agent is willing to accept.',
    'trailer': 'Allows the sender to include additional fields at the end of chunked message.',
    'date': 'Contains the date and time at which the message was originated.',
    'retry-after': 'Indicates how long the user agent should wait before making a follow-up request.',
    'upgrade': 'This is a Proposed Internet Standard. To view a comprehensive list of all Official and Proposed Internet Standards with detailed information about each, visit this Internet Standards reference, which is updated daily.  The relevant RFC document for the Upgrade header field standard is RFC 7230, section 6.7.  The standard establishes rules for upgrading or changing to a different protocol on the current client, server, transport protocol connection.  For example, this header standard allows a client to change from HTTP 1.1 to HTTP 2.0, assuming the server decides to acknowledge and implement the Upgrade header field.  Niether party is required to accept the terms specified in the Upgrade header field.  It can be used in both client and server headers.  If the Upgrade header field is specified, then the sender MUST also send the Connection header field with the upgrade option specified.  For details on the Connection header field please see section 6.1 of the aforementioned RFC.',
    'vary': 'Determines how to match future request headers to decide whether a cached response can be used rather than requesting a fresh one from the origin server.',
    'x-content-type-options': 'Disables MIME sniffing and forces browser to use the type given in Content-Type.',
    'x-dns-prefetch-control': 'Controls DNS prefetching, a feature by which browsers proactively perform domain name resolution on both links that the user may choose to follow as well as URLs for items referenced by the document, including images, CSS, JavaScript, and so forth.',
    'x-frame-options': 'Indicates whether or not a browser should be allowed to render a page in a <frame>, <iframe> or <object>'
  };

  var compare_headers = function compare_headers(a, b) {
    return a.name.localeCompare(b.name);
  };

  var title_for_header = function title_for_header(name) {
    return HEADER_DESCRIPTIONS.hasOwnProperty(name) ? HEADER_DESCRIPTIONS[name] : null;
  };

  var process_click_copy = function process_click_copy(event, header) {
    event.preventDefault();
    event.stopPropagation();

    try {
      navigator.clipboard.writeText("".concat(header.name, ": ").concat(header.value));
      var rowEl = event.currentTarget;
      rowEl.classList.add('copy-hightlight');
      setTimeout(function () {
        return rowEl.classList.remove('copy-hightlight');
      }, 500);
    } catch (e) {}
  };

  var process_clear_headers = function process_clear_headers(event) {
    event.preventDefault();
    event.stopPropagation();
    state.bg_window.clear_headers(state.tab_id, true);
  };

  var App = function App(_ref2) {
    var records = _ref2.records;
    return React.createElement("div", {
      id: "app"
    }, React.createElement("h3", null, records.length, " matches on page."), !records.length ? null : React.createElement(React.Fragment, null, React.createElement("div", {
      id: "actions"
    }, React.createElement("button", {
      onClick: process_clear_headers
    }, "Clear list")), React.createElement("h4", null, "Click on a header to copy it to clipboard."), React.createElement("div", {
      id: "headers"
    }, records.map(function (details, record_index) {
      var type = details.hasOwnProperty('requestHeaders') ? 'request' : details.hasOwnProperty('responseHeaders') ? 'response' : null;
      if (!type) return null;

      var headers = _toConsumableArray(details["".concat(type, "Headers")]).map(function (obj) {
        return _objectSpread(_objectSpread({}, obj), {}, {
          name: obj.name.toLowerCase()
        });
      }).sort(compare_headers);

      return React.createElement("table", {
        className: type,
        key: record_index
      }, type === 'request' ? React.createElement("caption", null, "".concat(details.method, " \u2013 ").concat(details.url)) : React.createElement("caption", {
        className: "status-code-".concat(details.statusCode)
      }, details.statusLine), React.createElement("thead", null, React.createElement("tr", null, React.createElement("th", null, "Name"), React.createElement("th", null, "Value"))), React.createElement("tbody", null, headers.map(function (header) {
        return React.createElement("tr", {
          key: header.name,
          onClick: function onClick(event) {
            return process_click_copy(event, header);
          }
        }, React.createElement("td", {
          title: title_for_header(header.name) || ''
        }, header.name), React.createElement("td", null, header.value));
      })), React.createElement("tfoot", null));
    }))));
  };

  var get_props = function () {
    var _ref3 = _asyncToGenerator(regeneratorRuntime.mark(function _callee2() {
      return regeneratorRuntime.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              _context2.next = 2;
              return state.bg_window.get_headers(state.tab_id);

            case 2:
              return _context2.abrupt("return", _context2.sent);

            case 3:
            case "end":
              return _context2.stop();
          }
        }
      }, _callee2);
    }));

    return function get_props() {
      return _ref3.apply(this, arguments);
    };
  }();

  var draw_list = function () {
    var _ref4 = _asyncToGenerator(regeneratorRuntime.mark(function _callee3() {
      var props;
      return regeneratorRuntime.wrap(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              _context3.next = 2;
              return get_props();

            case 2:
              props = _context3.sent;

              if (!(props.records === state.records)) {
                _context3.next = 5;
                break;
              }

              return _context3.abrupt("return");

            case 5:
              state.records = props.records;
              ReactDOM.render(React.createElement(App, props), document.getElementById('root'));

            case 7:
            case "end":
              return _context3.stop();
          }
        }
      }, _callee3);
    }));

    return function draw_list() {
      return _ref4.apply(this, arguments);
    };
  }();

  var close_popup = function close_popup() {
    if (state.timer) clearInterval(state.timer);
    state.timer = null;
    state.records = null;
    state.bg_window = null;
    window.close();
  };

  var initialize_popup = function () {
    var _ref5 = _asyncToGenerator(regeneratorRuntime.mark(function _callee4() {
      return regeneratorRuntime.wrap(function _callee4$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              _context4.prev = 0;
              _context4.next = 3;
              return initialize_state();

            case 3:
              draw_list();
              state.timer = setInterval(draw_list, 500);
              _context4.next = 10;
              break;

            case 7:
              _context4.prev = 7;
              _context4.t0 = _context4["catch"](0);
              close_popup();

            case 10:
            case "end":
              return _context4.stop();
          }
        }
      }, _callee4, null, [[0, 7]]);
    }));

    return function initialize_popup() {
      return _ref5.apply(this, arguments);
    };
  }();

  document.addEventListener('DOMContentLoaded', initialize_popup);
})();

//# sourceMappingURL=popup.js.map