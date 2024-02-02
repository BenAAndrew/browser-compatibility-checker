import * as vscode from "vscode";
import {
  findIssues,
  CompatIssue,
} from "./browser-compatibility-checker";
import { minimatch } from "minimatch";

const compatIssues: { [path: string]: { [key: string]: CompatIssue} } = require('./browser-compatibility-checker/compat-issues.json');
const collections: { [key: string]: vscode.DiagnosticCollection } = {};

function checkFile(file: vscode.Uri, issues: { [key: string]: CompatIssue }, browsersToCheck: string[] = [], warnForOtherBrowsers: boolean = true) {
  const uri = vscode.Uri.file(file.path);
  if (collections[uri.toString()]) {
    collections[uri.toString()].delete(uri);
  }
  vscode.workspace.openTextDocument(file).then((doc) => {
    const text = doc.getText();
    const matches = findIssues(text, issues, browsersToCheck, warnForOtherBrowsers);
    const diagnostics = matches.map(({ index, message, isError }) => {
      const position = doc.positionAt(index);
      const range = new vscode.Range(position, position);
      return new vscode.Diagnostic(
        range,
        message,
        isError
          ? vscode.DiagnosticSeverity.Error
          : vscode.DiagnosticSeverity.Warning,
      );
    });
    const ws = vscode.workspace.getWorkspaceFolder(uri);
    const collection = vscode.languages.createDiagnosticCollection(
      ws?.name || "",
    );
    collection.set(uri, diagnostics);
    collections[uri.toString()] = collection;
  });
}

function scanFiles(browsersToCheck: string[] = [], warnForOtherBrowsers: boolean = true){
  for (const [fileRegex, issues] of Object.entries(compatIssues)) {
    vscode.workspace.findFiles(fileRegex).then((files) => {
      files.forEach((file) => checkFile(file, issues, browsersToCheck, warnForOtherBrowsers));
    });
  }
}

function scanFile(document: vscode.TextDocument, browsersToCheck: string[] = [], warnForOtherBrowsers: boolean = true) {
  for (const [fileRegex, issues] of Object.entries(compatIssues)) {
    if (minimatch(document.fileName, fileRegex, { nocase: true })) {
      checkFile(document.uri, issues, browsersToCheck, warnForOtherBrowsers);
    }
  }
}

export function activate(context: vscode.ExtensionContext) {
  const config = vscode.workspace.getConfiguration('browser-compatibility-checker');
  if(config.enableOnChange){
    scanFiles(config.browserList, config.warnForOtherBrowsers);
  }
  
  const checkAllFiles = vscode.commands.registerCommand(
    "browser-compatibility-checker.all-files",
    () => scanFiles(config.browserList, config.warnForOtherBrowsers),
  );
  context.subscriptions.push(checkAllFiles);

  const checkCurrentFiles = vscode.commands.registerCommand(
    "browser-compatibility-checker.current-file",
    () => {
      const editor = vscode.window.activeTextEditor;
      if (editor) {
        scanFile(editor.document, config.browserList, config.warnForOtherBrowsers);
      }
    },
  );
  context.subscriptions.push(checkCurrentFiles);

  if(config.enableOnChange){
    vscode.workspace.onDidChangeTextDocument((event) => {
      if (event.document.uri.scheme === "file") {
        scanFile(event.document, config.browserList, config.warnForOtherBrowsers);
      }
    });
  }
}

export function deactivate() {}
