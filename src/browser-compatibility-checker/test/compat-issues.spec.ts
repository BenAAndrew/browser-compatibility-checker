import * as assert from "assert";
import bcd from "@mdn/browser-compat-data";
import { processCompatDataObject } from "../compat-issues";

describe("Process Compat Data", function () {
  it("Process Compat Data", function () {
    const compat = processCompatDataObject(bcd.css.properties, "$", "&");
    for (const [key, { browserIssues, deprecated }] of Object.entries(compat)) {
      assert.ok(key.startsWith("$"));
      assert.ok(key.endsWith("&"));
      assert.ok(browserIssues.length > 0 || deprecated);
    }
  });
});
