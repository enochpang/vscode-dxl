import { describe, expect, test } from "vitest";

import { Lexer, tokenize } from "./lexer";
import { type TokenKind, OTokenKind } from "../syntax/syntax_kind";

describe("next_token", () => {
	const test_cases: [string, TokenKind, number, number][] = [
		["", OTokenKind.Eof, 0, 0],
		["  ", OTokenKind.Spaces, 0, 2],
		["\t", OTokenKind.Tabs, 0, 1],
		["\t\t", OTokenKind.Tabs, 0, 2],
		["(", OTokenKind.Lparen, 0, 1],
		[")", OTokenKind.Rparen, 0, 1],
		["{", OTokenKind.Lcurly, 0, 1],
		["}", OTokenKind.Rcurly, 0, 1],
		["[", OTokenKind.Lbracket, 0, 1],
		["]", OTokenKind.Rbracket, 0, 1],
		[";", OTokenKind.Semicolon, 0, 1],
		[",", OTokenKind.Comma, 0, 1],
		["?", OTokenKind.Qmark, 0, 1],
		["~", OTokenKind.Tilde, 0, 1],
		["\\", OTokenKind.Bslash, 0, 1],
		["&", OTokenKind.Ampr, 0, 1],
		["&&", OTokenKind.AmprAmpr, 0, 2],
		["&=", OTokenKind.AmprEqual, 0, 2],
		["!", OTokenKind.Bang, 0, 1],
		["!=", OTokenKind.BangEqual, 0, 2],
		["|", OTokenKind.Bar, 0, 1],
		["||", OTokenKind.BarBar, 0, 2],
		["|=", OTokenKind.BarEqual, 0, 2],
		["^", OTokenKind.Caret, 0, 1],
		["^^", OTokenKind.CaretCaret, 0, 2],
		["^=", OTokenKind.CaretEqual, 0, 2],
		[":", OTokenKind.Colon, 0, 1],
		["::", OTokenKind.ColonColon, 0, 2],
		[":=", OTokenKind.ColonEqual, 0, 2],
		["=", OTokenKind.Equal, 0, 1],
		["==", OTokenKind.EqualEqual, 0, 2],
		["=>", OTokenKind.EqualGreat, 0, 2],
		[">", OTokenKind.Great, 0, 1],
		[">=", OTokenKind.GreatEqual, 0, 2],
		[">>", OTokenKind.GreatGreat, 0, 2],
		[">>=", OTokenKind.GreatGreatEqual, 0, 3],
		["<", OTokenKind.Less, 0, 1],
		["<=", OTokenKind.LessEqual, 0, 2],
		["<<", OTokenKind.LessLess, 0, 2],
		["<<=", OTokenKind.LessLessEqual, 0, 3],
		["<>", OTokenKind.LessGreat, 0, 2],
		["<-", OTokenKind.LessMinus, 0, 2],
		["-", OTokenKind.Minus, 0, 1],
		["--", OTokenKind.MinusMinus, 0, 2],
		["-=", OTokenKind.MinusEqual, 0, 2],
		["->", OTokenKind.MinusGreat, 0, 2],
		["%", OTokenKind.Percent, 0, 1],
		["%=", OTokenKind.PercentEqual, 0, 2],
		[".", OTokenKind.Period, 0, 1],
		["..", OTokenKind.PeriodPeriod, 0, 2],
		["+", OTokenKind.Plus, 0, 1],
		["++", OTokenKind.PlusPlus, 0, 2],
		["+=", OTokenKind.PlusEqual, 0, 2],
		["*", OTokenKind.Star, 0, 1],
		["*=", OTokenKind.StarEqual, 0, 2],
		["/", OTokenKind.Fslash, 0, 1],
		["/=", OTokenKind.FslashEqual, 0, 2],
		["//", OTokenKind.Comment, 0, 2],
		["/*", OTokenKind.Comment, 0, 2],
		["\r\n", OTokenKind.End, 0, 2],
		["\n", OTokenKind.End, 0, 1],
		["'a'", OTokenKind.String, 0, 3],
		['"hello"', OTokenKind.String, 0, 7],
		["0123456789", OTokenKind.Integer, 0, 10],
		["12.34", OTokenKind.Real, 0, 5],
		["1e10", OTokenKind.Real, 0, 4],
		["1.2E30", OTokenKind.Real, 0, 6],
		["and", OTokenKind.KwAnd, 0, 3],
		["bool", OTokenKind.KwBool, 0, 4],
		["break", OTokenKind.KwBreak, 0, 5],
		["by", OTokenKind.KwBy, 0, 2],
		["case", OTokenKind.KwCase, 0, 4],
		["char", OTokenKind.KwChar, 0, 4],
		["const", OTokenKind.KwConst, 0, 5],
		["continue", OTokenKind.KwContinue, 0, 8],
		["default", OTokenKind.KwDefault, 0, 7],
		["do", OTokenKind.KwDo, 0, 2],
		["else", OTokenKind.KwElse, 0, 4],
		["enum", OTokenKind.KwEnum, 0, 4],
		["for", OTokenKind.KwFor, 0, 3],
		["if", OTokenKind.KwIf, 0, 2],
		["in", OTokenKind.KwIn, 0, 2],
		["int", OTokenKind.KwInt, 0, 3],
		["module", OTokenKind.KwModule, 0, 6],
		["object", OTokenKind.KwObject, 0, 6],
		["or", OTokenKind.KwOr, 0, 2],
		["pragma", OTokenKind.KwPragma, 0, 6],
		["real", OTokenKind.KwReal, 0, 4],
		["return", OTokenKind.KwReturn, 0, 6],
		["sizeof", OTokenKind.KwSizeof, 0, 6],
		["static", OTokenKind.KwStatic, 0, 6],
		["struct", OTokenKind.KwStruct, 0, 6],
		["string", OTokenKind.KwString, 0, 6],
		["switch", OTokenKind.KwSwitch, 0, 6],
		["then", OTokenKind.KwThen, 0, 4],
		["union", OTokenKind.KwUnion, 0, 5],
		["void", OTokenKind.KwVoid, 0, 4],
		["while", OTokenKind.KwWhile, 0, 5],
		["null", OTokenKind.KwNull, 0, 4],
		["true", OTokenKind.KwTrue, 0, 4],
		["false", OTokenKind.KwFalse, 0, 5],
		["#include", OTokenKind.KwInclude, 0, 8],
		["print", OTokenKind.Ident, 0, 5],
		["// comment text", OTokenKind.Comment, 0, 15],
		[
			"/* text on one line \nmore text in next line */",
			OTokenKind.Comment,
			0,
			46,
		],
		[
			"/* comment with carriage return \r\nmore text in next line */",
			OTokenKind.Comment,
			0,
			59,
		],
		['"hello\nworld"', OTokenKind.String, 0, 13],
		["@", OTokenKind.LexError, 0, 1],
	];

	for (const test_case of test_cases) {
		const [want_str, want_kind, _want_offset, _want_end_offset] = test_case;
		const lexer = new Lexer(want_str);
		const [got_tok, got_str] = lexer.nextToken();

		test(`Lex ${escapeText(want_str)}`, () => {
			expect(got_tok).toEqual(want_kind);
			expect(got_str).toEqual(want_str);
		});
	}
});

