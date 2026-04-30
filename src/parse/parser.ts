import assert from "node:assert/strict";

import type { GreenNode, GreenToken } from "./syntax/green_tree.ts";
import {
	type NodeKind,
	ONodeKind,
	OTokenKind,
	type SyntaxKind,
} from "./syntax/syntax_kind.ts";
import { parseDeclaration } from "./grammar.ts";
import type { LexResult } from "./lexer.ts";
import { GreenBuilder } from "./syntax/green_builder.ts";

export type MarkOpened = {
	index: number;
};

export type MarkClosed = {
	index: number;
	kind: NodeKind;
};

export type StartNode = {
	tag: "START_NODE";
	kind: NodeKind;
	forward_parent: number | undefined;
};

export type FinishNode = {
	tag: "FINISH_NODE";
};

export type AddToken = {
	tag: "ADD_TOKEN";
};

export type SkipToken = {
	tag: "SKIP_TOKEN";
};

export type ErrorEvent = {
	tag: "ERROR";
	message: string;
};

export type PlaceholderEvent = {
	tag: "PLACEHOLDER";
};

export type ParseEvent =
	| StartNode
	| FinishNode
	| AddToken
	| SkipToken
	| PlaceholderEvent
	| ErrorEvent;

export type EventKind = ParseEvent["tag"];

export type ParseError = {
	offset: number;
	message: string;
};

export type ParseResult<T> = {
	tree: T | undefined;
	errors: ParseError[];
};

export function parse(lex_result: LexResult): ParseResult<GreenNode> {
	const tokens = lex_result.tokens;
	const parser = new Parser(tokens);
	const events = parser.parse();
	const [tree, errors] = buildTree(lex_result, events);

	return {
		tree: tree,
		errors: errors,
	};
}

export function buildTree(
	lex_result: LexResult,
	events: ParseEvent[],
): [GreenNode, ParseError[]] {
	const tokens = lex_result.tokens;
	const builder: GreenBuilder = new GreenBuilder();
	const errors: ParseError[] = [];
	const kinds: SyntaxKind[] = [];
	let offset = 0;
	let cursor = 0;

	// Remove the last close event event so the stack has one item after iterating through the events.
	const last_event = events.pop();
	assert.notEqual(last_event, undefined);
	assert.equal(last_event?.tag, "FINISH_NODE");

	for (let event_index = 0; event_index < events.length; event_index++) {
		const event = events[event_index];
		events[event_index] = { tag: "PLACEHOLDER" };

		switch (event.tag) {
			case "START_NODE": {
				kinds.push(event.kind);
				let idx = event_index;
				let ofp = event.forward_parent;

				while (ofp) {
					idx += ofp;

					const event = events[idx];
					events[idx] = { tag: "PLACEHOLDER" };

					if (event.tag === "START_NODE") {
						kinds.push(event.kind);
						ofp = event.forward_parent;
					} else {
						assert.fail("Unreachable");
					}
				}

				for (let i = kinds.length - 1; i >= 0; i--) {
					const kind = kinds[i];
					builder.startNode(kind);
				}

				kinds.length = 0;

				break;
			}
			case "ADD_TOKEN": {
				const token = tokens[cursor];
				builder.addToken(token.kind, token.text);
				offset += token.getLength();
				cursor += 1;
				break;
			}
			case "FINISH_NODE": {
				builder.finishNode();
				break;
			}
			case "SKIP_TOKEN": {
				const token = tokens[cursor];
				offset += token.getLength();
				cursor += 1;
				break;
			}
			case "ERROR": {
				errors.push({
					offset: offset,
					message: event.message,
				});
				break;
			}
		}
	}

	return [builder.getTree() as GreenNode, errors];
}

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
		const new_m = this.open();

		const event = this.events[m.index];
		if (event.tag === "START_NODE") {
			this.events[m.index] = {
				tag: "START_NODE",
				kind: event.kind,
				forward_parent: new_m.index - m.index,
			};
		} else {
			assert.fail("Unreachable");
		}

		return new_m;
	}

	/**
	 * Completes the marker with the given syntax kind.
	 */
	close(m: MarkOpened, kind: NodeKind): MarkClosed {
		assert.equal(this.events[m.index].tag, "PLACEHOLDER");

		this.events[m.index] = {
			tag: "START_NODE",
			kind: kind,
			forward_parent: undefined,
		};

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
