import { CompatIssue } from "./compat-issues";

export const BROWSER_NAMES: { [key: string]: string } = {
  chrome: "Chrome",
  edge: "Edge",
  firefox: "Firefox",
  opera: "Opera",
  safari: "Safari",
  ie: "IE",
  chrome_android: "Chrome Android",
  firefox_android: "Firefox for Android",
  opera_android: "Opera Android",
  safari_ios: "Safari on iOS",
  samsunginternet_android: "Samsung Internet",
  webview_android: "Webview Android",
};

export function getMessage(
  name: string,
  issue: CompatIssue,
  browsersToCheck: string[] = [],
  warnForOtherBrowsers: boolean = true,
) {
  const nameFormatted = name.replace(/[^a-zA-Z-]/g, "");
  if (issue.deprecated) {
    return {
      message: `${nameFormatted} is deprecated`,
      isError: true,
    };
  }

  let browsers =
    browsersToCheck.length > 0
      ? issue.browserIssues.filter((browser) =>
          browsersToCheck.includes(browser),
        )
      : issue.browserIssues;
  let isError = true;

  if (browsers.length === 0) {
    if (warnForOtherBrowsers) {
      browsers = issue.browserIssues;
      isError = false;
    } else {
      return;
    }
  }

  const browsersFormatted = browsers
    .map((browser) => BROWSER_NAMES[browser])
    .filter((item) => item);
  return {
    message: `${nameFormatted} may not be supported in the following browsers: ${browsersFormatted.join(", ")}`,
    isError,
  };
}
