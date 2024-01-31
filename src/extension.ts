import * as vscode from "vscode";
import { findIssues, compatIssues, CompatIssue } from "./browser-compatibility-checker";
import { minimatch } from "minimatch";

const collections: { [key: string]: vscode.DiagnosticCollection } = {};

function checkFile(file: vscode.Uri, issues: { [key: string]: CompatIssue }) {
  const uri = vscode.Uri.file(file.path);
  if (collections[uri.toString()]) {
    collections[uri.toString()].delete(uri);
  }
  vscode.workspace.openTextDocument(file).then((doc) => {
    const text = doc.getText();
    const matches = findIssues(text, issues);
    const diagnostics = matches.map(({index, message, isError}) => {
      const position = doc.positionAt(index);
      const range = new vscode.Range(position, position);
      return new vscode.Diagnostic(range, message, isError ? vscode.DiagnosticSeverity.Error : vscode.DiagnosticSeverity.Warning);
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
