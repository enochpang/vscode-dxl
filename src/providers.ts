import * as vscode from "vscode";
import * as dxl from "./parse/lib";
import { get_parsedFile } from "./utils";

export class DxlDocumentSymbolProvider {
	provideDocumentSymbols(
		document: vscode.TextDocument,
		_token: vscode.CancellationToken,
	): vscode.ProviderResult<
		vscode.DocumentSymbol[] | vscode.SymbolInformation[]
	> {
		return new Promise((resolve, _reject) => {
			const res: vscode.DocumentSymbol[] = [];

			const tree = get_parsedFile(document);
			if (tree) {
				const stmts = dxl.find.get_functions(tree);

				for (const item of stmts) {
					const [stmt, name] = item;

					const stmt_start = stmt.node.green.get_start_loc();
					const stmt_end = stmt.node.green.get_end_loc();

					const name_start = name.green.token.start_loc;
					const name_end = name.green.token.end_loc;

					res.push(
						new vscode.DocumentSymbol(
							name.green.text,
							"",
							vscode.SymbolKind.Function,
							new vscode.Range(
								new vscode.Position(stmt_start.line, stmt_start.col),
								new vscode.Position(stmt_end.line, stmt_end.col),
							),
							new vscode.Range(
								new vscode.Position(name_start.line, name_start.col),
								new vscode.Position(name_end.line, name_end.col),
							),
						),
					);
				}
			}

			return resolve(res);
		});
	}
}

export class DxlDefinitionProvider implements vscode.DefinitionProvider {
	provideDefinition(
		document: vscode.TextDocument,
		position: vscode.Position,
		_token: vscode.CancellationToken,
	): vscode.ProviderResult<vscode.Definition | vscode.LocationLink[]> {
		const tree = get_parsedFile(document);
		if (tree) {
			const offset = document.offsetAt(position);
			const res = dxl.find.find_reference(tree, offset);
			if (res) {
				const token = res.green.token;
				const start = token.start_loc;
				const end = token.end_loc;
				const location = new vscode.Location(
					document.uri,
					new vscode.Range(
						new vscode.Position(start.line, start.col),
						new vscode.Position(end.line, end.col),
					),
				);

				return location;
			}
		}

		throw new Error("Method not implemented.");
	}
}
