import bcd, { Identifier } from "@mdn/browser-compat-data";

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
    if (!data[prop].__compat) {
      continue;
    }
    const { status, support, mdn_url } = data[prop].__compat!;
    const itemCompatIssues: CompatIssue = {
      deprecated: false,
      browserIssues: [],
      mdn_url
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
      compatIssues[`${prefix}${prop}${suffix}`] = itemCompatIssues;
    }
  }
  return compatIssues;
}

export function processCompatData() {
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
