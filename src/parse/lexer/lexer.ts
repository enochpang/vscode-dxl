import { GreenToken } from "../syntax/green_tree";
import {
	OTokenKind,
	TOKEN_KEYWORDS,
	type TokenKind,
} from "../syntax/syntax_kind";

export type LexResult = {
	tokens: GreenToken[];
	newlines: number[];
};

export function tokenize(input: string): LexResult {
	const lexer = new Lexer(input);
	const tokens: GreenToken[] = [];
	const newlines: number[] = [];

	while (true) {
		const [kind, text, offset] = lexer.nextToken();
		tokens.push(new GreenToken(kind, text));

		switch (kind) {
			case OTokenKind.Eol:
			case OTokenKind.End:
			case OTokenKind.Eof:
				newlines.push(offset);
		}

		if (kind === OTokenKind.Eof) {
			break;
		}
	}

	return {
		tokens: tokens,
		newlines: newlines,
	};
}

export class Lexer {
	private input: string;
	private offset = 0;
	private rdoffset = 0;
	private ignore_end = false;

	constructor(input: string) {
		this.input = input;
	}

	/**
	 * Returns the next token in the input.
	 */
	public nextToken(): [TokenKind, string, number] {
		const ch = this.advance();

		let kind: TokenKind;
		switch (ch) {
			case "(":
				kind = OTokenKind.Lparen;
				break;
			case ")":
				kind = OTokenKind.Rparen;
				break;
			case "{":
				kind = OTokenKind.Lcurly;
				break;
			case "}":
				kind = OTokenKind.Rcurly;
				break;
			case "[":
				kind = OTokenKind.Lbracket;
				break;
			case "]":
				kind = OTokenKind.Rbracket;
				break;
			case ";":
				kind = OTokenKind.Semicolon;
				break;
			case ",":
				kind = OTokenKind.Comma;
				break;
			case "?":
				kind = OTokenKind.Qmark;
				break;
			case "~":
				kind = OTokenKind.Tilde;
				break;
			case "\\":
				kind = OTokenKind.Bslash;
				break;
			case "&":
				if (this.consume("&")) {
					kind = OTokenKind.AmprAmpr;
				} else if (this.consume("=")) {
					kind = OTokenKind.AmprEqual;
				} else {
					kind = OTokenKind.Ampr;
				}
				break;
			case "!":
				if (this.consume("=")) {
					kind = OTokenKind.BangEqual;
				} else {
					kind = OTokenKind.Bang;
				}
				break;
			case "|":
				if (this.consume("|")) {
					kind = OTokenKind.BarBar;
				} else if (this.consume("=")) {
					kind = OTokenKind.BarEqual;
				} else {
					kind = OTokenKind.Bar;
				}
				break;
			case "^":
				if (this.consume("^")) {
					kind = OTokenKind.CaretCaret;
				} else if (this.consume("=")) {
					kind = OTokenKind.CaretEqual;
				} else {
					kind = OTokenKind.Caret;
				}
				break;
			case ":":
				if (this.consume(":")) {
					kind = OTokenKind.ColonColon;
				} else if (this.consume("=")) {
					kind = OTokenKind.ColonEqual;
				} else {
					kind = OTokenKind.Colon;
				}
				break;
			case "=":
				if (this.consume("=")) {
					kind = OTokenKind.EqualEqual;
				} else if (this.consume(">")) {
					kind = OTokenKind.EqualGreat;
				} else {
					kind = OTokenKind.Equal;
				}
				break;
			case ">":
				if (this.consume("=")) {
					kind = OTokenKind.GreatEqual;
				} else if (this.consume(">")) {
					if (this.consume("=")) {
						kind = OTokenKind.GreatGreatEqual;
					} else {
						kind = OTokenKind.GreatGreat;
					}
				} else {
					kind = OTokenKind.Great;
				}
				break;
			case "<":
				if (this.consume("=")) {
					kind = OTokenKind.LessEqual;
				} else if (this.consume("<")) {
					if (this.consume("=")) {
						kind = OTokenKind.LessLessEqual;
					} else {
						kind = OTokenKind.LessLess;
					}
				} else if (this.consume(">")) {
					kind = OTokenKind.LessGreat;
				} else if (this.consume("-")) {
					kind = OTokenKind.LessMinus;
				} else {
					kind = OTokenKind.Less;
				}
				break;
			case "-":
				if (this.consume("=")) {
					kind = OTokenKind.MinusEqual;
				} else if (this.consume("-")) {
					kind = OTokenKind.MinusMinus;
				} else if (this.consume(">")) {
					kind = OTokenKind.MinusGreat;
				} else {
					kind = OTokenKind.Minus;
				}
				break;
			case "%":
				if (this.consume("=")) {
					kind = OTokenKind.PercentEqual;
				} else {
					kind = OTokenKind.Percent;
				}
				break;
			case ".":
				if (this.consume(".")) {
					kind = OTokenKind.PeriodPeriod;
				} else {
					kind = OTokenKind.Period;
				}
				break;
			case "+":
				if (this.consume("=")) {
					kind = OTokenKind.PlusEqual;
				} else if (this.consume("+")) {
					kind = OTokenKind.PlusPlus;
				} else {
					kind = OTokenKind.Plus;
				}
				break;
			case "*":
				if (this.consume("=")) {
					kind = OTokenKind.StarEqual;
				} else {
					kind = OTokenKind.Star;
				}
				break;
			case "/":
				if (this.consume("=")) {
					kind = OTokenKind.FslashEqual;
				} else if (this.peek() === "/") {
					kind = this.readSinglelineComment();
				} else if (this.peek() === "*") {
					kind = this.readMutlilineComment();
				} else {
					kind = OTokenKind.Fslash;
				}
				break;
			case "\r":
				this.consume("\n");

				// while (this.consume("\r")) {
				// 	this.consume("\n");
				// }

				if (this.ignore_end) {
					kind = OTokenKind.Eol;
				} else {
					kind = OTokenKind.End;
				}

				break;
			case "\n":
				// while (this.consume("\n")) {}

				if (this.ignore_end) {
					kind = OTokenKind.Eol;
				} else {
					kind = OTokenKind.End;
				}

				break;
			case " ":
				while (this.peek() === " ") {
					this.advance();
				}
				kind = OTokenKind.Spaces;
				break;
			case "\t":
				while (this.peek() === "\t") {
					this.advance();
				}
				kind = OTokenKind.Tabs;
				break;
			case "'":
				kind = this.readString("'");
				break;
			case '"':
				kind = this.readString('"');
				break;
			case "#":
				kind = this.readIdent();
				break;
			case "\0":
				kind = OTokenKind.Eof;
				break;
			default:
				if (isAlpha(ch)) {
					kind = this.readIdent();
				} else if (isDigit(ch)) {
					kind = this.readNumber();
				} else {
					kind = OTokenKind.LexError;
				}
				break;
		}

		const text = this.input.substring(this.offset, this.rdoffset);
		const offset = this.offset;

		if (kind === OTokenKind.Ident) {
			const val = TOKEN_KEYWORDS.get(text);
			if (val) {
				kind = val;
			}
		}

		if (kind === OTokenKind.Comment) {
			this.ignore_end = text[text.length - 1] === "-";
		} else {
			this.ignore_end = checkIgnoreEnd(kind);
		}

		this.offset = this.rdoffset;

		return [kind, text, offset];
	}

