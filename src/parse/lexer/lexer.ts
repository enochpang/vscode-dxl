import { OTokenKind, type TokenKind } from "../syntax/syntax_kind";
import {
	GreenToken,
	TOKEN_KEYWORD as TOKEN_KEYWORDS,
	TextPosition as Location,
	Token,
} from "../syntax/green_tree";

export function tokenize(input: string): GreenToken[] {
	const lexer = new Lexer(input);
	const res: GreenToken[] = [];

	while (true) {
		const [token, text] = lexer.next_token();
		res.push(new GreenToken(token, text));

		if (token.kind === OTokenKind.Eof) {
			break;
		}
	}

	return res;
}

export class Lexer {
	private input: string;
	private offset = 0;
	private rdoffset = 0;
	private line = 0;
	private rdline = 0;
	private col = 0;
	private rdcol = 0;
	private ignore_end = false;

	constructor(documentText: string) {
		this.input = documentText;
	}

	/**
	 * Returns the next token in the input
	 */
	public next_token(): [Token, string] {
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
					kind = this.read_singleline_comment();
				} else if (this.peek() === "*") {
					kind = this.read_mutliline_comment();
				} else {
					kind = OTokenKind.Fslash;
				}
				break;
			case "\r":
				this.consume("\n");
				this.rdline += 1;
				this.rdcol = 0;

				while (this.consume("\r")) {
					this.consume("\n");
					this.rdline += 1;
					this.rdcol = 0;
				}

				if (this.ignore_end) {
					kind = OTokenKind.Eol;
				} else {
					kind = OTokenKind.End;
				}

				break;
			case "\n":
				this.rdline += 1;
				this.rdcol = 0;

				while (this.consume("\n")) {
					this.rdline += 1;
					this.rdcol = 0;
				}

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
				kind = this.read_string("'");
				break;
			case '"':
				kind = this.read_string('"');
				break;
			case "#":
				kind = this.read_ident();
				break;
			case "\0":
				kind = OTokenKind.Eof;
				break;
			default:
				if (isAlpha(ch)) {
					kind = this.read_ident();
				} else if (isDigit(ch)) {
					kind = this.read_number();
				} else {
					kind = OTokenKind.LexError;
				}
				break;
		}

		const token = this.emit(kind);
		const text = this.current_lexeme();

		if (kind === OTokenKind.Ident) {
			const val = TOKEN_KEYWORDS.get(text);
			if (val !== undefined) {
				token.kind = val;
			}
		}

		this.line = this.rdline;
		this.col = this.rdcol;
		this.offset = this.rdoffset;

		if (token.kind === OTokenKind.Comment) {
			this.ignore_end = text[text.length - 1] === "-";
		} else {
			this.ignore_end = check_ignore_end(token.kind);
		}

		return [token, text];
	}

	/**
	 * Returns a ident token
	 */
	private read_ident(): TokenKind {
		while (isAlphanum(this.peek()) || this.peek() === "_") {
			this.advance();
		}

		return OTokenKind.Ident;
	}

	/**
	 * Returns a integer or real token
	 */
	private read_number(): TokenKind {
		this.read_integer();

		if (this.consume(".")) {
			this.read_integer();

			if (this.consume("e") || this.consume("E")) {
				this.read_integer();
			}

			return OTokenKind.Real;
		}
		if (this.consume("e") || this.consume("E")) {
			this.read_integer();

			return OTokenKind.Real;
		} else {
			return OTokenKind.Integer;
		}
	}

	private read_integer() {
		while (isDigit(this.peek())) {
			this.advance();
		}
	}

	/**
	 * Returns a string token
	 */
	private read_string(qouteCh: string): TokenKind {
		while (true) {
			if (this.peek() === "\0") break;

			if (this.peek() === qouteCh) {
				// The closing quote
				this.advance();
				break;
			}

			if (this.peek() === "\n") {
				this.rdline += 1;
				this.rdcol = 0;
			}

			const ch = this.advance();

			if (ch === "\\") {
				this.advance();
			}
		}

		return OTokenKind.String;
	}

	/**
	 * Returns a (single-line) comment token
	 */
	private read_singleline_comment(): TokenKind {
		while (true) {
			if (this.peek() === "\0") break;
			if (this.peek() === "\r") break;
			if (this.peek() === "\n") break;

			this.advance();
		}

		return OTokenKind.Comment;
	}

	/**
	 * Returns a (multi-line) comment token
	 */
	private read_mutliline_comment(): TokenKind {
		while (true) {
			if (this.peek() === "\0") break;

			if (this.peek() === "\n") {
				this.rdline += 1;
				this.rdcol = 0;
			}

			const ch = this.advance();

			if (ch === "*" && this.peek() === "/") {
				// The closing slash
				this.advance();
				break;
			}
		}

		return OTokenKind.Comment;
	}

	/**
	 * Returns a token with the lexer's state
	 */
	private emit(kind: TokenKind): Token {
		const startLoc = new Location(this.line, this.col);
		const endLoc = new Location(this.rdline, this.rdcol);
		const token = new Token(kind, this.offset, this.rdoffset, startLoc, endLoc);

		this.line = this.rdline;
		this.col = this.rdcol;

		return token;
	}

	/**
	 * Consumes the next character in the input if it matches the given char
	 */
	private consume(ch: string): boolean {
		if (this.peek() !== ch) {
			return false;
		}

		this.advance();
		return true;
	}

	/**
	 * Consumes the next character in the input
	 */
	private advance(): string {
		if (this.rdoffset >= this.input.length) {
			return "\0";
		} else {
			const ch = this.input[this.rdoffset];
			this.rdoffset += 1;
			this.rdcol += 1;
			return ch;
		}
	}

	/**
	 * Look ahead one character, without consuming it
	 */
	private peek(): string {
		return this.rdoffset >= this.input.length
			? "\0"
			: this.input[this.rdoffset];
	}

	/**
	 * Returns the current substring under observation
	 */
	private current_lexeme(): string {
		return this.input.substring(this.offset, this.rdoffset);
	}
}

/**
 * Reports if the given character is a digit
 */
function isDigit(ch: string): boolean {
	// 48 -> 0; 57 ->9
	const chCode = ch.charCodeAt(0);
	return chCode >= 48 && chCode <= 57;
}

/**
 * Reports if the given character is a letter
 */
function isAlpha(ch: string): boolean {
	// 65 -> A; 90 -> Z; 97 -> a; 122 -> z
	const chCode = ch.charCodeAt(0);
	return (chCode >= 65 && chCode <= 90) || (chCode >= 97 && chCode <= 122);
}

/**
 * Reports if the given character is a letter of digit
 */
function isAlphanum(ch: string): boolean {
	return isAlpha(ch) || isDigit(ch);
}

/**
 * Reports if the token kind prevents emitting end of statement tokens
 */
function check_ignore_end(kind: TokenKind): boolean {
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
