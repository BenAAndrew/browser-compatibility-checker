# Browser compatibility checker

A tool for analyzing frontend code to find browser compatibility issues powered by [MDN compatibility data](https://developer.mozilla.org/en-US/)

## VSCode Extension

![](preview.gif)

- Scans HTML, CSS & JS files for compatibility issues
- Reports both deprecated & mixed-support features 
- Supports configuration of target browsers

### Extension Settings
- `browser-compatibility-checker.enableOnChange`: Enable this extension on start and file change
- `browser-compatibility-checker.useError`: Use a severity of 'Error' for each problem (otherwise uses 'Warning')
- `browser-compatibility-checker.browserList`: Which browsers to check compatibility for (defaults to all MDN recognised browsers)
- `browser-compatibility-checker.warnForOtherBrowsers`: Show a warning for issues with browsers not in the browser list
- `browser-compatibility-checker.foldersToIgnore`: Glob paths to exclude from scanning

## Local development
### Installation
1. `npm install`
2. `npm run watch`
3. Open VSCode & press F5 to run the extension
