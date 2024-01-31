import * as assert from "assert";
import * as path from "path";
import * as vscode from "vscode";

const filesAndIssues = {
  "index.html": [
    {
      message: "center is deprecated",
      line: 6,
      character: 6,
    },
    {
      message:
        "is may not be supported in the following browsers: IE, Safari, Safari on iOS",
      line: 7,
      character: 8,
    },
  ],
  "style.css": [
    {
      message: "document is deprecated",
      line: 20,
      character: 2,
    },
    {
      message: "-moz-float-edge is deprecated",
      line: 9,
      character: 4,
    },
    {
      message:
        "-webkit-mask-repeat-y may not be supported in the following browsers: Chrome, Chrome Android, Edge, Firefox, Firefox for Android, IE, Opera, Safari, Safari on iOS",
      line: 7,
      character: 4,
    },
    {
      message:
        "text-size-adjust may not be supported in the following browsers: Firefox, IE, Safari",
      line: 8,
      character: 3,
    },
    {
      message:
        "-moz-broken may not be supported in the following browsers: Chrome, Chrome Android, Edge, IE, Opera, Opera Android, Safari, Safari on iOS, Samsung Internet, Webview Android",
      line: 31,
      character: 2,
    },
    {
      message:
        "blank may not be supported in the following browsers: Chrome, Chrome Android, Edge, Firefox, Firefox for Android, IE, Opera, Opera Android, Safari, Safari on iOS, Samsung Internet, Webview Android",
      line: 27,
      character: 10,
    },
    {
      message: "min may not be supported in the following browsers: IE",
      line: 7,
      character: 26,
    },
    {
      message:
        "sqrt may not be supported in the following browsers: Chrome, Chrome Android, Edge, IE, Opera, Opera Android, Samsung Internet, Webview Android",
      line: 10,
      character: 10,
    },
  ],
  "script.js": [
    {
      message:
        "InternalError may not be supported in the following browsers: Chrome, Chrome Android, Edge, IE, Opera, Opera Android, Safari, Safari on iOS, Samsung Internet, Webview Android",
      line: 6,
      character: 19,
    },
    {
      message:
        "VideoEncoder may not be supported in the following browsers: Firefox, Firefox for Android, IE",
      line: 5,
      character: 21,
    },
  ],
};

function sleep(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function getFileIssues(filename: string) {
  const uri = path.join(
    vscode.workspace.workspaceFolders![0].uri.fsPath,
    filename,
  );
  const document = await vscode.workspace.openTextDocument(uri);
  return vscode.languages.getDiagnostics(document.uri);
}

suite("Extension Test Suite", () => {
  test("Run Compatibility Checker", async () => {
    await vscode.commands.executeCommand(
      "browser-compatibility-checker.checker",
    );
    await sleep(1000);

    for (const [filename, expectedIssues] of Object.entries(filesAndIssues)) {
      const issues = await getFileIssues(filename);
      assert.strictEqual(expectedIssues.length, issues.length);
      for (const expected of expectedIssues) {
        const match = issues.find((i) => i.message === expected.message);
        assert.ok(match);
        assert.strictEqual(match.range.start.line, expected.line);
        assert.strictEqual(match.range.start.character, expected.character);
      }
    }
  });
});
