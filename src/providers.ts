import * as vscode from "vscode";
import * as dxl from "./parse/lib";
import { getParsedDocument } from "./utils";
import { OSemanticKind } from "./parse/lib";

export const token_legend = new vscode.SemanticTokensLegend(
	Object.values(OSemanticKind),
	Object.values(dxl.OSemanticModifierKind),
);

export class DxlDocumentSymbolProvider {
	provideDocumentSymbols(
		document: vscode.TextDocument,
		_token: vscode.CancellationToken,
	): vscode.ProviderResult<
		vscode.DocumentSymbol[] | vscode.SymbolInformation[]
	> {
		return new Promise((resolve, _reject) => {
			const res: vscode.DocumentSymbol[] = [];

			const parsed = getParsedDocument(document);
			if (parsed) {
				for (const item of parsed.symbols) {
					res.push(
						new vscode.DocumentSymbol(
							item.name,
							"",
							vscode.SymbolKind.Function,
							new vscode.Range(
								document.positionAt(item.range.start),
								document.positionAt(item.range.end),
							),
							new vscode.Range(
								document.positionAt(item.selectionRange.start),
								document.positionAt(item.selectionRange.end),
							),
						),
					);
				}
			}

			return resolve(res);
		});
	}
}

export class DxlSemanticTokensProvider
	implements vscode.DocumentSemanticTokensProvider
{
	onDidChangeSemanticTokens?: vscode.Event<void>;
	provideDocumentSemanticTokens(
		document: vscode.TextDocument,
		_token: vscode.CancellationToken,
	): vscode.ProviderResult<vscode.SemanticTokens> {
		const tokensBuilder = new vscode.SemanticTokensBuilder(token_legend);

		const parsed = getParsedDocument(document);
		if (parsed) {
			for (const item of parsed.tokens) {
				const range = new vscode.Range(
					document.positionAt(item.range.start),
					document.positionAt(item.range.end),
				);

				// Semantic tokens can only span a single line.
				if (range.start.line !== range.end.line) {
					let new_start_offset = item.range.start;

					const text = document.getText(range);
					const lines = text.split("\n");
					for (const line of lines) {
						const line_length = line.length;
						const new_end_offset = new_start_offset + line_length;

						const new_range = new vscode.Range(
							document.positionAt(new_start_offset),
							document.positionAt(new_end_offset),
						);

						tokensBuilder.push(new_range, item.kind, item.modifiers);

						new_start_offset = new_end_offset + 1;
					}
				} else {
					tokensBuilder.push(range, item.kind, item.modifiers);
				}
			}
		}

		return tokensBuilder.build();
	}
}

export class DxlRenameProvider implements vscode.RenameProvider {
	provideRenameEdits(
		document: vscode.TextDocument,
		position: vscode.Position,
		new_name: string,
		_token: vscode.CancellationToken,
	): vscode.ProviderResult<vscode.WorkspaceEdit> {
		const parsed = getParsedDocument(document);
		if (parsed) {
			const offset = document.offsetAt(position);
			const references = dxl.find.findReferences(parsed.tree, offset);
			if (references) {
				const workspaceEdit = new vscode.WorkspaceEdit();
				for (const reference of references) {
					const range = reference.getOffsetRange();

					workspaceEdit.replace(
						document.uri,
						new vscode.Range(
							document.positionAt(range.start),
							document.positionAt(range.end),
						),
						new_name,
					);
				}

				return workspaceEdit;
			}
		}

		throw new Error("Method not implemented.");
	}
}

export class DxlDefinitionProvider implements vscode.DefinitionProvider {
	provideDefinition(
		document: vscode.TextDocument,
		position: vscode.Position,
		_token: vscode.CancellationToken,
	): vscode.ProviderResult<vscode.Definition | vscode.LocationLink[]> {
		const parsed = getParsedDocument(document);
		if (parsed) {
			const offset = document.offsetAt(position);
			const result = dxl.find.findDefinition(parsed.tree, offset);
			if (result) {
				const range = result.getOffsetRange();

				const location = new vscode.Location(
					document.uri,
					new vscode.Range(
						document.positionAt(range.start),
						document.positionAt(range.end),
					),
				);

				return location;
			}
		}

		throw new Error("Method not implemented.");
	}
}

export class DxlReferenceProvider implements vscode.ReferenceProvider {
	provideReferences(
		document: vscode.TextDocument,
		position: vscode.Position,
		_context: vscode.ReferenceContext,
		_token: vscode.CancellationToken,
	): vscode.ProviderResult<vscode.Location[]> {
		const locations: vscode.Location[] = [];

		const parsed = getParsedDocument(document);
		if (parsed) {
			const offset = document.offsetAt(position);
			const results = dxl.find.findReferences(parsed.tree, offset);
			if (results) {
				for (const result of results) {
					const range = result.getOffsetRange();

					const location = new vscode.Location(
						document.uri,
						new vscode.Range(
							document.positionAt(range.start),
							document.positionAt(range.end),
						),
					);

					locations.push(location);
				}
			}

			return locations;
		}

		throw new Error("Method not implemented.");
	}
}
