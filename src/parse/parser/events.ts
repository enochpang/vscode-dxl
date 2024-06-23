import assert from "node:assert/strict";

import type { GreenNode } from "../syntax/green_tree";
import type { NodeKind } from "../syntax/syntax_kind";
import { GreenBuilder } from "../syntax/green_builder";
import type { LexResult } from "../lexer/lexer";
import type { ParseError } from "./lib";

export type OpenEvent = {
	tag: "START_NODE";
	kind: NodeKind;
};

export type CloseEvent = {
	tag: "FINISH_NODE";
};

export type AdvanceEvent = {
	tag: "ADD_TOKEN";
};

export type SkipEvent = {
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
	| OpenEvent
	| CloseEvent
	| AdvanceEvent
	| PlaceholderEvent
	| SkipEvent
	| ErrorEvent;

export type EventKind = ParseEvent["tag"];

export function buildTree(
	lex_result: LexResult,
	events: ParseEvent[],
): [GreenNode, ParseError[]] {
	const tokens = lex_result.tokens;
	const builder: GreenBuilder = new GreenBuilder();
	const errors: ParseError[] = [];
	let offset = 0;
	let cur = 0;

	// Remove the last close event event so the stack has one item after iterating through the events.
	const last_event = events.pop();
	assert.notEqual(last_event, undefined);
	assert.equal(last_event?.tag, "FINISH_NODE");

	for (let i = 0; i < events.length; i++) {
		const event = events[i];

		switch (event.tag) {
			case "START_NODE":
				builder.startNode(event.kind);
				break;
			case "FINISH_NODE": {
				builder.finishNode();
				break;
			}
			case "ADD_TOKEN": {
				const token = tokens[cur];
				builder.addToken(token.kind, token.text);
				offset += token.getLength();
				cur += 1;
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
