import * as ast from "./syntax/ast";
import { tokenize } from "./lexer/lexer";
import { type ParseResult, parse } from "./parser/events";
import { RedNode, type RedToken } from "./syntax/red_tree";
import type { TextRange } from "./syntax/green_tree";

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

interface SemanticFunction {
	range: TextRange;
	selectionRange: TextRange;
	name: string;
}

export function get_semantic_tokens(red_tree: RedNode) {
	function loop(
		depth: number,
		ast_node: ast.AstNode | undefined,
		acc: SemanticFunction[],
	) {
		if (!ast_node) {
			return acc;
		}

		switch (ast_node.tag) {
			case "Root": {
				const stmts = ast_node.stmts();
				for (const stmt of stmts) {
					loop(depth + 1, stmt, acc);
				}
				break;
			}
			case "StmtFunctionDecl": {
				const nameRef = ast_node.name();
				if (nameRef) {
					const name = nameRef.name();
					if (name) {
						acc.push({
							range: ast_node.red.green.getRange(),
							selectionRange: name.green.token.getRange(),
							name: name.green.text,
						});
					}
				}

				loop(depth + 1, ast_node.params(), acc);
				loop(depth + 1, ast_node.body(), acc);

				break;
			}
			case "ParamList": {
				const params = ast_node.params();
				for (const param of params) {
					loop(depth + 1, param, acc);
				}

				break;
			}
			case "Param": {
				loop(depth + 1, ast_node.expr(), acc);
				break;
			}
			case "StmtBlock": {
				const stmts = ast_node.stmts();
				for (const stmt of stmts) {
					loop(depth + 1, stmt, acc);
				}
				break;
			}
			default:
				break;
		}

		return acc;
	}

	return loop(0, ast.cast(red_tree), []);
}

export { tokenize } from "./lexer/lexer";
export { parse } from "./parser/events";
export { pp_cst } from "./syntax/green_tree";
export * as find from "./find";
