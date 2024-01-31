import { DiagnosticSeverity } from "vscode";
import { CompatIssue } from "./compat-issues";

const BROWSER_NAMES: { [key: string]: string } = {
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

const KEY_BROWSERS = ["chrome", "edge", "firefox", "opera", "safari"];

export function getMessage(name: string, issue: CompatIssue) {
  const nameFormatted = name.replace(/[^a-zA-Z-]/g, "");
  if (issue.deprecated) {
    return {
      message: `${nameFormatted} is deprecated`,
      isError: true,
    };
  }

  const browsersFormatted = issue.browserIssues
    .map((browser) => BROWSER_NAMES[browser])
    .filter((item) => item);
  const isError = issue.browserIssues.some((b) => KEY_BROWSERS.includes(b));
  return {
    message: `${nameFormatted} may not be supported in the following browsers: ${browsersFormatted.join(", ")}`,
    isError,
  };
}