	/**
	 * Scans a ident token.
	 */
	private readIdent(): TokenKind {
		while (isAlphanum(this.peek()) || this.peek() === "_") {
			this.advance();
		}

		return OTokenKind.Ident;
	}

	/**
	 * Scans an integer or real token.
	 */
	private readNumber(): TokenKind {
		this.readInteger();

		if (this.consume(".")) {
			this.readInteger();

			if (this.consume("e") || this.consume("E")) {
				this.readInteger();
			}

			return OTokenKind.Real;
		}
		if (this.consume("e") || this.consume("E")) {
			this.readInteger();

			return OTokenKind.Real;
		} else {
			return OTokenKind.Integer;
		}
	}

	/**
	 * Scans an integer.
	 */
	private readInteger() {
		while (isDigit(this.peek())) {
			this.advance();
		}
	}

	/**
	 * Scans a string token.
	 */
	private readString(qouteCh: string): TokenKind {
		while (true) {
			if (this.peek() === "\0") break;

			if (this.peek() === qouteCh) {
				this.advance(); // The closing quote.
				break;
			}

			const ch = this.advance();

			if (ch === "\\") {
				this.advance();
			}
		}

		return OTokenKind.String;
	}

	/**
	 * Scans a (single-line) comment token.
	 */
	private readSinglelineComment(): TokenKind {
		while (true) {
			if (this.peek() === "\0") break;
			if (this.peek() === "\r") break;
			if (this.peek() === "\n") break;

			this.advance();
		}

		return OTokenKind.Comment;
	}

