import { strict as assert } from "node:assert";

import type { GreenToken } from "../syntax/green_tree";
import {
	OTokenKind,
	ONodeKind,
	type NodeKind,
	type SyntaxKind,
} from "../syntax/syntax_kind";
import { parseDeclaration } from "./grammar";
import type { ParseEvent } from "./events";

export type MarkOpened = {
	index: number;
};

export type MarkClosed = {
	index: number;
	kind: NodeKind;
};

export class Parser {
	private tokens: GreenToken[];
	private events: ParseEvent[] = [];
	private cursor = 0;
	private fuel = 256;

	constructor(tokens: GreenToken[]) {
		this.tokens = tokens;
	}

	parse(): ParseEvent[] {
		const m = this.open();

		while (!this.eof()) {
			parseDeclaration(this);

			if (this.peek().isStmtEnd()) {
				this.bump();
			}
		}

		this.close(m, ONodeKind.TreeRoot);

		return this.events;
	}

	/**
	 * Creates a marker at the parser's current position.
	 */
	open(): MarkOpened {
		const mark: MarkOpened = {
			index: this.events.length,
		};

		this.events.push({ tag: "PLACEHOLDER" });

		return mark;
	}

	/**
	 * Creates a marker before a closed marker.
	 */
	openBefore(m: MarkClosed): MarkOpened {
		const mark: MarkOpened = {
			index: m.index,
		};

		this.events.splice(m.index, 0, { tag: "PLACEHOLDER" });

		return mark;
	}

	/**
	 * Completes the marker with the given syntax kind.
	 */
	close(m: MarkOpened, kind: NodeKind): MarkClosed {
		assert.equal(this.events[m.index].tag, "PLACEHOLDER");

		this.events[m.index] = { tag: "START_NODE", kind: kind };
		this.events.push({ tag: "FINISH_NODE" });

		return {
			index: m.index,
			kind: kind,
		};
	}

	/**
	 * Moves the parser to the next valid statement starting token.
	 */
	synchronize(m: MarkOpened) {
		outer: while (!this.eof()) {
			switch (this.peek().kind) {
				case OTokenKind.Semicolon:
				case OTokenKind.KwFor:
				case OTokenKind.KwWhile:
				case OTokenKind.KwReturn:
				case OTokenKind.Eof:
				case OTokenKind.End:
					break outer;
				default:
					this.bump();
			}
		}

		this.close(m, ONodeKind.ErrorNode);
	}

	/**
	 * Consume the next token and adds an Skip Token event.
	 */
	skip() {
		assert.notEqual(this.cursor, this.tokens.length);

		this.fuel = 256;
		this.cursor += 1;
		this.events.push({ tag: "SKIP_TOKEN" });
	}

	/**
	 * Consume the next token and adds an Add Token event.
	 */
	bump() {
		assert.notEqual(this.cursor, this.tokens.length);

		this.fuel = 256;
		this.cursor += 1;
		this.events.push({ tag: "ADD_TOKEN" });
	}

	/**
	 * Consumes the next token and wraps it with the given token.
	 */
	bumpAs(kind: NodeKind): MarkClosed {
		const m = this.open();
		this.bump();
		return this.close(m, kind);
	}

	/**
	 * Returns the nth token ahead without consuming it.
	 */
	nth(lookahead: number): GreenToken {
		if (this.fuel <= 0) {
			const tok_kind = this.tokens[this.cursor].kind;
			assert.fail(`Parser is stuck: ${tok_kind}`);
		}

		this.fuel -= 1;

		if (this.cursor + lookahead >= this.tokens.length) {
			return this.tokens[this.tokens.length - 1];
		} else {
			return this.tokens[this.cursor + lookahead];
		}
	}

	/**
	 * Consumes tokens until a non-whitespace token is found.
	 */
	eatTrivia() {
		while (true) {
			const token = this.nth(0);

			if (token.isTrivia()) {
				this.bump();
			} else {
				break;
			}
		}
	}

	/**
	 * Returns the next non-whitespace token.
	 */
	peek(): GreenToken {
		this.eatTrivia();
		return this.nth(0);
	}

	/**
	 * Reports if the current token matches the given kind
	 */
	at(kind: SyntaxKind): boolean {
		if (this.peek().kind === kind) {
			return true;
		}

		return false;
	}

	/**
	 * Reports if the current token matches any of the given kinds
	 */
	atAny(kind: SyntaxKind[]): boolean {
		if (kind.includes(this.peek().kind)) {
			return true;
		}

		return false;
	}

	/**
	 * Advances the parser and adds the token the the accumulated nodes if it matches the given kind
	 */
	consume(kind: SyntaxKind): boolean {
		if (this.peek().kind === kind) {
			this.bump();
			return true;
		}

		return false;
	}

	/**
	 * Advances the parser and adds the token the the accumulated nodes if it matches the given kind
	 * Adds an error if it does not match
	 */
	expect(kind: SyntaxKind): boolean {
		const peek_tok = this.peek();

		if (peek_tok.kind === kind) {
			this.bump();
			return true;
		}

		this.addError(`Expected= ${kind}. Got= ${peek_tok.kind}`);
		return false;
	}

	/**
	 *Adds an error log to the parser.
	 */
	addError(message: string) {
		this.events.push({ tag: "ERROR", message: message });
	}

	/**
	 * Reports if the parser is at the end of input.
	 */
	eof(): boolean {
		return this.peek().kind === OTokenKind.Eof;
	}
}
