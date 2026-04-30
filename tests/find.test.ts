import assert from 'node:assert'
import test from 'node:test';

import * as path from 'node:path';
import * as fs from "node:fs";
import * as find from "../src/parse/find.ts";
import { tokenize } from "../src/parse/lexer.ts";
import { parse } from "../src/parse/parser.ts";
import { RedNode } from "../src/parse/syntax/red_tree.ts";

test.snapshot.setResolveSnapshotPath(() => {
	const basename = path.basename(import.meta.filename);
	const filename = basename + '.snapshot'
	return path.join(import.meta.dirname, '_snapshots', filename);
});

test.suite("find_01", () => {
	const text = fs.readFileSync("tests/_data/find_01.dxl", "utf-8");
	const lex_result = tokenize(text);
	const parse_result = parse(lex_result);

	const green_tree = parse_result.tree;
	if (!green_tree) assert.fail("Could get green_tree");

	const red_tree = new RedNode(green_tree, 0);

	test.suite("node_aa_ln1", () => {
		const node_aa_ln1 = find.nodeAtOffset(red_tree, 5);
		if (!node_aa_ln1) assert.fail("Could not find node_aa_ln1");

		test("tokenAtOffset", (t) => {
			const token_aa_ln1 = find.tokenAtOffset(red_tree, 5);
			t.assert.snapshot(token_aa_ln1?.toString());
		});

		test("nodeAtOffset", (t) => {
			t.assert.snapshot(node_aa_ln1.toString())
		});

		test("getLevel", () => {
			assert.equal(find.getLevel(node_aa_ln1), 1);
		});

		test("getContainingScope", (t) => {
			const scope_node = find.getContainingScope(node_aa_ln1);
			t.assert.snapshot(scope_node.toString());
		});
	});

	test.suite("node_bb_ln6", () => {
		const node_bb_ln6 = find.nodeAtOffset(red_tree, 51);
		if (!node_bb_ln6) assert.fail("Could not find node_aa_ln1");

		test("tokenAtOffset", (t) => {
			const token_bb_ln6 = find.tokenAtOffset(red_tree, 51);
			t.assert.snapshot(token_bb_ln6?.toString());
		});

		test("nodeAtOffset", (t) => {
			t.assert.snapshot(node_bb_ln6.toString())
		});

		test("getLevel", () => {
			assert.equal(find.getLevel(node_bb_ln6), 2);
		});

		test("getContainingScope", (t) => {
			const scope_node = find.getContainingScope(node_bb_ln6);
			t.assert.snapshot(scope_node.toString());
		});
	});

	test.suite("node_aa_ln10", () => {
		const node_aa_ln10 = find.nodeAtOffset(red_tree, 87);
		if (!node_aa_ln10) assert.fail("Could not find node_aa_ln1");

		test("tokenAtOffset", (t) => {
			const token_aa_ln10 = find.tokenAtOffset(red_tree, 87);
			t.assert.snapshot(token_aa_ln10?.toString());
		});

		test("nodeAtOffset", (t) => {
			t.assert.snapshot(node_aa_ln10.toString())
		});

		test("getLevel", () => {
			assert.equal(find.getLevel(node_aa_ln10), 2);
		});

		test("getContainingScope", (t) => {
			const scope_node = find.getContainingScope(node_aa_ln10);
			t.assert.snapshot(scope_node.toString());
		});
	});

	test.suite("findDefinition", () => {
		const token_bb_ln2 = find.tokenAtOffset(red_tree, 13);
		const token_cc_ln3 = find.tokenAtOffset(red_tree, 21);
		const token_cc_ln11 = find.tokenAtOffset(red_tree, 110);
		const token_aa_ln10 = find.tokenAtOffset(red_tree, 87);

		test("root to root", () => {
			const token_cc_ln22 = find.findDefinition(red_tree, 168);
			if (!token_cc_ln22) assert.fail("Could not find node");

			assert.equal(token_cc_ln22.toString(), token_cc_ln3?.toString());
		});

		test("in function to root", () => {
			const token_bb_ln6 = find.findDefinition(red_tree, 51);
			if (!token_bb_ln6) assert.fail("Could not find node");

			assert.equal(token_bb_ln6.toString(), token_bb_ln2?.toString());
		});

		test("in function to param", () => {
			const token_cc_ln13 = find.findDefinition(red_tree, 120);
			if (!token_cc_ln13) assert.fail("Could not find node");

			assert.equal(token_cc_ln13.toString(), token_aa_ln10?.toString());
		});

		test("in function to in function", () => {
			const token_cc_ln15 = find.findDefinition(red_tree, 136);
			if (!token_cc_ln15) assert.fail("Could not find node");

			assert.equal(token_cc_ln15.toString(), token_cc_ln11?.toString());
		});
	});
});

