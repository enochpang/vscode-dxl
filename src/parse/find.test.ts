import { describe, expect, test, assert } from "vitest";

import * as fs from "node:fs";
import * as find from "./find";
import { tokenize } from "./lexer/lexer";
import { parse } from "./parser/lib";
import { RedNode } from "./syntax/red_tree";

describe("find_01", () => {
	const text = fs.readFileSync("test_data/find_01.dxl", "utf-8");
	const lex_result = tokenize(text);
	const parse_result = parse(lex_result);

	const green_tree = parse_result.tree;
	if (!green_tree) assert.fail("Could get green_tree");

	const red_tree = new RedNode(green_tree, 0);

	const node_aa_ln1 = find.nodeAtOffset(red_tree, 5);
	if (!node_aa_ln1) assert.fail("Could not find node_aa_ln1");

	const node_bb_ln6 = find.nodeAtOffset(red_tree, 46);
	if (!node_bb_ln6) assert.fail("Could not find node_bb_ln6");

	const node_aa_ln10 = find.nodeAtOffset(red_tree, 78);
	if (!node_aa_ln10) assert.fail("Could not find node_aa_ln10");

	describe("tokenAtOffset", () => {
		const token_aa_ln1 = find.tokenAtOffset(red_tree, 5);
		const token_bb_ln6 = find.tokenAtOffset(red_tree, 46);
		const token_aa_ln10 = find.tokenAtOffset(red_tree, 78);

		test("token_aa_ln1", () => {
			expect(token_aa_ln1?.toString()).toMatchInlineSnapshot(
				`"Leaf IDENT@4..6 "aa""`,
			);
		});

		test("token_bb_ln6", () => {
			expect(token_bb_ln6?.toString()).toMatchInlineSnapshot(
				`"Leaf IDENT@45..47 "bb""`,
			);
		});

		test("token_aa_ln10", () => {
			expect(token_aa_ln10?.toString()).toMatchInlineSnapshot(
				`"Leaf IDENT@77..79 "aa""`,
			);
		});
	});

	describe("nodeAtOffset", () => {
		test("node_aa_ln1", () => {
			expect(node_aa_ln1.toString()).toMatchInlineSnapshot(
				`"Node NAMEREF@4..6"`,
			);
		});

		test("node_bb_ln6", () => {
			expect(node_bb_ln6.toString()).toMatchInlineSnapshot(
				`"Node NAMEREF@45..47"`,
			);
		});

		test("node_aa_ln10", () => {
			expect(node_aa_ln10.toString()).toMatchInlineSnapshot(
				`"Node NAMEREF@77..79"`,
			);
		});
	});

	describe("get_level,", () => {
		test("level in root", () => {
			expect(find.getLevel(node_aa_ln1)).toEqual(1);
		});

		test("level in function", () => {
			expect(find.getLevel(node_bb_ln6)).toEqual(2);
		});

		test("level in param", () => {
			expect(find.getLevel(node_aa_ln10)).toEqual(2);
		});
	});

	describe("get_containing_scope", () => {
		test("scope in root", () => {
			const scope_node = find.getContainingScope(node_aa_ln1);
			expect(scope_node.toString()).toMatchInlineSnapshot(
				`"Node TREEROOT@0..148"`,
			);
		});

		test("scope in function", () => {
			const scope_node = find.getContainingScope(node_bb_ln6);
			expect(scope_node.toString()).toMatchInlineSnapshot(
				`"Node STMTBLOCK@39..63"`,
			);
		});

		test("scope in param", () => {
			const scope_node = find.getContainingScope(node_aa_ln10);
			expect(scope_node.toString()).toMatchInlineSnapshot(
				`"Node PARAMLIST@73..87"`,
			);
		});
	});

	describe("find_definition", () => {
		const token_bb_ln2 = find.tokenAtOffset(red_tree, 12);
		const token_cc_ln3 = find.tokenAtOffset(red_tree, 19);
		const token_cc_ln11 = find.tokenAtOffset(red_tree, 100);
		const token_aa_ln10 = find.tokenAtOffset(red_tree, 78);

		test("root to root", () => {
			const token_cc_ln22 = find.findDefinition(red_tree, 147);
			if (!token_cc_ln22) assert.fail("Could not find node");

			expect(token_cc_ln22.toString()).toEqual(token_cc_ln3?.toString());
		});

		test("in function to root", () => {
			const token_bb_ln6 = find.findDefinition(red_tree, 46);
			if (!token_bb_ln6) assert.fail("Could not find node");

			expect(token_bb_ln6.toString()).toEqual(token_bb_ln2?.toString());
		});

		test("in function to param", () => {
			const token_cc_ln13 = find.findDefinition(red_tree, 108);
			if (!token_cc_ln13) assert.fail("Could not find node");

			expect(token_cc_ln13.toString()).toEqual(token_aa_ln10?.toString());
		});

		test("in function to in function", () => {
			const token_cc_ln15 = find.findDefinition(red_tree, 122);
			if (!token_cc_ln15) assert.fail("Could not find node");

			expect(token_cc_ln15.toString()).toEqual(token_cc_ln11?.toString());
		});
	});
});

