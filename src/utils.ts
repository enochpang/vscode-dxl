import * as vscode from "vscode";
import * as dxl from "./parse/lib";
import type { RedNode } from "./parse/syntax/red_tree";

interface ParsedDocuments {
	version: number;
	tree: RedNode;
}

const diagnosticCollection =
	vscode.languages.createDiagnosticCollection("parser");

const documentMap = new Map<string, ParsedDocuments>();

export function remove_parsedFile(filename: string) {
	documentMap.delete(filename);
}

export function get_parsedFile(
	document: vscode.TextDocument,
): RedNode | undefined {
	const parsed = documentMap.get(document.fileName);
	if (parsed && parsed.version === document.version) {
		return parsed.tree;
	}

	diagnosticCollection.clear();

	const res = dxl.get_red_tree(document.getText());
	if (res) {
		const diagnostics: vscode.Diagnostic[] = [];
		for (let i = 0; i < res.errors.length; i++) {
			const err = res.errors[i];

			const diagnostic = new vscode.Diagnostic(
				new vscode.Range(
					new vscode.Position(err.tok.start_loc.line, err.tok.start_loc.col),
					new vscode.Position(err.tok.end_loc.line, err.tok.end_loc.col),
				),
				err.msg,
				vscode.DiagnosticSeverity.Error,
			);

			diagnostics.push(diagnostic);
		}

		diagnosticCollection.set(document.uri, diagnostics);

		const red_tree = res.tree;
		if (red_tree) {
			documentMap.set(document.fileName, {
				version: document.version,
				tree: red_tree,
			});
		}

		return red_tree;
	}

	return undefined;
}
