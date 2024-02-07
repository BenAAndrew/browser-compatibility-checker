#!/usr/bin/env node

import { program } from "commander";
import { minimatch } from "minimatch";
import { readFileSync, readdirSync } from "fs";
import path from "path";
import kleur from "kleur";
import { findIssues, CompatIssue } from "./browser-compatibility-checker";
const compatIssues: {
  [path: string]: { [key: string]: CompatIssue };
} = require("./browser-compatibility-checker/compat-issues.json");

interface CliOptions {
  folder: string;
  browsers: string[] | string;
}

program
  .description("Scan files for browser compatibility issues")
  .option("-f, --folder <folder>", "Folder to scan")
  .option(
    "-b, --browsers [browsers]",
    "Comma seperated list of browsers to check",
    [
      "chrome",
      "edge",
      "firefox",
      "opera",
      "safari",
      "ie",
      "chrome_android",
      "firefox_android",
      "opera_android",
      "safari_ios",
      "samsunginternet_android",
      "webview_android",
    ]
  );

program.parse(process.argv);
const { folder, browsers } = program.opts() as CliOptions;
const browsersToCheck =
  typeof browsers === "string" ? browsers.split(",") : browsers;

if (!folder) {
  console.error(kleur.red("No folder path provided."));
  process.exit(1);
}

const files = readdirSync(folder, { recursive: true, encoding: "utf8" });
console.log(`Scanning: ${folder} (${files.length} files)`);
let hasIssue = false;

for (const [fileRegex, issues] of Object.entries(compatIssues)) {
  for (const file of files) {
    const filePath = path.join(folder, file);
    if (minimatch(filePath, fileRegex, { nocase: true })) {
      const text = readFileSync(filePath, "utf8");
      const matches = findIssues(text, issues, browsersToCheck, false);
      if (matches.length > 0) {
        hasIssue = true;
        console.error(kleur.red(`Issues found with ${filePath}:`));
        for (const { message } of matches) {
          console.log(`  - ${message}`);
        }
      } else {
        console.log(kleur.green(filePath));
      }
    }
  }
}

if (hasIssue) {
  console.log(
    "Issues detected. Address these issues or change --browsers to ingore irrelavant browser issues"
  );
  process.exit(1);
} else {
  console.log("No issues detected!");
}
