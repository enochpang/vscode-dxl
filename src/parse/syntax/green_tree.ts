import {
	BUILTIN_TYPES,
	type NodeKind,
	OTokenKind,
	type TokenKind,
} from "./syntax_kind";

/**
 * Represents the green lossless syntax tree
 */
export type GreenElement = GreenNode | GreenToken;

/**
 * Represents a branch within the green tree
 */
export class GreenNode {
	public kind: NodeKind;
	public children: GreenElement[];
	private start_offset!: number;
	private end_offset!: number;
	private start_loc!: TextPosition;
	private end_loc!: TextPosition;

	constructor(kind: NodeKind, children: GreenElement[]) {
		this.kind = kind;
		this.children = children;
	}

	private init() {
		if (this.children.length === 0) {
			this.start_offset = 0;
			this.end_offset = 0;
			this.start_loc = new TextPosition(0, 0);
			this.end_loc = new TextPosition(0, 0);
			return;
		}

		let first_child = this.children[0];
		while (first_child instanceof GreenNode) {
			first_child = first_child.children[0];
		}

		this.start_loc = first_child.token.start_loc;
		this.start_offset = first_child.token.offset;

		let last_child = this.children[this.children.length - 1];
		while (last_child instanceof GreenNode) {
			last_child = last_child.children[last_child.children.length - 1];
		}

		this.end_loc = last_child.token.end_loc;
		this.end_offset = last_child.token.end_offset;
	}

	get_start_loc(): TextPosition {
		if (this.start_loc === undefined) {
			this.init();
		}

		return this.start_loc;
	}

	get_end_loc(): TextPosition {
		if (this.end_loc === undefined) {
			this.init();
		}

		return this.end_loc;
	}

	get_start_offset(): number {
		if (this.start_offset === undefined) {
			this.init();
		}

		return this.start_offset;
	}

	get_end_offset(): number {
		if (this.start_offset === undefined) {
			this.init();
		}

		return this.end_offset;
	}
}

export class GreenToken {
	public token: Token;
	public text: string;

	constructor(token: Token, text: string) {
		this.token = token;
		this.text = text;
	}

	public is_type_specifier(): boolean {
		switch (this.token.kind) {
			case OTokenKind.KwInt:
			case OTokenKind.KwString:
			case OTokenKind.KwVoid:
			case OTokenKind.KwReal:
			case OTokenKind.KwBool:
				return true;
			case OTokenKind.Ident:
				return BUILTIN_TYPES.has(this.text);
			default:
				return false;
		}
	}
}

/**
 * Represents a lex item
 */
export class Token {
	public kind: TokenKind;
	public offset: number;
	public end_offset: number;
	public start_loc: TextPosition;
	public end_loc: TextPosition;

	constructor(
		kind: TokenKind,
		offset: number,
		endOffset: number,
		startLoc: TextPosition,
		endLoc: TextPosition,
	) {
		this.kind = kind;
		this.offset = offset;
		this.end_offset = endOffset;
		this.start_loc = startLoc;
		this.end_loc = endLoc;
	}

	public is_trivia(): boolean {
		switch (this.kind) {
			case OTokenKind.Comment:
			case OTokenKind.Spaces:
			case OTokenKind.Tabs:
			case OTokenKind.Eol:
				return true;
			default:
				return false;
		}
	}

	public is_stmt_end(): boolean {
		switch (this.kind) {
			case OTokenKind.Semicolon:
			case OTokenKind.End:
			case OTokenKind.Eof:
				return true;
			default:
				return false;
		}
	}
}

/**
 * Represents a location in the editor
 */
export class TextPosition {
	public line: number;
	public col: number;

	constructor(line: number, col: number) {
		this.line = line;
		this.col = col;
	}

	toString(): string {
		return `(${this.line}, ${this.col}))`;
	}
}

/**
 * Maps a string to a token kind
 */
export const TOKEN_KEYWORD = new Map<string, TokenKind>([
	["#include", OTokenKind.KwInclude],
	["and", OTokenKind.KwAnd],
	["bool", OTokenKind.KwBool],
	["break", OTokenKind.KwBreak],
	["by", OTokenKind.KwBy],
	["case", OTokenKind.KwCase],
	["char", OTokenKind.KwChar],
	["const", OTokenKind.KwConst],
	["continue", OTokenKind.KwContinue],
	["default", OTokenKind.KwDefault],
	["do", OTokenKind.KwDo],
	["else", OTokenKind.KwElse],
	["enum", OTokenKind.KwEnum],
	["false", OTokenKind.KwFalse],
	["for", OTokenKind.KwFor],
	["if", OTokenKind.KwIf],
	["in", OTokenKind.KwIn],
	["int", OTokenKind.KwInt],
	["module", OTokenKind.KwModule],
	["null", OTokenKind.KwNull],
	["object", OTokenKind.KwObject],
	["or", OTokenKind.KwOr],
	["pragma", OTokenKind.KwPragma],
	["real", OTokenKind.KwReal],
	["return", OTokenKind.KwReturn],
	["sizeof", OTokenKind.KwSizeof],
	["static", OTokenKind.KwStatic],
	["string", OTokenKind.KwString],
	["struct", OTokenKind.KwStruct],
	["switch", OTokenKind.KwSwitch],
	["then", OTokenKind.KwThen],
	["true", OTokenKind.KwTrue],
	["union", OTokenKind.KwUnion],
	["void", OTokenKind.KwVoid],
	["while", OTokenKind.KwWhile],
]);

export function pp_green_element(elem: GreenElement): string {
	if (elem instanceof GreenToken) {
		const token = elem.token;
		const kind = token.kind;
		const offset = token.offset;
		const end_offset = token.end_offset;
		const text = elem.text;
		return `Leaf ${kind}@${offset}..${end_offset} "${text}"`;
	} else {
		const kind = elem.kind;
		const offset = elem.get_start_offset();
		const end_offset = elem.get_end_offset();
		return `Node ${kind}@${offset}..${end_offset}`;
	}
}

/**
 * Returns the tree as a formatted string
 */
export function pp_cst(tree: GreenNode): string {
	function pp_cst_inner(n: number, tree: GreenElement): string {
		const newline = `\n${" ".repeat(2 * n)}`;

		if (tree instanceof GreenToken) {
			return pp_green_element(tree);
		} else {
			const res = [pp_green_element(tree)];

			for (const item of tree.children) {
				res.push(newline, pp_cst_inner(n + 1, item));
			}

			return res.join("");
		}
	}

	return pp_cst_inner(1, tree);
}
