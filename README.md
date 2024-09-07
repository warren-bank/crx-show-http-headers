### [WebExtension: _Show-HTTP-Headers_](https://github.com/warren-bank/crx-show-http-headers)

Show HTTP headers. Options to include or exclude: all requests, all responses, and matching URL (regex or substring) patterns.

#### Overview:

I couldn't find a WebExtension to show HTTP headers that would work properly in Fenix (ie: Firefox for Android).

This project reuses a lot of [code](https://github.com/warren-bank/crx-webcast-reloaded/tree/gh-pages/chrome_extension) that I'd previously written.

The options page allows the entry of multiple case-insensitive URL patterns into both a blacklist and a whitelist.
The blacklist always takes priority.
When a URL doesn't match any pattern in either list, then:
* the URL is included, if the whitelist is empty
* the URL is excluded, if the whitelist is non-empty

When a URL pattern begins with the `^` character, then it is treated as a regular expression.
Otherwise, it is treated as a substring that matches when a URL contains this exact text.

The default whitelist contains a single regular expression pattern, which [matches the same URLs](https://github.com/warren-bank/crx-webcast-reloaded/blob/v0.7.9/chrome_extension/2-release/background/js/background.js#L240) as the _DRM Licenses_ tab in the [WebExtension: _WebCast-Reloaded_](https://github.com/warren-bank/crx-webcast-reloaded).

#### Legal:

* copyright: [Warren Bank](https://github.com/warren-bank)
* license: [GPL-2.0](https://www.gnu.org/licenses/old-licenses/gpl-2.0.txt)
