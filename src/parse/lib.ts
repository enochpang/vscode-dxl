import * as ast from "./syntax/ast";
import { tokenize } from "./lexer/lexer";
import { type ParseResult, parse } from "./parser/events";
import { RedNode } from "./syntax/red_tree";
import type { TextRange } from "./syntax/green_tree";
import { OTokenKind } from "./syntax/syntax_kind";

export const OSemanticKind = {
	Function: "function",
	Variable: "variable",
	String: "string",
	Number: "number",
	Keyword: "keyword",
	Type: "type",
};

/**
 * Represents the type of semantic token
 */
export type SemanticKind = (typeof OSemanticKind)[keyof typeof OSemanticKind];

export const OSemanticModifierKind = {
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
	range: TextRange;
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
	range: TextRange;
	selectionRange: TextRange;
	name: string;
};

type SymbolResult = {
	tokens: DxlSemanticToken[];
	symbols: DxlSymbol[];
};

export function getSymbols(red_tree: RedNode): SymbolResult {
	const tokens: DxlSemanticToken[] = [];
	const symbols: DxlSymbol[] = [];

	function loop(ast_node: ast.AstNode | undefined) {
		if (!ast_node) {
			return;
		}

		switch (ast_node.tag) {
			case "Root": {
				const stmts = ast_node.stmts();
				for (const stmt of stmts) {
					loop(stmt);
				}
				break;
			}
			case "Param": {
				loop(ast_node.expr());
				break;
			}
			case "ParamList": {
				const params = ast_node.params();
				for (const param of params) {
					loop(param);
				}

				break;
			}
			case "StmtArrayDecl": {
				const type_ref = ast_node.typing();
				if (type_ref) {
					const type_name = type_ref.name();
					if (type_name) {
						tokens.push({
							kind: OSemanticKind.Type,
							modifiers: [],
							range: type_name.green.token.getRange(),
						});
					}
				}

				const name_ref = ast_node.name();
				if (name_ref) {
					const name = name_ref.name();
					if (name) {
						tokens.push({
							kind: OSemanticKind.Variable,
							modifiers: [],
							range: name.green.token.getRange(),
						});
					}
				}

				loop(ast_node.count());

				const arglist = ast_node.args();
				if (arglist) {
					for (const arg of arglist.args()) {
						loop(arg);
					}
				}

				break;
			}
			case "StmtBlock": {
				for (const stmt of ast_node.stmts()) {
					loop(stmt);
				}
				break;
			}
			case "StmtExpr": {
				loop(ast_node.expr());
				break;
			}
			case "StmtFor": {
				loop(ast_node.initializer());
				loop(ast_node.condition());
				loop(ast_node.increment());
				loop(ast_node.body());
				break;
			}
			case "StmtForIn": {
				loop(ast_node.item());
				loop(ast_node.parent());
				loop(ast_node.body());
				break;
			}
			case "StmtFunctionDecl": {
				const type_ref = ast_node.typing();
				if (type_ref) {
					const type_name = type_ref.name();
					if (type_name) {
						tokens.push({
							kind: OSemanticKind.Type,
							modifiers: [],
							range: type_name.green.token.getRange(),
						});
					}
				}

				const name_ref = ast_node.name();
				if (name_ref) {
					const name = name_ref.name();
					if (name) {
						symbols.push({
							kind: OSymbolKind.Function,
							range: ast_node.red.green.getRange(),
							selectionRange: name.green.token.getRange(),
							name: name.green.text,
						});

						tokens.push({
							kind: OSemanticKind.Function,
							modifiers: [],
							range: name.green.token.getRange(),
						});
					}
				}

				loop(ast_node.params());
				loop(ast_node.body());

				break;
			}
			case "StmtIf": {
				loop(ast_node.condition());
				loop(ast_node.then_branch());
				loop(ast_node.else_branch());
				break;
			}
			case "StmtReturn": {
				loop(ast_node.expr());
				break;
			}
			case "StmtVariableDecl": {
				const type_ref = ast_node.typing();
				if (type_ref) {
					const type_name = type_ref.name();
					if (type_name) {
						tokens.push({
							kind: OSemanticKind.Type,
							modifiers: [],
							range: type_name.green.token.getRange(),
						});
					}
				}

				const name_ref = ast_node.name();
				if (name_ref) {
					const name = name_ref.name();
					if (name) {
						tokens.push({
							kind: OSemanticKind.Variable,
							modifiers: [],
							range: name.green.token.getRange(),
						});
					}
				}
				break;
			}
			case "StmtWhile": {
				loop(ast_node.condition());
				loop(ast_node.body());
				break;
			}
			case "ExprAssign": {
				const name_ref = ast_node.name();
				if (name_ref) {
					const name = name_ref.name();
					if (name) {
						tokens.push({
							kind: OSemanticKind.Variable,
							modifiers: [],
							range: name.green.token.getRange(),
						});
					}
				}

				loop(ast_node.value());

				break;
			}
			case "ExprBinary": {
				loop(ast_node.lhs());
				loop(ast_node.rhs());
				break;
			}
			case "ExprCall": {
				const name_ref = ast_node.name();
				if (name_ref) {
					const name = name_ref.name();
					if (name) {
						tokens.push({
							kind: OSemanticKind.Function,
							modifiers: [],
							range: name.green.token.getRange(),
						});
					}
				}

				const arglist = ast_node.args();
				if (arglist) {
					for (const arg of arglist.args()) {
						loop(arg);
					}
				}

				break;
			}
			case "ExprCast": {
				const type_ref = ast_node.typing();
				if (type_ref) {
					const type_name = type_ref.name();
					if (type_name) {
						tokens.push({
							kind: OSemanticKind.Type,
							modifiers: [],
							range: type_name.green.token.getRange(),
						});
					}
				}

				loop(ast_node.expr());
				break;
			}
			case "ExprCompare": {
				loop(ast_node.lhs());
				loop(ast_node.rhs());
				break;
			}
			case "ExprGet": {
				const name_ref = ast_node.name();
				if (name_ref) {
					const name = name_ref.name();
					if (name) {
						tokens.push({
							kind: OSemanticKind.Variable,
							modifiers: [],
							range: name.green.token.getRange(),
						});
					}
				}

				loop(ast_node.property());

				break;
			}
			case "ExprGrouping": {
				loop(ast_node.expr());
				break;
			}
			case "ExprIndex": {
				const name_ref = ast_node.name();
				if (name_ref) {
					const name = name_ref.name();
					if (name) {
						tokens.push({
							kind: OSemanticKind.Variable,
							modifiers: [],
							range: name.green.token.getRange(),
						});
					}
				}

				loop(ast_node.index());

				break;
			}
			case "ExprLiteral": {
				const value = ast_node.parse();
				if (value) {
					const modifiers: SemanticModifierKind[] = [];
					let kind: SemanticKind | undefined;
					switch (value.green.token.kind) {
						case OTokenKind.String:
							kind = OSemanticKind.String;
							break;
						case OTokenKind.Integer:
						case OTokenKind.Real:
							kind = OSemanticKind.Number;
							break;
						case OTokenKind.KwTrue:
						case OTokenKind.KwFalse:
							kind = OSemanticKind.Keyword;
							modifiers.push(OSemanticModifierKind.Default);
							break;
					}

					if (kind) {
						tokens.push({
							kind: kind,
							modifiers: modifiers,
							range: value.green.token.getRange(),
						});
					}
				}
				break;
			}
			case "ExprLogical": {
				loop(ast_node.lhs());
				loop(ast_node.rhs());
				break;
			}
			case "ExprNameRef": {
				const name = ast_node.name();
				if (name) {
					tokens.push({
						kind: OSemanticKind.Variable,
						modifiers: [],
						range: name.green.token.getRange(),
					});
				}

				break;
			}
			case "ExprNameRefList": {
				const names = ast_node.names();
				if (names) {
					for (const name of names) {
						loop(name);
					}
				}
				break;
			}
			case "ExprRange": {
				const name_ref = ast_node.name();
				if (name_ref) {
					const name = name_ref.name();
					if (name) {
						tokens.push({
							kind: OSemanticKind.Variable,
							modifiers: [],
							range: name.green.token.getRange(),
						});
					}
				}

				loop(ast_node.start_index());
				loop(ast_node.end_index());

				break;
			}
			case "ExprSet": {
				const name_ref = ast_node.name();
				if (name_ref) {
					const name = name_ref.name();
					if (name) {
						tokens.push({
							kind: OSemanticKind.Variable,
							modifiers: [],
							range: name.green.token.getRange(),
						});
					}
				}

				loop(ast_node.property());
				loop(ast_node.value());

				break;
			}
			case "ExprSetDbe": {
				loop(ast_node.lhs());
				loop(ast_node.rhs());
				break;
			}
			case "ExprStringConcat": {
				loop(ast_node.lhs());
				loop(ast_node.rhs());
				break;
			}
			case "ExprTernary": {
				loop(ast_node.condition());
				loop(ast_node.then_branch());
				loop(ast_node.else_branch());
				break;
			}
			case "ExprUnary": {
				loop(ast_node.expr());
				break;
			}
			case "ExprWrite": {
				loop(ast_node.lhs());
				loop(ast_node.rhs());
				break;
			}
			default:
				break;
		}
	}

	loop(ast.cast(red_tree));

	return {
		tokens: tokens,
		symbols: symbols,
	};
}

export function get_red_tree(text: string): ParseResult<RedNode> | undefined {
	const lex_items = tokenize(text);
	const res = parse(lex_items);

	if (res.tree) {
		const red_tree = new RedNode(res.tree, 0);
		return {
			tree: red_tree,
			errors: res.errors,
		};
	}

	return undefined;
}

export { tokenize } from "./lexer/lexer";
export { parse } from "./parser/events";
export { pp_cst } from "./syntax/green_tree";
export * as find from "./find";
