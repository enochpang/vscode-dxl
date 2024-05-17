import { describe, expect, test, assert } from "vitest";

import * as fs from "node:fs";
import { tokenize } from "./lexer/lexer";
import { parse } from "./parser/events";
import { RedNode, pp_red_element } from "./syntax/red_tree";
import * as find from "./find";

describe("find_01", () => {
	const text = fs.readFileSync("test_data/find_01.dxl", "utf-8");
	const lex_items = tokenize(text);
	const parseResult = parse(lex_items);

	const green_tree = parseResult.tree;
	if (!green_tree) assert.fail("Could get green_tree");

	const red_tree = new RedNode(green_tree, 0);

	const node_aa_ln1 = find.node_at_offset(red_tree, 5);
	if (!node_aa_ln1) assert.fail("Could not find node_aa_ln1");

	const node_bb_ln6 = find.node_at_offset(red_tree, 51);
	if (!node_bb_ln6) assert.fail("Could not find node_bb_ln6");

	const node_aa_ln10 = find.node_at_offset(red_tree, 87);
	if (!node_aa_ln10) assert.fail("Could not find node_aa_ln10");

	describe("token_at_offset", () => {
		const token_aa_ln1 = find.token_at_offset(red_tree, 5);
		if (!token_aa_ln1) assert.fail("Could not find token_aa_ln1");

		const token_bb_ln6 = find.token_at_offset(red_tree, 51);
		if (!token_bb_ln6) assert.fail("Could not find token_bb_ln6");

		const token_aa_ln10 = find.token_at_offset(red_tree, 87);
		if (!token_aa_ln10) assert.fail("Could not find token_aa_ln10");

		test("token_aa_ln1", () => {
			expect(pp_red_element(token_aa_ln1)).toMatchInlineSnapshot(
				`"Leaf IDENT@4..6 "aa""`,
			);
		});

		test("token_bb_ln6", () => {
			expect(pp_red_element(token_bb_ln6)).toMatchInlineSnapshot(
				`"Leaf IDENT@50..52 "bb""`,
			);
		});

		test("token_aa_ln10", () => {
			expect(pp_red_element(token_aa_ln10)).toMatchInlineSnapshot(
				`"Leaf IDENT@86..88 "aa""`,
			);
		});
	});

	describe("node_at_offset", () => {
		test("node_aa_ln1", () => {
			expect(pp_red_element(node_aa_ln1)).toMatchInlineSnapshot(
				`"Node NAMEREF@4..6"`,
			);
		});

		test("node_bb_ln6", () => {
			expect(pp_red_element(node_bb_ln6)).toMatchInlineSnapshot(
				`"Node NAMEREF@50..52"`,
			);
		});

		test("node_aa_ln10", () => {
			expect(pp_red_element(node_aa_ln10)).toMatchInlineSnapshot(
				`"Node NAMEREF@86..88"`,
			);
		});
	});

	describe("get_level,", () => {
		test("level in root", () => {
			expect(find.get_level(node_aa_ln1)).toEqual(1);
		});

		test("level in function", () => {
			expect(find.get_level(node_bb_ln6)).toEqual(2);
		});

		test("level in param", () => {
			expect(find.get_level(node_aa_ln10)).toEqual(2);
		});
	});

	describe("get_containing_scope", () => {
		test("scope in root", () => {
			const scope_node = find.get_containing_scope(node_aa_ln1);
			expect(pp_red_element(scope_node)).toMatchInlineSnapshot(
				`"Node TREEROOT@0..169"`,
			);
		});

		test("scope in function", () => {
			const scope_node = find.get_containing_scope(node_bb_ln6);
			expect(pp_red_element(scope_node)).toMatchInlineSnapshot(
				`"Node STMTBLOCK@43..70"`,
			);
		});

		test("scope in param", () => {
			const scope_node = find.get_containing_scope(node_aa_ln10);
			expect(pp_red_element(scope_node)).toMatchInlineSnapshot(
				`"Node PARAMLIST@82..96"`,
			);
		});
	});

	// TODO get_same_decl_name

	// TODO get_same_assign_name

	describe("find_definition", () => {
		const token_bb_ln2 = find.token_at_offset(red_tree, 13);
		if (!token_bb_ln2) assert.fail("Could not find token_bb_ln2");

		const token_cc_ln3 = find.token_at_offset(red_tree, 21);
		if (!token_cc_ln3) assert.fail("Could not find token_cc_ln3");

		const token_cc_ln11 = find.token_at_offset(red_tree, 110);
		if (!token_cc_ln11) assert.fail("Could not find token_cc_ln11");

		const token_aa_ln10 = find.token_at_offset(red_tree, 87);
		if (!token_aa_ln10) assert.fail("Could not find token_aa_ln10");

		test("root to root", () => {
			const node = find.find_definition(red_tree, 168);
			if (!node) assert.fail("Could not find node");

			expect(pp_red_element(node)).toEqual(pp_red_element(token_cc_ln3));
		});

		test("in function to root", () => {
			const node = find.find_definition(red_tree, 51);
			if (!node) assert.fail("Could not find node");

			expect(pp_red_element(node)).toEqual(pp_red_element(token_bb_ln2));
		});

		test("in function to param", () => {
			const node = find.find_definition(red_tree, 120);
			if (!node) assert.fail("Could not find node");

			expect(pp_red_element(node)).toEqual(pp_red_element(token_aa_ln10));
		});

		test("in function to in function", () => {
			const node = find.find_definition(red_tree, 136);
			if (!node) assert.fail("Could not find node");

			expect(pp_red_element(node)).toEqual(pp_red_element(token_cc_ln11));
		});
	});

	// TODO find_references
	describe("find_references", () => {
		const token_cc_ln3 = find.token_at_offset(red_tree, 21);
		if (!token_cc_ln3) assert.fail("Could not find token_cc_ln3");

		const token_cc_ln5 = find.token_at_offset(red_tree, 40);
		if (!token_cc_ln5) assert.fail("Could not find token_cc_ln5");

		const token_cc_ln7 = find.token_at_offset(red_tree, 66);
		if (!token_cc_ln7) assert.fail("Could not find token_cc_ln7");

		const token_cc_ln18 = find.token_at_offset(red_tree, 149);
		if (!token_cc_ln18) assert.fail("Could not find token_cc_ln18");

		const token_cc_ln22 = find.token_at_offset(red_tree, 168);
		if (!token_cc_ln22) assert.fail("Could not find token_cc_ln22");

		test("cc_ln3", () => {
			const nodes = find.find_references(red_tree, 21);
			if (!nodes) assert.fail("Could not find node");

			expect(nodes.map((x) => pp_red_element(x))).toEqual(
				[token_cc_ln3, token_cc_ln18, token_cc_ln22].map((x) =>
					pp_red_element(x),
				),
			);
		});

		test("cc_ln5", () => {
			const nodes = find.find_references(red_tree, 40);
			if (!nodes) assert.fail("Could not find node");

			expect(nodes.map((x) => pp_red_element(x))).toEqual(
				[token_cc_ln5, token_cc_ln7].map((x) => pp_red_element(x)),
			);
		});
	});

	// TODO get_functions
});