	/**
	 * Scans a (multi-line) comment token.
	 */
	private readMutlilineComment(): TokenKind {
		while (true) {
			if (this.peek() === "\0") break;

			const ch = this.advance();

			if (ch === "*" && this.peek() === "/") {
				this.advance(); // The closing slash.
				break;
			}
		}

		return OTokenKind.Comment;
	}

	/**
	 * Consumes the next character in the input if it matches the given char.
	 */
	private consume(ch: string): boolean {
		if (this.peek() !== ch) {
			return false;
		}

		this.advance();
		return true;
	}

	/**
	 * Consumes the next character in the input.
	 */
	private advance(): string {
		if (this.rdoffset >= this.input.length) {
			return "\0";
		} else {
			const ch = this.input[this.rdoffset];
			this.rdoffset += 1;
			return ch;
		}
	}

	/**
	 * Look ahead one character, without consuming it.
	 */
	private peek(): string {
		return this.rdoffset >= this.input.length
			? "\0"
			: this.input[this.rdoffset];
	}
}

/**
 * Reports if the given character is a digit.
 */
function isDigit(ch: string): boolean {
	// 48 -> 0; 57 ->9
	const chCode = ch.charCodeAt(0);
	return chCode >= 48 && chCode <= 57;
}

/**
 * Reports if the given character is a letter.
 */
function isAlpha(ch: string): boolean {
	// 65 -> A; 90 -> Z; 97 -> a; 122 -> z
	const chCode = ch.charCodeAt(0);
	return (chCode >= 65 && chCode <= 90) || (chCode >= 97 && chCode <= 122);
}

/**
 * Reports if the given character is a letter of digit.
 */
function isAlphanum(ch: string): boolean {
	return isAlpha(ch) || isDigit(ch);
}

/**
 * Reports if the token kind prevents emitting end of statement tokens.
 */
function checkIgnoreEnd(kind: TokenKind): boolean {
	switch (kind) {
		case OTokenKind.Semicolon:
		case OTokenKind.Comma:
		case OTokenKind.Qmark:
		case OTokenKind.Colon:
		case OTokenKind.Equal:
		case OTokenKind.Lparen:
		case OTokenKind.Plus:
		case OTokenKind.Star:
		case OTokenKind.Lbracket:
		case OTokenKind.Ampr:
		case OTokenKind.Minus:
		case OTokenKind.Bang:
		case OTokenKind.Tilde:
		case OTokenKind.Fslash:
		case OTokenKind.Percent:
		case OTokenKind.LessLess:
		case OTokenKind.GreatGreat:
		case OTokenKind.LessGreat:
		case OTokenKind.Less:
		case OTokenKind.Great:
		case OTokenKind.LessEqual:
		case OTokenKind.GreatEqual:
		case OTokenKind.EqualEqual:
		case OTokenKind.BangEqual:
		case OTokenKind.Caret:
		case OTokenKind.Bar:
		case OTokenKind.AmprAmpr:
		case OTokenKind.KwAnd:
		case OTokenKind.BarBar:
		case OTokenKind.KwOr:
		case OTokenKind.CaretCaret:
		case OTokenKind.PlusEqual:
		case OTokenKind.MinusEqual:
		case OTokenKind.StarEqual:
		case OTokenKind.FslashEqual:
		case OTokenKind.PercentEqual:
		case OTokenKind.LessLessEqual:
		case OTokenKind.GreatGreatEqual:
		case OTokenKind.AmprEqual:
		case OTokenKind.BarEqual:
		case OTokenKind.CaretEqual:
		case OTokenKind.ColonEqual:
		case OTokenKind.EqualGreat:
		case OTokenKind.PeriodPeriod:
		case OTokenKind.Period:
		case OTokenKind.ColonColon:
		case OTokenKind.Bslash:
			return true;
		default:
			return false;
	}
}
