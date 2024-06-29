import type { LexResult } from "../lexer/lexer";
import type { GreenNode } from "../syntax/green_tree";
import { buildTree } from "./events";
import { Parser } from "./parser";

export type ParseResult<T> = {
	tree: T | undefined;
	errors: ParseError[];
};

export type ParseError = {
	offset: number;
	message: string;
};

export function parse(lex_result: LexResult): ParseResult<GreenNode> {
	const tokens = lex_result.tokens;
	const parser = new Parser(tokens);
	const events = parser.parse();
	const [tree, errors] = buildTree(lex_result, events);

	return {
		tree: tree,
		errors: errors,
	};
}
