import assert from "node:assert/strict";

import type { GreenNode } from "../syntax/green_tree";
import type { NodeKind, SyntaxKind } from "../syntax/syntax_kind";
import { GreenBuilder } from "../syntax/green_builder";
import type { LexResult } from "../lexer/lexer";
import type { ParseError } from "./lib";

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

export function buildTree(
	lex_result: LexResult,
	events: ParseEvent[],
): [GreenNode, ParseError[]] {
	const tokens = lex_result.tokens;
	const builder: GreenBuilder = new GreenBuilder();
	const errors: ParseError[] = [];
	const kinds: SyntaxKind[] = [];
	let offset = 0;
	let cur = 0;

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
				const token = tokens[cur];
				builder.addToken(token.kind, token.text);
				offset += token.getLength();
				cur += 1;
				break;
			}
			case "FINISH_NODE": {
				builder.finishNode();
				break;
			}
			case "SKIP_TOKEN": {
				const token = tokens[cur];
				offset += token.getLength();
				cur += 1;
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
