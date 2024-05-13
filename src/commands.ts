import * as dxl from "./parse/lib";

export function show_cst(text: string) {
	const lex_items = dxl.tokenize(text);
	const res = dxl.parse(lex_items);
	const cst = res.tree;
	if (cst) {
		console.log(dxl.pp_cst(cst));
	}
}
