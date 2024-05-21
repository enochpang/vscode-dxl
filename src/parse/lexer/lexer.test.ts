import { describe, expect, test } from "vitest";

import { Lexer, tokenize } from "./lexer";
import { TextPosition, Token } from "../syntax/green_tree";
import { type TokenKind, OTokenKind } from "../syntax/syntax_kind";

describe("next_token", () => {
	const test_cases: [string, Token][] = [
		["", make_token(OTokenKind.Eof, 0, 0, [0, 0], [0, 0])],
		["  ", make_token(OTokenKind.Spaces, 0, 2, [0, 0], [0, 2])],
		["\t", make_token(OTokenKind.Tabs, 0, 1, [0, 0], [0, 1])],
		["\t\t", make_token(OTokenKind.Tabs, 0, 2, [0, 0], [0, 2])],
		["(", make_token(OTokenKind.Lparen, 0, 1, [0, 0], [0, 1])],
		[")", make_token(OTokenKind.Rparen, 0, 1, [0, 0], [0, 1])],
		["{", make_token(OTokenKind.Lcurly, 0, 1, [0, 0], [0, 1])],
		["}", make_token(OTokenKind.Rcurly, 0, 1, [0, 0], [0, 1])],
		["[", make_token(OTokenKind.Lbracket, 0, 1, [0, 0], [0, 1])],
		["]", make_token(OTokenKind.Rbracket, 0, 1, [0, 0], [0, 1])],
		[";", make_token(OTokenKind.Semicolon, 0, 1, [0, 0], [0, 1])],
		[",", make_token(OTokenKind.Comma, 0, 1, [0, 0], [0, 1])],
		["?", make_token(OTokenKind.Qmark, 0, 1, [0, 0], [0, 1])],
		["~", make_token(OTokenKind.Tilde, 0, 1, [0, 0], [0, 1])],
		["\\", make_token(OTokenKind.Bslash, 0, 1, [0, 0], [0, 1])],
		["&", make_token(OTokenKind.Ampr, 0, 1, [0, 0], [0, 1])],
		["&&", make_token(OTokenKind.AmprAmpr, 0, 2, [0, 0], [0, 2])],
		["&=", make_token(OTokenKind.AmprEqual, 0, 2, [0, 0], [0, 2])],
		["!", make_token(OTokenKind.Bang, 0, 1, [0, 0], [0, 1])],
		["!=", make_token(OTokenKind.BangEqual, 0, 2, [0, 0], [0, 2])],
		["|", make_token(OTokenKind.Bar, 0, 1, [0, 0], [0, 1])],
		["||", make_token(OTokenKind.BarBar, 0, 2, [0, 0], [0, 2])],
		["|=", make_token(OTokenKind.BarEqual, 0, 2, [0, 0], [0, 2])],
		["^", make_token(OTokenKind.Caret, 0, 1, [0, 0], [0, 1])],
		["^^", make_token(OTokenKind.CaretCaret, 0, 2, [0, 0], [0, 2])],
		["^=", make_token(OTokenKind.CaretEqual, 0, 2, [0, 0], [0, 2])],
		[":", make_token(OTokenKind.Colon, 0, 1, [0, 0], [0, 1])],
		["::", make_token(OTokenKind.ColonColon, 0, 2, [0, 0], [0, 2])],
		[":=", make_token(OTokenKind.ColonEqual, 0, 2, [0, 0], [0, 2])],
		["=", make_token(OTokenKind.Equal, 0, 1, [0, 0], [0, 1])],
		["==", make_token(OTokenKind.EqualEqual, 0, 2, [0, 0], [0, 2])],
		["=>", make_token(OTokenKind.EqualGreat, 0, 2, [0, 0], [0, 2])],
		[">", make_token(OTokenKind.Great, 0, 1, [0, 0], [0, 1])],
		[">=", make_token(OTokenKind.GreatEqual, 0, 2, [0, 0], [0, 2])],
		[">>", make_token(OTokenKind.GreatGreat, 0, 2, [0, 0], [0, 2])],
		[">>=", make_token(OTokenKind.GreatGreatEqual, 0, 3, [0, 0], [0, 3])],
		["<", make_token(OTokenKind.Less, 0, 1, [0, 0], [0, 1])],
		["<=", make_token(OTokenKind.LessEqual, 0, 2, [0, 0], [0, 2])],
		["<<", make_token(OTokenKind.LessLess, 0, 2, [0, 0], [0, 2])],
		["<<=", make_token(OTokenKind.LessLessEqual, 0, 3, [0, 0], [0, 3])],
		["<>", make_token(OTokenKind.LessGreat, 0, 2, [0, 0], [0, 2])],
		["<-", make_token(OTokenKind.LessMinus, 0, 2, [0, 0], [0, 2])],
		["-", make_token(OTokenKind.Minus, 0, 1, [0, 0], [0, 1])],
		["--", make_token(OTokenKind.MinusMinus, 0, 2, [0, 0], [0, 2])],
		["-=", make_token(OTokenKind.MinusEqual, 0, 2, [0, 0], [0, 2])],
		["->", make_token(OTokenKind.MinusGreat, 0, 2, [0, 0], [0, 2])],
		["%", make_token(OTokenKind.Percent, 0, 1, [0, 0], [0, 1])],
		["%=", make_token(OTokenKind.PercentEqual, 0, 2, [0, 0], [0, 2])],
		[".", make_token(OTokenKind.Period, 0, 1, [0, 0], [0, 1])],
		["..", make_token(OTokenKind.PeriodPeriod, 0, 2, [0, 0], [0, 2])],
		["+", make_token(OTokenKind.Plus, 0, 1, [0, 0], [0, 1])],
		["++", make_token(OTokenKind.PlusPlus, 0, 2, [0, 0], [0, 2])],
		["+=", make_token(OTokenKind.PlusEqual, 0, 2, [0, 0], [0, 2])],
		["*", make_token(OTokenKind.Star, 0, 1, [0, 0], [0, 1])],
		["*=", make_token(OTokenKind.StarEqual, 0, 2, [0, 0], [0, 2])],
		["/", make_token(OTokenKind.Fslash, 0, 1, [0, 0], [0, 1])],
		["/=", make_token(OTokenKind.FslashEqual, 0, 2, [0, 0], [0, 2])],
		["//", make_token(OTokenKind.Comment, 0, 2, [0, 0], [0, 2])],
		["/*", make_token(OTokenKind.Comment, 0, 2, [0, 0], [0, 2])],
		["\r\n", make_token(OTokenKind.End, 0, 2, [0, 0], [1, 0])],
		["\r\n\r\n", make_token(OTokenKind.End, 0, 4, [0, 0], [2, 0])],
		["\n", make_token(OTokenKind.End, 0, 1, [0, 0], [1, 0])],
		["\n\n", make_token(OTokenKind.End, 0, 2, [0, 0], [2, 0])],
		["'a'", make_token(OTokenKind.String, 0, 3, [0, 0], [0, 3])],
		['"hello"', make_token(OTokenKind.String, 0, 7, [0, 0], [0, 7])],
		["0123456789", make_token(OTokenKind.Integer, 0, 10, [0, 0], [0, 10])],
		["12.34", make_token(OTokenKind.Real, 0, 5, [0, 0], [0, 5])],
		["1e10", make_token(OTokenKind.Real, 0, 4, [0, 0], [0, 4])],
		["1.2E30", make_token(OTokenKind.Real, 0, 6, [0, 0], [0, 6])],
		["and", make_token(OTokenKind.KwAnd, 0, 3, [0, 0], [0, 3])],
		["bool", make_token(OTokenKind.KwBool, 0, 4, [0, 0], [0, 4])],
		["break", make_token(OTokenKind.KwBreak, 0, 5, [0, 0], [0, 5])],
		["by", make_token(OTokenKind.KwBy, 0, 2, [0, 0], [0, 2])],
		["case", make_token(OTokenKind.KwCase, 0, 4, [0, 0], [0, 4])],
		["char", make_token(OTokenKind.KwChar, 0, 4, [0, 0], [0, 4])],
		["const", make_token(OTokenKind.KwConst, 0, 5, [0, 0], [0, 5])],
		["continue", make_token(OTokenKind.KwContinue, 0, 8, [0, 0], [0, 8])],
		// ["default", make_token(OTokenKind.KwDefault, 0, 7, [0, 0], [0, 7])],
		["do", make_token(OTokenKind.KwDo, 0, 2, [0, 0], [0, 2])],
		["else", make_token(OTokenKind.KwElse, 0, 4, [0, 0], [0, 4])],
		["enum", make_token(OTokenKind.KwEnum, 0, 4, [0, 0], [0, 4])],
		["for", make_token(OTokenKind.KwFor, 0, 3, [0, 0], [0, 3])],
		["if", make_token(OTokenKind.KwIf, 0, 2, [0, 0], [0, 2])],
		["in", make_token(OTokenKind.KwIn, 0, 2, [0, 0], [0, 2])],
		["int", make_token(OTokenKind.KwInt, 0, 3, [0, 0], [0, 3])],
		["module", make_token(OTokenKind.KwModule, 0, 6, [0, 0], [0, 6])],
		["object", make_token(OTokenKind.KwObject, 0, 6, [0, 0], [0, 6])],
		["or", make_token(OTokenKind.KwOr, 0, 2, [0, 0], [0, 2])],
		["pragma", make_token(OTokenKind.KwPragma, 0, 6, [0, 0], [0, 6])],
		["real", make_token(OTokenKind.KwReal, 0, 4, [0, 0], [0, 4])],
		["return", make_token(OTokenKind.KwReturn, 0, 6, [0, 0], [0, 6])],
		// ["sizeof", make_token(OTokenKind.KwSizeof, 0, 6, [0, 0], [0, 6])],
		["static", make_token(OTokenKind.KwStatic, 0, 6, [0, 0], [0, 6])],
		["struct", make_token(OTokenKind.KwStruct, 0, 6, [0, 0], [0, 6])],
		["string", make_token(OTokenKind.KwString, 0, 6, [0, 0], [0, 6])],
		["switch", make_token(OTokenKind.KwSwitch, 0, 6, [0, 0], [0, 6])],
		["then", make_token(OTokenKind.KwThen, 0, 4, [0, 0], [0, 4])],
		["union", make_token(OTokenKind.KwUnion, 0, 5, [0, 0], [0, 5])],
		["void", make_token(OTokenKind.KwVoid, 0, 4, [0, 0], [0, 4])],
		["while", make_token(OTokenKind.KwWhile, 0, 5, [0, 0], [0, 5])],
		["null", make_token(OTokenKind.KwNull, 0, 4, [0, 0], [0, 4])],
		["true", make_token(OTokenKind.KwTrue, 0, 4, [0, 0], [0, 4])],
		["false", make_token(OTokenKind.KwFalse, 0, 5, [0, 0], [0, 5])],
		["#include", make_token(OTokenKind.KwInclude, 0, 8, [0, 0], [0, 8])],
		["print", make_token(OTokenKind.Ident, 0, 5, [0, 0], [0, 5])],
		["// comment text", make_token(OTokenKind.Comment, 0, 15, [0, 0], [0, 15])],
		[
			"/* text on one line \nmore text in next line */",
			make_token(OTokenKind.Comment, 0, 46, [0, 0], [1, 26]),
		],
		[
			"/* comment with carriage return \r\nmore text in next line */",
			make_token(OTokenKind.Comment, 0, 59, [0, 0], [1, 26]),
		],
		['"hello\nworld"', make_token(OTokenKind.String, 0, 13, [0, 0], [1, 7])],
		["@", make_token(OTokenKind.LexError, 0, 1, [0, 0], [0, 1])],
	];

	for (const test_case of test_cases) {
		const [want_str, want_tok] = test_case;
		const lexer = new Lexer(want_str);
		const [got_tok, got_str] = lexer.next_token();

		test(`Lex ${escapeText(want_str)}`, () => {
			expect(got_tok).toEqual(want_tok);
			expect(got_str).toEqual(want_str);
		});
	}
});

