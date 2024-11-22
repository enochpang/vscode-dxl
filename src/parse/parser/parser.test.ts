import { expect, test } from "vitest";
import { tokenize } from "../lexer/lexer";
import { parse } from "./lib";
import { ppGreenTree } from "../syntax/green_tree";

// Expressions
checkParse("-1");
checkParse("++x");
checkParse("!x");
checkParse("i++");
checkParse("1 + 2");
checkParse("1 + 2 + 3");
checkParse("1 + 2 * 3");
checkParse("(1 + 2) * 3");
checkParse("1 + 2; 3 + 4");
checkParse("-1 * 2");
checkParse("styleCentered|styleFixed");
checkParse("a == b");
checkParse("a && b");
checkParse("true || false");
checkParse("a < b");
checkParse("(a < b) ? 1 : 2");
checkParse("a = b");
checkParse("a += b");
checkParse("sum(a, b)");
checkParse("fun(null)");
checkParse(`func("" val)`);
checkParse("func(++i)");
checkParse("print square 2");
checkParse("a && isspace b");
checkParse("null(obj)");
checkParse("null obj");
checkParse("!null ad");
checkParse("arr[1]");
checkParse('obj."text"');
checkParse("ad.object");
checkParse('obj."number" = 2');
checkParse('dbe->"left"->"form"');
checkParse('dbe->"left"->"flush"->dbe2');
checkParse('lnk<-"*"');
checkParse('lnk->"*"');
checkParse("stream -> buf");
checkParse(`trigger("t1", project->all->module->all)`);
checkParse(`trigger("t1", project->module->"2")`);
checkParse("str[0:2]");
checkParse("str[0:]");
checkParse('2 ""');
checkParse('foo() ""');
checkParse('major(b) "" minor(b) ""');
checkParse('"hello" //-\n"world"');
checkParse('out << "hello" << "world"');
checkParse('out << "hello"\nout << "world"');
checkParse("current Object");
checkParse("(Object current)");
checkParse("(int key sk)");

// Statements
checkParse("int a");
checkParse("int a = 2");
checkParse("int& a = b");
checkParse("int a=0, b, c");
checkParse("int a, b=0, c");
checkParse("int nums[] = {1, 2, 3}");
checkParse("int arr[2] = {1, 2}");
checkParse("int sum(int a, int b) {}");
checkParse("int acc(int base, int f(int, int)) {}");
checkParse("int sum(int &a, int &b) {}");
checkParse("int sum(int, int)");
checkParse("int sum(int a, b)");
checkParse("pragma runLim, 0");
checkParse('pragma encoding, "utf-8"');
checkParse('#include "file.txt"');
checkParse("#include <file.txt>");
checkParse("continue");
checkParse("break");
checkParse("return");
checkParse("return a");
checkParse("if (a < 2) {b}");
checkParse("if (true) 1 else 2");
checkParse("if (true) { a } else b");
checkParse("if (true) { a + 1 } else { b + 2 }");
checkParse("if (true)\n\n{} else {}");
checkParse("if (a) { 1 } else if (b) { 2 }");
checkParse("if (isDeleted module(modVersion)) {}");
checkParse("if (\ntrue\n) {}");
checkParse("while (a < 2) {}");
checkParse("while (a) last--");
checkParse("while (a==2 and b==3) {}");
checkParse("while (\ntrue\n) {}");
checkParse("for (i = 0; i < 4; i++) {}");
checkParse("for (a<2;a++) {}");
checkParse("for obj in mod do {}");
checkParse(`for lnk in obj<-"*" do {}`);
checkParse("for x in 1 : 11 {}");
checkParse("for x in 1 : 11 by 2 do {}");

function checkParse(text: string) {
	const testMessage = text.replaceAll("\n", "¶");

	test(`parse ${testMessage}`, () => {
		const lex_result = tokenize(text);
		const parse_result = parse(lex_result);
		const tree = parse_result.tree;

		if (tree !== undefined) {
			expect(ppGreenTree(tree)).toMatchSnapshot();
		} else {
			throw new Error("Tree undefined");
		}
	});
}
