import * as vscode from "vscode";
import * as dxl from "./parse/lib";
import type { RedNode } from "./parse/syntax/red_tree";

interface ParsedDocuments {
	version: number;
	tree: RedNode;
	symbols: dxl.DxlSymbol[];
	tokens: dxl.DxlSemanticToken[];
}

const diagnostic_collection =
	vscode.languages.createDiagnosticCollection("parser");

const document_map = new Map<string, ParsedDocuments>();

export function removeParsedFile(filename: string) {
	document_map.delete(filename);
}

export function getParsedDocument(
	document: vscode.TextDocument,
): ParsedDocuments | undefined {
	const parsed_document = document_map.get(document.fileName);
	if (parsed_document && parsed_document.version === document.version) {
		return parsed_document;
	}

	diagnostic_collection.clear();

	const res = dxl.getRedTree(document.getText());
	if (res) {
		const diagnostics: vscode.Diagnostic[] = [];
		for (let i = 0; i < res.errors.length; i++) {
			const err = res.errors[i];

			const diagnostic = new vscode.Diagnostic(
				new vscode.Range(
					document.positionAt(err.offset),
					document.positionAt(err.offset),
				),
				err.message,
				vscode.DiagnosticSeverity.Error,
			);

			diagnostics.push(diagnostic);
		}

		diagnostic_collection.set(document.uri, diagnostics);

		const red_tree = res.tree;
		if (red_tree) {
			const symbol_result = dxl.getSymbols(red_tree);
			const parsed = {
				version: document.version,
				tree: red_tree,
				symbols: symbol_result.symbols,
				tokens: symbol_result.tokens,
			};

			document_map.set(document.fileName, parsed);
			return parsed;
		}
	}

	return undefined;
}
