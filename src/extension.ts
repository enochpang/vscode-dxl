import * as vscode from "vscode";
import * as providers from "./providers.ts";
import { getParsedDocument, removeParsedFile } from "./utils.ts";

export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(
		vscode.languages.registerDocumentSymbolProvider(
			{ language: "dxl" },
			new providers.DxlDocumentSymbolProvider(),
		),
	);

	context.subscriptions.push(
		vscode.languages.registerDocumentSemanticTokensProvider(
			{ language: "dxl" },
			new providers.DxlSemanticTokensProvider(),
			providers.token_legend,
		),
	);

	context.subscriptions.push(
		vscode.languages.registerRenameProvider({ language: "dxl" }, new providers.DxlRenameProvider()),
	);

	context.subscriptions.push(
		vscode.languages.registerDefinitionProvider(
			{ language: "dxl" },
			new providers.DxlDefinitionProvider(),
		),
	);

	context.subscriptions.push(
		vscode.languages.registerReferenceProvider(
			{ language: "dxl" },
			new providers.DxlReferenceProvider(),
		),
	);

	context.subscriptions.push(
		vscode.workspace.onDidSaveTextDocument((document) => {
			if (document.languageId === "dxl") {
				getParsedDocument(document);
			}
		}),
	);

	context.subscriptions.push(
		vscode.workspace.onDidCloseTextDocument((document) => {
			removeParsedFile(document.fileName);
		}),
	);
}

export function deactivate() {}
