import * as fs from "node:fs";
import * as dxl from "../parse/lib";

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
}

console.log();
