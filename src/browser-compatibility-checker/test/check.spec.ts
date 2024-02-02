import * as assert from "assert";
import { findIssues } from "../";
import { readFileSync } from "fs";

describe("Find Issues", function () {
  it("Find CSS issues", function () {
    const issues = findIssues(
      readFileSync("sample_project/style.css", "utf8"),
      {
        "-webkit-mask-repeat-y:": {
          deprecated: false,
          browserIssues: ["chrome"],
        },
        "min\\(": { deprecated: false, browserIssues: ["chrome", "edge"] },
        "@document": { deprecated: true, browserIssues: [] },
        ":blank": {
          deprecated: false,
          browserIssues: ["chrome", "chrome_android"],
        },
      },
    );
    assert.deepStrictEqual(issues, [
      {
        index: 190,
        isError: true,
        message:
          "-webkit-mask-repeat-y may not be supported in the following browsers: Chrome",
      },
      {
        index: 212,
        isError: true,
        message:
          "min may not be supported in the following browsers: Chrome, Edge",
      },
      {
        index: 431,
        isError: true,
        message: "document is deprecated",
      },
      {
        index: 515,
        isError: true,
        message:
          "blank may not be supported in the following browsers: Chrome, Chrome Android",
      },
    ]);
  });
  it("Find HTML issues", function () {
    const issues = findIssues(
      readFileSync("sample_project/index.html", "utf8"),
      {
        "<center": { deprecated: true, browserIssues: [] },
        "is=": { deprecated: false, browserIssues: ["chrome"] },
      },
    );
    assert.deepStrictEqual(issues, [
      {
        index: 144,
        isError: true,
        message: "center is deprecated",
      },
      {
        index: 195,
        isError: true,
        message: "is may not be supported in the following browsers: Chrome",
      },
    ]);
  });
  it("Find JS issues", function () {
    const issues = findIssues(
      readFileSync("sample_project/script.js", "utf8"),
      {
        "VideoEncoder\\(": { deprecated: true, browserIssues: ["firefox"] },
        "InternalError\\(": { deprecated: false, browserIssues: ["chrome"] },
      },
    );
    assert.deepStrictEqual(issues, [
      {
        index: 145,
        isError: true,
        message: "VideoEncoder is deprecated",
      },
      {
        index: 181,
        isError: true,
        message:
          "InternalError may not be supported in the following browsers: Chrome",
      },
    ]);
  });
  it("Warning issue", function () {
    const issues = findIssues(
      readFileSync("sample_project/style.css", "utf8"),
      {
        "-webkit-mask-repeat-y:": { deprecated: false, browserIssues: ["ie"] },
      },
      ['chrome'],
      true
    );
    assert.deepStrictEqual(issues, [
      {
        index: 190,
        isError: false,
        message:
          "-webkit-mask-repeat-y may not be supported in the following browsers: IE",
      },
    ]);
  });
  it("Ignore excluded browsers", function () {
    const issues = findIssues(
      readFileSync("sample_project/style.css", "utf8"),
      {
        "-webkit-mask-repeat-y:": { deprecated: false, browserIssues: ["ie"] },
      },
      ['chrome'],
      false
    );
    assert.deepStrictEqual(issues, []);
  });
  it("Include MDN Url", function () {
    const issues = findIssues(
      readFileSync("sample_project/style.css", "utf8"),
      {
        "-webkit-mask-repeat-y:": { deprecated: false, browserIssues: ["ie"], mdn_url: "https://developer.mozilla.org/en-US/docs/Web/CSS/-webkit-mask-repeat-y" },
      },
      ['chrome'],
      true
    );
    assert.deepStrictEqual(issues, [
      {
        index: 190,
        isError: false,
        message:
          "-webkit-mask-repeat-y may not be supported in the following browsers: IE",
        mdnUrl: "https://developer.mozilla.org/en-US/docs/Web/CSS/-webkit-mask-repeat-y"
      },
    ]);
  });
});