test("next_token expression", () => {
	check_lex("1 + 2", [
		make_token(OTokenKind.Integer, 0, 1, [0, 0], [0, 1]),
		make_token(OTokenKind.Spaces, 1, 2, [0, 1], [0, 2]),
		make_token(OTokenKind.Plus, 2, 3, [0, 2], [0, 3]),
		make_token(OTokenKind.Spaces, 3, 4, [0, 3], [0, 4]),
		make_token(OTokenKind.Integer, 4, 5, [0, 4], [0, 5]),
		make_token(OTokenKind.Eof, 5, 5, [0, 5], [0, 5]),
	]);
});

test("next_token line_continuation", () => {
	check_lex("1 +\n2", [
		make_token(OTokenKind.Integer, 0, 1, [0, 0], [0, 1]),
		make_token(OTokenKind.Spaces, 1, 2, [0, 1], [0, 2]),
		make_token(OTokenKind.Plus, 2, 3, [0, 2], [0, 3]),
		make_token(OTokenKind.Eol, 3, 4, [0, 3], [1, 0]),
		make_token(OTokenKind.Integer, 4, 5, [1, 0], [1, 1]),
		make_token(OTokenKind.Eof, 5, 5, [1, 1], [1, 1]),
	]);
});

test("next_token end_of_stmt_token", () => {
	check_lex("a\nb", [
		make_token(OTokenKind.Ident, 0, 1, [0, 0], [0, 1]),
		make_token(OTokenKind.End, 1, 2, [0, 1], [1, 0]),
		make_token(OTokenKind.Ident, 2, 3, [1, 0], [1, 1]),
		make_token(OTokenKind.Eof, 3, 3, [1, 1], [1, 1]),
	]);
});

function check_lex(input: string, expected_tokens: Token[]) {
	const got_items = tokenize(input);

	for (let i = 0; i < expected_tokens.length; i++) {
		const want_tok = expected_tokens[i];
		const got_item = got_items[i];

		expect(got_item.token).toEqual(want_tok);
	}
}

function make_token(
	kind: TokenKind,
	offset: number,
	rdoffset: number,
	start: [number, number],
	end: [number, number],
) {
	return new Token(
		kind,
		offset,
		rdoffset,
		new TextPosition(start[0], start[1]),
		new TextPosition(end[0], end[1]),
	);
}

function escapeText(text: string): string {
	return text.replace("\r", "\\r").replace("\n", "\\n");
}
