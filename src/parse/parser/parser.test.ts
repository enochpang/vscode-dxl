import { expect, test } from "vitest";
import { tokenize } from "../lexer/lexer";
import { parse } from "./events";
import { pp_cst } from "../syntax/green_tree";

check_parse("1 + 2");
check_parse("1 + 2 + 3");
check_parse("1 + 2 * 3");
check_parse("(1 + 2) * 3");
check_parse("1 + 2; 3 + 4");
check_parse("(int key sk)");
check_parse("current Object");
check_parse("true || false");
check_parse("i++");
check_parse("-1 * 2");
check_parse("a < 2 ? 3 : 4");
check_parse("a = 2");
check_parse("a += 2");
check_parse("sum(1, 2)");
check_parse("print square 2");
check_parse("null obj");
check_parse("null(obj)");
check_parse("arr[1]");
check_parse('obj."text"');
check_parse("ad.object");
check_parse('obj."number" = 2');
check_parse('dbe->"left"->"form"');
check_parse('dbe->"left"->"flush"->dbe2');
check_parse('lnk<-"*"');
check_parse('lnk->"*"');
check_parse("str[0:2]");
check_parse("str[0:]");
check_parse('2 ""');
check_parse('major(b) "" minor(b) ""');
check_parse('"hello" //-\n"world"');
check_parse('out << "hello" << "world"');
check_parse('out << "hello"\nout << "world"');
check_parse("return a");
check_parse("if (a < 2) {\n    a + 1\n}");
check_parse("if (true) 1 else 2");
check_parse("if (a < 2) return");
check_parse("if (a < 2) return 2");
check_parse("if (a < 2) continue");
check_parse("if (a < 2) { a + 1 } else { b + 2 }");
check_parse("if (a) { 1 } else if (b) { 2 }");
check_parse("if (isDeleted module(modVersion)) {}");
check_parse("while (a < 2) {\n    a + 1\n}");
check_parse("while (a < 2) {\n    a + 1\n    break\n}");
check_parse("for (i = 0; i < 4; i++) {\n    a + 1\n}");
check_parse("for obj in mod do {}");
check_parse('for lnk in obj<-"*" do {}');
check_parse("int a = 2");
check_parse("int a");
check_parse("int sum(int a, int b) {\n    return a + b\n}");
check_parse("int acc(int base, int f(int, int)) {}");
check_parse("int sum(int &a, int &b) {\n\n}");
check_parse("int sum(int, int)");
check_parse("int sum(int a, b)");
check_parse("int nums[] = {1, 2, 3}");
check_parse("int nums[3]");
check_parse("pragma runLim, 0");
check_parse('pragma encoding, "utf-8"');
check_parse('#include "file.txt"');
check_parse("#include <file.txt>");
check_parse("a && isspace b");
check_parse("while (a) last--");
check_parse("styleCentered|styleFixed");
check_parse("!null ad");
check_parse("string s1, s2, s3");
check_parse("from + start 0");

// Error cases
check_parse("int");

function check_parse(text: string) {
	test(`parse ${text}`, () => {
		const lex_items = tokenize(text);
		const res = parse(lex_items);
		const tree = res.tree;

		if (tree !== undefined) {
			expect(pp_cst(tree)).toMatchSnapshot();
		} else {
			throw new Error("Tree undefined");
		}
	});
}
