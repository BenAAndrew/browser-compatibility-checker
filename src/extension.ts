import * as vscode from "vscode";
import {
  findIssues,
  compatIssues,
  CompatIssue,
} from "./browser-compatibility-checker";
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

function scanFiles(){
  for (const [fileRegex, issues] of Object.entries(compatIssues)) {
    vscode.workspace.findFiles(fileRegex).then((files) => {
      files.forEach((file) => checkFile(file, issues));
    });
  }
}

function scanFile(document: vscode.TextDocument) {
  for (const [fileRegex, issues] of Object.entries(compatIssues)) {
    if (minimatch(document.fileName, fileRegex, { nocase: true })) {
      checkFile(document.uri, issues);
    }
  }
}

export function activate(context: vscode.ExtensionContext) {
  scanFiles();
  
  const checkAllFiles = vscode.commands.registerCommand(
    "browser-compatibility-checker.all-files",
    scanFiles,
  );

  context.subscriptions.push(checkAllFiles);

  const checkCurrentFiles = vscode.commands.registerCommand(
    "browser-compatibility-checker.current-file",
    () => {
      const editor = vscode.window.activeTextEditor;
      if (editor) {
        scanFile(editor.document);
      }
    },
  );

  context.subscriptions.push(checkCurrentFiles);

  vscode.workspace.onDidChangeTextDocument((event) => {
    if (event.document.uri.scheme === "file") {
      scanFile(event.document)
    }
  });
}

export function deactivate() {}
