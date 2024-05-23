import * as fs from "node:fs";
import * as dxl from "../parse/lib";
import * as syntax from "../parse/syntax/red_tree";

const text = fs.readFileSync("samples/sample.dxl", "utf-8");
const lex_items = dxl.tokenize(text);
const parseResult = dxl.parse(lex_items);

for (let i = 0; i < parseResult.errors.length; i++) {
	const err = parseResult.errors[i];
	console.log(err);
}

const green_tree = parseResult.tree;
if (green_tree) {
	console.log(dxl.pp_cst(green_tree));

	const red_tree = new syntax.RedNode(green_tree, 0);
	const nodes = dxl.find.find_references(red_tree, 17);

	if (nodes) {
		console.log("==========");
		for (const node of nodes) {
			console.log(syntax.pp_red_element(node));
		}
	}
}

console.log();