test.suite("find_02", () => {
	const text = fs.readFileSync("tests/_data/find_02.dxl", "utf-8");
	const lex_result = tokenize(text);
	const parse_result = parse(lex_result);

	const green_tree = parse_result.tree;
	if (!green_tree) assert.fail("Could get green_tree");

	const red_tree = new RedNode(green_tree, 0);

	test.suite("node_at_offset", () => {
		const node_ii_ln1 = find.nodeAtOffset(red_tree, 6);

		test("node_ii_initializer", (t) => {
			t.assert.snapshot(node_ii_ln1?.toString());
		});
	});
});

test.suite("find_03", () => {
	const text = fs.readFileSync("tests/_data/find_03.dxl", "utf-8");
	const lex_result = tokenize(text);
	const parse_result = parse(lex_result);

	const green_tree = parse_result.tree;
	if (!green_tree) assert.fail("Could get green_tree");

	const red_tree = new RedNode(green_tree, 0);

	test.suite("find_references", () => {
		const token_add1_ln1 = find.tokenAtOffset(red_tree, 5);
		const token_add1_ln5 = find.tokenAtOffset(red_tree, 37);

		test("add1_ln1", () => {
			const nodes = find.findReferences(red_tree, 5);
			if (!nodes) assert.fail("Could not find nodes");

			assert.deepStrictEqual(nodes.map((x) => x.toString()),
				[token_add1_ln1, token_add1_ln5].map((x) => x?.toString()),
			);
		});
	});
});

test.suite("find_04", () => {
	const text = fs.readFileSync("tests/_data/find_04.dxl", "utf-8");
	const lex_result = tokenize(text);
	const parse_result = parse(lex_result);

	const green_tree = parse_result.tree;
	if (!green_tree) assert.fail("Could get green_tree");

	const red_tree = new RedNode(green_tree, 0);

	test.suite("find_references", () => {
		const token_obj_ln1 = find.tokenAtOffset(red_tree, 8);
		const token_obj_ln2 = find.tokenAtOffset(red_tree, 17);
		const token_obj_ln3 = find.tokenAtOffset(red_tree, 38);

		test("obj_ln1", () => {
			const nodes = find.findReferences(red_tree, 8);
			if (!nodes) assert.fail("Could not find nodes");

			assert.deepStrictEqual(nodes.map((x) => x.toString()),
				[token_obj_ln1, token_obj_ln2, token_obj_ln3].map((x) => x?.toString()),
			);
		});
	});
});

test.suite("find_05", () => {
	const text = fs.readFileSync("tests/_data/find_05.dxl", "utf-8");
	const lex_result = tokenize(text);
	const parse_result = parse(lex_result);

	const green_tree = parse_result.tree;
	if (!green_tree) assert.fail("Could get green_tree");

	const red_tree = new RedNode(green_tree, 0);

	test.suite("find_references", () => {
		const token_buf_ln1 = find.tokenAtOffset(red_tree, 19);
		const token_buf_ln6 = find.tokenAtOffset(red_tree, 85);

		test("buf_ln1", () => {
			const nodes = find.findReferences(red_tree, 19);
			if (!nodes) assert.fail("Could not find nodes");

			assert.deepStrictEqual(nodes.map((x) => x.toString()),
				[token_buf_ln1, token_buf_ln6].map((x) => x?.toString()),
			);
		});
	});
});