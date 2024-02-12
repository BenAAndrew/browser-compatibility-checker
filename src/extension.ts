import * as vscode from "vscode";
import {
  findIssues,
  CompatIssue,
  getBrowsersList,
} from "./browser-compatibility-checker";
import { minimatch } from "minimatch";

const compatIssues: {
  [path: string]: { [key: string]: CompatIssue };
} = require("./browser-compatibility-checker/compat-issues.json");
const collections: { [key: string]: vscode.DiagnosticCollection } = {};

type Config = {
  enableOnChange: boolean;
  warnForOtherBrowsers: boolean;
  useError: boolean;
  browsersToCheck: string[];
  foldersToIgnore: string[];
};

function checkFile(
  file: vscode.Uri,
  issues: { [key: string]: CompatIssue },
  { browsersToCheck, foldersToIgnore, warnForOtherBrowsers, useError }: Config,
) {
  const uri = vscode.Uri.file(file.path);
  if (collections[uri.toString()]) {
    collections[uri.toString()].delete(uri);
  }
  if (
    foldersToIgnore.some((folder) =>
      minimatch(file.path, folder, { nocase: true }),
    )
  ) {
    return;
  }
  vscode.workspace.openTextDocument(file).then((doc) => {
    const text = doc.getText();
    const matches = findIssues(
      text,
      issues,
      browsersToCheck,
      warnForOtherBrowsers,
    );
    const diagnostics = matches.map(({ index, message, isError, mdnUrl }) => {
      const position = doc.positionAt(index);
      const range = new vscode.Range(position, position);
      const diagnostic = new vscode.Diagnostic(
        range,
        message,
        isError && useError
          ? vscode.DiagnosticSeverity.Error
          : vscode.DiagnosticSeverity.Warning,
      );
      if (mdnUrl) {
        diagnostic.relatedInformation = [
          new vscode.DiagnosticRelatedInformation(
            new vscode.Location(vscode.Uri.parse(mdnUrl), range),
            "MDN Documentation",
          ),
        ];
      }

      return diagnostic;
    });
    const ws = vscode.workspace.getWorkspaceFolder(uri);
    const collection = vscode.languages.createDiagnosticCollection(
      ws?.name || "",
    );
    collection.set(uri, diagnostics);
    collections[uri.toString()] = collection;
  });
}

function scanFiles(config: Config) {
  for (const [fileRegex, issues] of Object.entries(compatIssues)) {
    vscode.workspace.findFiles(fileRegex).then((files) => {
      files.forEach((file) => checkFile(file, issues, config));
    });
  }
}

function scanFile(document: vscode.TextDocument, config: Config) {
  for (const [fileRegex, issues] of Object.entries(compatIssues)) {
    if (minimatch(document.fileName, fileRegex, { nocase: true })) {
      checkFile(document.uri, issues, config);
    }
  }
}

export function activate(context: vscode.ExtensionContext) {
  const vscodeConfig = vscode.workspace.getConfiguration(
    "browser-compatibility-checker",
  );
  let browsersToCheck = vscodeConfig.browsersToCheck;
  if (vscode.workspace.workspaceFolders) {
    const detectedBrowsersList = getBrowsersList(
      vscode.workspace.workspaceFolders![0].uri.fsPath,
    );
    if (detectedBrowsersList && detectedBrowsersList.length > 0) {
      vscode.window.showInformationMessage("Using detected browserslist");
      browsersToCheck = detectedBrowsersList;
    }
  }
  const config: Config = {
    enableOnChange: vscodeConfig.enableOnChange,
    warnForOtherBrowsers: vscodeConfig.warnForOtherBrowsers,
    useError: vscodeConfig.useError,
    browsersToCheck,
    foldersToIgnore: vscodeConfig.foldersToIgnore,
  };

  if (config.enableOnChange) {
    scanFiles(config);
  }

  const checkAllFiles = vscode.commands.registerCommand(
    "browser-compatibility-checker.all-files",
    () => scanFiles(config),
  );
  context.subscriptions.push(checkAllFiles);

  const checkCurrentFiles = vscode.commands.registerCommand(
    "browser-compatibility-checker.current-file",
    () => {
      const editor = vscode.window.activeTextEditor;
      if (editor) {
        scanFile(editor.document, config);
      }
    },
  );
  context.subscriptions.push(checkCurrentFiles);

  if (config.enableOnChange) {
    vscode.workspace.onDidChangeTextDocument((event) => {
      if (event.document.uri.scheme === "file") {
        scanFile(event.document, config);
      }
    });
  }
}

export function deactivate() {}
