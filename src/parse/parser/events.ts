import { strict as assert } from "node:assert";

import { GreenNode } from "../syntax/green_tree";
import { OTokenKind, type NodeKind } from "../syntax/syntax_kind";
import type { GreenToken } from "../syntax/green_tree";
import { type ParseError, Parser } from "./parser";

export type ParseResult<T> = {
	tree: T | undefined;
	errors: ParseError[];
};

export function parse(lex_items: GreenToken[]): ParseResult<GreenNode> {
	const parser = new Parser(lex_items);
	const events = parser.parse();
	const tree = process_events(lex_items, events);

	return {
		tree: tree,
		errors: parser.get_errors(),
	};
}

export type OpenEvent = {
	event_kind: "START_NODE";
	kind: NodeKind;
	forward_parent: number;
};

export type CloseEvent = {
	event_kind: "FINISH_NODE";
};

export type AdvanceEvent = {
	event_kind: "ADD_TOKEN";
};

export type SkipEvent = {
	event_kind: "SKIP";
};

export type PlaceholderEvent = {
	event_kind: "PLACEHOLDER";
};

export type ParseEvent =
	| OpenEvent
	| CloseEvent
	| AdvanceEvent
	| SkipEvent
	| PlaceholderEvent;

export type EventKind = ParseEvent["event_kind"];

export function process_events(
	lex_items: GreenToken[],
	events: ParseEvent[],
): GreenNode | undefined {
	const builder: GreenNode[] = [];
	const forward_kinds: string[] = [];
	let pos = 0;

	// Remove the last close event event so builder has one item after iterating through the events
	const last_item = events.pop();
	assert.notEqual(last_item, undefined);
	assert.equal(last_item?.event_kind, "FINISH_NODE");

	for (let i = 0; i < events.length; i++) {
		const event = events[i];

		switch (event.event_kind) {
			case "START_NODE": {
				forward_kinds.push(event.kind);

				let idx = i;
				let fp = event.forward_parent;

				while (fp !== -1) {
					idx += fp;

					const forward_event = events[idx];
					events[idx] = {
						event_kind: "PLACEHOLDER",
					};

					if (forward_event.event_kind === "START_NODE") {
						forward_kinds.push(forward_event.kind);
						fp = forward_event.forward_parent;
					} else {
						assert.fail("Unreachable");
					}
				}

				const count = forward_kinds.length;
				for (let j = 0; j < count; j++) {
					const kind = forward_kinds.pop();
					if (kind !== undefined && kind !== "PLACEHOLDER") {
						builder.push(new GreenNode(kind, []));
					}
				}

				break;
			}
			case "FINISH_NODE": {
				const tree = builder.pop();
				if (tree !== undefined) {
					const parent_node = builder[builder.length - 1];
					parent_node.children.push(tree);
				}
				break;
			}
			case "ADD_TOKEN": {
				const lex_item = lex_items[pos];
				builder[builder.length - 1].children.push(lex_item);
				pos += 1;
				break;
			}
			case "SKIP":
				pos += 1;
				break;
			case "PLACEHOLDER":
				break;
			default:
				break;
		}

		// Consume trivia tokens
		while (pos < lex_items.length) {
			const item = lex_items[pos];
			if (!item.token.is_trivia() && item.token.kind !== OTokenKind.End) {
				break;
			}

			pos += 1;
		}
	}

	assert.equal(builder.length, 1);

	return builder.pop();
}
