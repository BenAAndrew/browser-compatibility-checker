import browserslist from "browserslist";

const BROWSERLIST_TO_MDN_MAP: { [key: string]: string } = {
  chrome: "chrome",
  edge: "edge",
  firefox: "firefox",
  opera: "opera",
  safari: "safari",
  ie: "ie",
  and_chr: "chrome_android",
  and_ff: "firefox_android",
  op_mob: "opera_android",
  ios_saf: "safari_ios",
  samsung: "samsunginternet_android",
  android: "webview_android",
};

export function getBrowsersList(path: string) {
  const browserQuery = browserslist.findConfig(path)?.defaults;
  if (!browserQuery || browserQuery.length === 0) return;
  const browsersList = browserslist(browserQuery);
  if (browsersList.length === 0) return;
  const browsers = Array.from(
    new Set(browsersList.map((b) => b.split(" ")[0])),
  );
  return browsers.map((b) => BROWSERLIST_TO_MDN_MAP[b]).filter((b) => b);
}
