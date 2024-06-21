import * as ast from "./syntax/ast";
import { tokenize } from "./lexer/lexer";
import { RedNode, type RedToken, type Range } from "./syntax/red_tree";
import { OTokenKind } from "./syntax/syntax_kind";
import { type ParseResult, parse } from "./parser/lib";

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
	range: Range;
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
	range: Range;
	selectionRange: Range;
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
				range: keyword.getRange(),
			});
		}
	}

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
				loop(ast_node.decl());
				break;
			}
			case "ParamList": {
				const params = ast_node.params();
				for (const param of params) {
					loop(param);
				}

				break;
			}
			case "ArgList": {
				const arglist = ast_node.args();
				if (arglist) {
					for (const arg of arglist) {
						loop(arg);
					}
				}
				break;
			}
			case "TypeAnnotation": {
				const type_name = ast_node.name();
				if (type_name) {
					tokens.push({
						kind: OSemanticKind.Type,
						modifiers: [],
						range: type_name.getRange(),
					});
				}

				break;
			}
			case "StmtArrayDecl": {
				loop(ast_node.typing());

				const name_ref = ast_node.name();
				if (name_ref) {
					const name = name_ref.name();
					if (name) {
						tokens.push({
							kind: OSemanticKind.Variable,
							modifiers: [],
							range: name.getRange(),
						});
					}
				}

				loop(ast_node.count());

				break;
			}
			case "StmtBlock": {
				for (const stmt of ast_node.stmts()) {
					loop(stmt);
				}
				break;
			}
			case "StmtFor": {
				addKeyword(ast_node.keyword());

				loop(ast_node.initializer());
				loop(ast_node.condition());
				loop(ast_node.increment());
				loop(ast_node.body());
				break;
			}
			case "StmtForIn": {
				addKeyword(ast_node.keyword1());
				addKeyword(ast_node.keyword2());
				addKeyword(ast_node.keyword3());

				loop(ast_node.item());
				loop(ast_node.parent());
				loop(ast_node.body());
				break;
			}
			case "StmtFunctionDecl": {
				loop(ast_node.typing());

				const name_ref = ast_node.name();
				if (name_ref) {
					const name = name_ref.name();
					if (name) {
						symbols.push({
							kind: OSymbolKind.Function,
							range: ast_node.red.getRange(),
							selectionRange: name.getRange(),
							name: name.green.text,
						});

						tokens.push({
							kind: OSemanticKind.Function,
							modifiers: [],
							range: name.getRange(),
						});
					}
				}

				loop(ast_node.params());
				loop(ast_node.body());

				break;
			}
			case "StmtIf": {
				addKeyword(ast_node.keyword1());
				addKeyword(ast_node.keyword2());

				loop(ast_node.condition());
				loop(ast_node.thenBranch());
				loop(ast_node.elseBranch());
				break;
			}
			case "StmtReturn": {
				addKeyword(ast_node.keyword());

				loop(ast_node.expr());
				break;
			}
			case "StmtVariableDecl": {
				loop(ast_node.typing());

				const nameRefs = ast_node.names();
				if (nameRefs) {
					for (const nameRef of nameRefs) {
						loop(nameRef);
					}
				}

				const name_ref = ast_node.name();
				if (name_ref) {
					const name = name_ref.name();
					if (name) {
						tokens.push({
							kind: OSemanticKind.Variable,
							modifiers: [],
							range: name.getRange(),
						});
					}
				}
				break;
			}
			case "StmtWhile": {
				addKeyword(ast_node.keyword());

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
							range: name.getRange(),
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
							range: name.getRange(),
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
				loop(ast_node.typing());
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
							range: name.getRange(),
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
							range: name.getRange(),
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
					switch (value.getKind()) {
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
							range: value.getRange(),
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
						range: name.getRange(),
					});
				}

				break;
			}
			case "ExprNameRefList": {
				const names = ast_node.names();
				if (names) {
					for (const name of names) {
						console.log(name);
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
							range: name.getRange(),
						});
					}
				}

				loop(ast_node.startIndex());
				loop(ast_node.endIndex());

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
							range: name.getRange(),
						});
					}
				}

				loop(ast_node.property());
				loop(ast_node.value());

				break;
			}
			case "ExprArrow": {
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
				loop(ast_node.thenBranch());
				loop(ast_node.elseBranch());
				break;
			}
			case "ExprPostfix": {
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
