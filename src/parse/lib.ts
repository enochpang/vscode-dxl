import { tokenize } from "./lexer/lexer";
import { type ParseResult, parse } from "./parser/events";
import { RedNode } from "./syntax/red_tree";

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