describe("find_02", () => {
	const text = fs.readFileSync("test_data/find_01.dxl", "utf-8");
	const lex_result = tokenize(text);
	const parse_result = parse(lex_result);

	const green_tree = parse_result.tree;
	if (!green_tree) assert.fail("Could get green_tree");

	const red_tree = new RedNode(green_tree, 0);

	describe("node_at_offset", () => {
		const node_aa_ln1 = find.nodeAtOffset(red_tree, 4);

		test("node_ii_initializer", () => {
			expect(node_aa_ln1?.toString()).toMatchInlineSnapshot(
				`"Node NAMEREF@4..6"`,
			);
		});
	});
});

describe("find_03", () => {
	const text = fs.readFileSync("test_data/find_03.dxl", "utf-8");
	const lex_result = tokenize(text);
	const parse_result = parse(lex_result);

	const green_tree = parse_result.tree;
	if (!green_tree) assert.fail("Could get green_tree");

	const red_tree = new RedNode(green_tree, 0);

	describe("find_references", () => {
		const token_add1_ln1 = find.tokenAtOffset(red_tree, 5);
		const token_add1_ln5 = find.tokenAtOffset(red_tree, 33);

		test("add1_ln1", () => {
			const nodes = find.findReferences(red_tree, 5);
			if (!nodes) assert.fail("Could not find nodes");

			expect(nodes.map((x) => x.toString())).toEqual(
				[token_add1_ln1, token_add1_ln5].map((x) => x?.toString()),
			);
		});
	});
});

describe("find_04", () => {
	const text = fs.readFileSync("test_data/find_04.dxl", "utf-8");
	const lex_result = tokenize(text);
	const parse_result = parse(lex_result);

	const green_tree = parse_result.tree;
	if (!green_tree) assert.fail("Could get green_tree");

	const red_tree = new RedNode(green_tree, 0);

	describe("find_references", () => {
		const token_obj_ln1 = find.tokenAtOffset(red_tree, 8);
		const token_obj_ln2 = find.tokenAtOffset(red_tree, 17);
		const token_obj_ln3 = find.tokenAtOffset(red_tree, 38);

		test("obj_ln1", () => {
			const nodes = find.findReferences(red_tree, 8);
			if (!nodes) assert.fail("Could not find nodes");

			expect(nodes.map((x) => x.toString())).toEqual(
				[token_obj_ln1, token_obj_ln2, token_obj_ln3].map((x) => x?.toString()),
			);
		});
	});
});

describe("find_04", () => {
	const text = fs.readFileSync("test_data/find_05.dxl", "utf-8");
	const lex_result = tokenize(text);
	const parse_result = parse(lex_result);

	const green_tree = parse_result.tree;
	if (!green_tree) assert.fail("Could get green_tree");

	const red_tree = new RedNode(green_tree, 0);

	describe("find_references", () => {
		const token_obj_ln1 = find.tokenAtOffset(red_tree, 19);
		const token_obj_ln6 = find.tokenAtOffset(red_tree, 80);

		test("buf_ln1", () => {
			const nodes = find.findReferences(red_tree, 19);
			if (!nodes) assert.fail("Could not find nodes");

			expect(nodes.map((x) => x.toString())).toEqual(
				[token_obj_ln1, token_obj_ln6].map((x) => x?.toString()),
			);
		});
	});
});
