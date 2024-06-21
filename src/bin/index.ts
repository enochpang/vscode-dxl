import * as fs from "node:fs";
import * as dxl from "../parse/lib";
import * as syntax from "../parse/syntax/red_tree";

const text = fs.readFileSync("samples/sample.dxl", "utf-8");
const lex_items = dxl.tokenize(text);
const parse_result = dxl.parse(lex_items);

for (let i = 0; i < parse_result.errors.length; i++) {
	const err = parse_result.errors[i];
	console.log(err);
}

const green_tree = parse_result.tree;
if (green_tree) {
	const red_tree = new syntax.RedNode(green_tree, 0);
	console.log(dxl.ppRedTree(red_tree));
}

console.log();
