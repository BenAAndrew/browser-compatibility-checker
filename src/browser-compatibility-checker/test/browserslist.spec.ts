import * as assert from "assert";
import { getBrowsersList } from "../";

describe("Browserslist", function () {
  it("Get browserslist", function () {
    const browsersList = getBrowsersList("sample_projects/sample_project_3");
    assert.deepStrictEqual(browsersList, [
      "chrome_android",
      "firefox_android",
      "webview_android",
      "chrome",
      "edge",
      "firefox",
      "ie",
      "safari_ios",
      "opera_android",
      "opera",
      "safari",
      "samsunginternet_android",
    ]);
  });
  it("No browserslist", function () {
    const browsersList = getBrowsersList("sample_projects/sample_project");
    assert.equal(browsersList, undefined);
  });
});
