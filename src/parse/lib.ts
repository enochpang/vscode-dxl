import * as ast from "./syntax/ast";
import { tokenize } from "./lexer/lexer";
import { RedNode, type RedToken, type OffsetRange } from "./syntax/red_tree";
import { OTokenKind } from "./syntax/syntax_kind";
import { type ParseResult, parse } from "./parser/lib";

export const OSemanticKind = {
	Function: "function",
	Variable: "variable",
	String: "string",
	Number: "number",
	Keyword: "keyword",
	Type: "type",
	Comment: "comment",
};

/**
 * Represents the type of semantic token
 */
export type SemanticKind = (typeof OSemanticKind)[keyof typeof OSemanticKind];

export const OSemanticModifierKind = {
	Readonly: "readonly",
	Default: "defaultLibrary",
};

/**
 * Represents the type of semantic token modifier
 */
export type SemanticModifierKind =
	(typeof OSemanticModifierKind)[keyof typeof OSemanticModifierKind];

export type DxlSemanticToken = {
	kind: SemanticKind;
	modifiers: SemanticModifierKind[];
	range: OffsetRange;
};

export const OSymbolKind = {
	Function: "function",
};

/**
 * Represents the type of symbol
 */
export type SymbolKind = (typeof OSymbolKind)[keyof typeof OSymbolKind];

export type DxlSymbol = {
	kind: SymbolKind;
	range: OffsetRange;
	selectionRange: OffsetRange;
	name: string;
};

type SymbolResult = {
	tokens: DxlSemanticToken[];
	symbols: DxlSymbol[];
};

