import { DiagnosticSeverity } from "vscode";
import bcd, { Identifier } from "@mdn/browser-compat-data";

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

const CSS_GLOB = "*.{css,scss}";
const HTML_GLOB = "*.html";
const JS_GLOB = "*.{ts,js}";

export type CompatIssue = {
  deprecated: boolean;
  browserIssues: string[];
  mdn_url?: string;
};

function processCompatDataObject(
  data: Identifier,
  prefix: string = "",
  suffix: string = "",
) {
  const compatIssues: { [name: string]: CompatIssue } = {};
  for (const prop of Object.keys(data)) {
    let hasIssue = false;
    if(!data[prop].__compat){
      continue;
    }
    const { status, support, mdn_url } = data[prop].__compat!;
    const itemCompatIssues: CompatIssue = {
      deprecated: false,
      browserIssues: [],
    };
    if (status?.deprecated) {
      itemCompatIssues.deprecated = true;
      hasIssue = true;
    } else {
      for (const [name, data] of Object.entries(support)) {
        const isSupported = !Array.isArray(data)
          ? data.version_added && !data.version_last && !data.flags
          : data.some((obj) => obj.version_added && !obj.version_last && !obj.flags);
        if (!isSupported) {
          itemCompatIssues.browserIssues = [
            ...itemCompatIssues.browserIssues,
            name,
          ];
          hasIssue = true;
        }
      }
    }
    if (hasIssue) {
      itemCompatIssues.mdn_url = mdn_url;
      compatIssues[`${prefix}${prop}${suffix}`] = itemCompatIssues;
    }
  }
  return compatIssues;
}

export function processCompatData() {
  console.log(bcd);
  const cssCompatIssues = {
    ...processCompatDataObject(bcd.css["at-rules"], "@"),
    ...processCompatDataObject(bcd.css.properties, "", ":"),
    ...processCompatDataObject(bcd.css.selectors, ":"),
    ...processCompatDataObject(bcd.css.types, "", "\\("),
  };
  const htmlCompatIssues = {
    ...processCompatDataObject(bcd.html.elements, "<"),
    ...processCompatDataObject(bcd.html.global_attributes, "", "="),
  }
  const jsCompatIssues = {
    ...processCompatDataObject(bcd.javascript.builtins, "", "\\("),
    ...processCompatDataObject(bcd.api, "", "\\("),
  }
  return { [CSS_GLOB]: cssCompatIssues, [HTML_GLOB]: htmlCompatIssues, [JS_GLOB]: jsCompatIssues };
}

export function getMessage(name: string, issues: CompatIssue) {
  const nameFormatted = name.replace(/[^a-zA-Z-]/g, "");
  if (issues.deprecated) {
    return {
      message: `${nameFormatted} is deprecated`,
      level: DiagnosticSeverity.Error,
    };
  }

  const browsersFormatted = issues.browserIssues
    .map((browser) => BROWSER_NAMES[browser])
    .filter((item) => item);
  const level = issues.browserIssues.some((b) => KEY_BROWSERS.includes(b))
    ? DiagnosticSeverity.Error
    : DiagnosticSeverity.Warning;
  return {
    message: `${nameFormatted} may not be supported in the following browsers: ${browsersFormatted.join(", ")}`,
    level,
  };
}
