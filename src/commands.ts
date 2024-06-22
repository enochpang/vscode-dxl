import * as dxl from "./parse/lib";
import { RedNode } from "./parse/syntax/red_tree";

export function showCst(text: string) {
	const lex_result = dxl.tokenize(text);
	const parse_result = dxl.parse(lex_result);

	const green_tree = parse_result.tree;
	if (green_tree) {
		const red_tree = new RedNode(green_tree, 0);
		console.log(dxl.ppRedTree(red_tree));
	}
}