test("next_token expression", () => {
	checkLex("1 + 2", [
		["1", OTokenKind.Integer, 0, 1],
		[" ", OTokenKind.Spaces, 1, 2],
		["+", OTokenKind.Plus, 2, 3],
		[" ", OTokenKind.Spaces, 3, 4],
		["2", OTokenKind.Integer, 4, 5],
		["", OTokenKind.Eof, 5, 5],
	]);
});

test("next_token line_continuation", () => {
	checkLex("1 +\n2", [
		["1", OTokenKind.Integer, 0, 1],
		[" ", OTokenKind.Spaces, 1, 2],
		["+", OTokenKind.Plus, 2, 3],
		["\n", OTokenKind.Eol, 3, 4],
		["2", OTokenKind.Integer, 4, 5],
		["", OTokenKind.Eof, 5, 5],
	]);
});

test("next_token end_of_stmt_token", () => {
	checkLex("a\nb", [
		["a", OTokenKind.Ident, 0, 1],
		["\n", OTokenKind.End, 1, 2],
		["b", OTokenKind.Ident, 2, 3],
		["", OTokenKind.Eof, 3, 3],
	]);
});

function checkLex(
	input: string,
	test_cases: [string, TokenKind, number, number][],
) {
	const lex_result = tokenize(input);
	const tokens = lex_result.tokens;

	for (let i = 0; i < test_cases.length; i++) {
		const [want_str, want_kind, _want_offset, _want_end_offset] = test_cases[i];
		const got_item = tokens[i];

		expect(got_item.kind).toEqual(want_kind);
		expect(got_item.text).toEqual(want_str);
	}
}

function escapeText(text: string): string {
	return text.replace("\r", "\\r").replace("\n", "\\n");
}
