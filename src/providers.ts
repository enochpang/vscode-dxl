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
								document.positionAt(item.range.start),
								document.positionAt(item.range.end),
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
				tokensBuilder.push(
					new vscode.Range(
						document.positionAt(item.range.start),
						document.positionAt(item.range.end),
					),
					item.kind,
					item.modifiers,
				);
			}
		}

		return tokensBuilder.build();
	}
}

export class DxlRenameProvider implements vscode.RenameProvider {
	provideRenameEdits(
		document: vscode.TextDocument,
		position: vscode.Position,
		newName: string,
		_token: vscode.CancellationToken,
	): vscode.ProviderResult<vscode.WorkspaceEdit> {
		const parsed = getParsedDocument(document);
		if (parsed) {
			const offset = document.offsetAt(position);
			const references = dxl.find.findReferences(parsed.tree, offset);
			if (references) {
				const workspaceEdit = new vscode.WorkspaceEdit();
				for (const reference of references) {
					const range = reference.getRange();

					workspaceEdit.replace(
						document.uri,
						new vscode.Range(
							document.positionAt(range.start),
							document.positionAt(range.end),
						),
						newName,
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
				const range = result.getRange();

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
					const range = result.getRange();

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
