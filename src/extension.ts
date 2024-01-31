import * as vscode from "vscode";
import { processCompatData, getMessage, CompatIssue } from "./check";
import { minimatch } from "minimatch";

const collections: { [key: string]: vscode.DiagnosticCollection } = {};

function checkFile(file: vscode.Uri, issues: { [key: string]: CompatIssue }) {
  const uri = vscode.Uri.file(file.path);
  if (collections[uri.toString()]) {
    collections[uri.toString()].delete(uri);
  }
  const selectorsToWarn = Object.keys(issues);
  vscode.workspace.openTextDocument(file).then((doc) => {
    const text = doc.getText();
    const diagnostics: vscode.Diagnostic[] = [];
    selectorsToWarn.forEach((selector) => {
      const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(
        `(?:^|[\\s,\\[\\{;:])${escapedSelector}(?:(?![\\w\\d])|$)`,
        "g",
      );
      const { message, level } = getMessage(selector, issues[selector]);
      let match;
      while ((match = regex.exec(text)) !== null) {
        const position = doc.positionAt(match.index + 2);
        const range = new vscode.Range(position, position);
        const diagnostic = new vscode.Diagnostic(range, message, level);
        diagnostics.push(diagnostic);
      }
    });
    const ws = vscode.workspace.getWorkspaceFolder(uri);
    const collection = vscode.languages.createDiagnosticCollection(
      ws?.name || "",
    );
    collection.set(uri, diagnostics);
    collections[uri.toString()] = collection;
  });
}

export function activate(context: vscode.ExtensionContext) {
  const compatIssues = processCompatData();

  let disposable = vscode.commands.registerCommand(
    "browser-compatibility-checker.checker",
    () => {
      for (const [fileRegex, issues] of Object.entries(compatIssues)) {
        vscode.workspace.findFiles(fileRegex).then((files) => {
          files.forEach((file) => checkFile(file, issues));
        });
      }
    },
  );

  context.subscriptions.push(disposable);

  vscode.workspace.onDidChangeTextDocument((event) => {
    if (event.document.uri.scheme === "file") {
      for (const [fileRegex, issues] of Object.entries(compatIssues)) {
        if (minimatch(event.document.fileName, fileRegex, { nocase: true })) {
          checkFile(event.document.uri, issues);
        }
      }
    }
  });
}

export function deactivate() {}