export function getSymbols(red_tree: RedNode): SymbolResult {
	const tokens: DxlSemanticToken[] = [];
	const symbols: DxlSymbol[] = [];

	function addKeyword(keyword: RedToken | undefined) {
		if (keyword) {
			tokens.push({
				kind: OSemanticKind.Keyword,
				modifiers: [],
				range: keyword.getOffsetRange(),
			});
		}
	}

	function loop(node: ast.AstNode | undefined) {
		if (!node) {
			return;
		}

		for (const red of node.red.children()) {
			if (red.getKind() === OTokenKind.Comment) {
				tokens.push({
					kind: OSemanticKind.Comment,
					modifiers: [],
					range: red.getOffsetRange(),
				});
			}
		}

		if (node) {
			switch (node.tag) {
				case "Root":
					for (const child of node.stmts()) {
						loop(child);
					}
					break;
				case "ArgList":
					for (const child of node.args()) {
						loop(child);
					}
					break;
				case "Arg":
					loop(node.expr());
					break;
				case "ParamList":
					for (const child of node.params()) {
						loop(child);
					}
					break;
				case "Param":
					loop(node.decl());
					break;
				case "TypeAnnotation": {
					const type_name = node.name();
					if (type_name) {
						tokens.push({
							kind: OSemanticKind.Type,
							modifiers: [],
							range: type_name.getOffsetRange(),
						});
					}
					break;
				}
				case "StmtArrayDecl":
					loop(node.typing());
					loop(node.name());
					loop(node.count());
					loop(node.args());
					break;
				case "StmtBlock":
					for (const child of node.stmts()) {
						loop(child);
					}
					break;
				case "StmtBreak":
					addKeyword(node.keyword());
					break;
				case "StmtContinue":
					break;
				case "StmtExpr":
					loop(node.expr());
					break;
				case "StmtFor":
					addKeyword(node.keyword());

					loop(node.initializer());
					loop(node.condition());
					loop(node.increment());
					loop(node.body());
					break;
				case "StmtForIn":
					addKeyword(node.keyword1());
					addKeyword(node.keyword2());
					addKeyword(node.keyword3());

					loop(node.item());
					loop(node.parent());
					loop(node.body());
					break;
				case "StmtFunctionDecl": {
					const name_ref = node.name();
					if (name_ref) {
						const name = name_ref.name();
						if (name) {
							symbols.push({
								kind: OSymbolKind.Function,
								range: node.red.getOffsetRange(),
								selectionRange: name.getOffsetRange(),
								name: name.getText(),
							});

							tokens.push({
								kind: OSemanticKind.Function,
								modifiers: [],
								range: name.getOffsetRange(),
							});
						}
					}

					loop(node.typing());
					loop(node.params());
					loop(node.body());
					break;
				}
				case "StmtIf":
					addKeyword(node.keyword1());
					addKeyword(node.keyword2());

					loop(node.condition());
					loop(node.thenBranch());
					loop(node.elseBranch());
					break;
				case "StmtReturn":
					addKeyword(node.keyword());

					loop(node.expr());
					break;
				case "StmtVariableDecl": {
					loop(node.typing());
					loop(node.name());
					loop(node.value());

					const names = node.names();
					if (names) {
						for (const child of names) {
							loop(child);
						}
					}
					break;
				}
				case "StmtWhile":
					addKeyword(node.keyword());

					loop(node.condition());
					loop(node.body());
					break;
				case "ExprArrow":
					loop(node.lhs());
					loop(node.rhs());
					break;
				case "ExprAssign":
					loop(node.name());
					loop(node.value());
					break;
				case "ExprBinary":
					loop(node.lhs());
					loop(node.rhs());
					break;
				case "ExprCall": {
					const name_ref = node.name();
					if (name_ref) {
						const name = name_ref.name();
						if (name) {
							tokens.push({
								kind: OSemanticKind.Function,
								modifiers: [],
								range: name.getOffsetRange(),
							});
						}
					}

					loop(node.args());
					break;
				}
				case "ExprCast":
					loop(node.typing());
					loop(node.expr());
					break;
				case "ExprCompare":
					loop(node.lhs());
					loop(node.rhs());
					break;
				case "ExprGet":
					loop(node.name());
					loop(node.property());
					break;
				case "ExprGrouping":
					loop(node.expr());
					break;
				case "ExprIndex":
					loop(node.name());
					loop(node.index());
					break;
				case "ExprLiteral": {
					const value = node.parse();
					if (value) {
						let kind: SemanticKind | undefined;
						switch (value.getKind()) {
							case OTokenKind.String:
								kind = OSemanticKind.String;
								break;
							case OTokenKind.Integer:
							case OTokenKind.Real:
								kind = OSemanticKind.Number;
								break;
						}

						if (kind) {
							tokens.push({
								kind: kind,
								modifiers: [],
								range: value.getOffsetRange(),
							});
						}
					}
					break;
				}
				case "ExprLogical":
					loop(node.lhs());
					loop(node.rhs());
					break;
				case "ExprNameRef": {
					const name = node.name();
					if (name) {
						tokens.push({
							kind: OSemanticKind.Variable,
							modifiers: [],
							range: name.getOffsetRange(),
						});
					}
					break;
				}
				case "ExprNameRefList": {
					const names = node.names();
					if (names) {
						for (const child of names) {
							loop(child);
						}
					}
					break;
				}
				case "ExprPostfix":
					loop(node.expr());
					break;
				case "ExprPrefix":
					loop(node.expr());
					break;
				case "ExprStringConcat":
					loop(node.lhs());
					loop(node.rhs());
					break;
				case "ExprTernary":
					loop(node.condition());
					loop(node.thenBranch());
					loop(node.elseBranch());
					break;
				case "ExprWrite":
					loop(node.lhs());
					loop(node.rhs());
					break;
			}
		}
	}

	const root = ast.cast(red_tree);
	loop(root);

	return {
		tokens: tokens,
		symbols: symbols,
	};
}

export function getRedTree(text: string): ParseResult<RedNode> | undefined {
	const lex_result = tokenize(text);
	const parse_result = parse(lex_result);

	if (parse_result.tree) {
		const red_tree = new RedNode(parse_result.tree, 0);
		return {
			tree: red_tree,
			errors: parse_result.errors,
		};
	}

	return undefined;
}

export { tokenize } from "./lexer/lexer";
export { parse } from "./parser/lib";
export { ppGreenTree } from "./syntax/green_tree";
export { ppRedTree } from "./syntax/red_tree";
export * as find from "./find";
