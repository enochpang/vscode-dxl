import assert from "node:assert";

import { GreenNode, type GreenElement, GreenToken } from "./green_tree";
import type { SyntaxKind } from "./syntax_kind";

export class GreenBuilder {
	private cache = new GreenCache();
	private children: GreenElement[] = [];
	private nodes: [SyntaxKind, GreenElement[]][] = [];

	addToken(kind: SyntaxKind, text: string) {
		const token = this.cache.getToken(kind, text);
		this.children.push(token);
	}

	startNode(kind: SyntaxKind) {
		this.nodes.push([kind, this.children.slice()]);
		this.children.length = 0;
	}

	finishNode() {
		assert.notEqual(this.nodes.length, 0);

		const head = this.nodes.pop();
		if (head) {
			const [kind, old_children] = head;
			const node = this.cache.getNode(kind, this.children);
			old_children.push(node);
			this.children = old_children;
		}
	}

	getTree(): GreenNode | undefined {
		assert.equal(this.nodes.length, 1);

		const head = this.nodes.pop();
		if (head) {
			const [kind, _old_children] = head;
			const node = this.cache.getNode(kind, this.children);
			return node;
		}

		return undefined;
	}
}

export class GreenCache {
	private tokens: Map<number, GreenToken> = new Map();

	getToken(kind: SyntaxKind, text: string) {
		const hash = cyrb53(kind + text);
		const token = this.tokens.get(hash);
		if (token) {
			return token;
		} else {
			const new_token = new GreenToken(kind, text);
			this.tokens.set(hash, new GreenToken(kind, text));
			return new_token;
		}
	}

	getNode(kind: SyntaxKind, children: GreenElement[]) {
		const new_node = new GreenNode(kind, children);
		return new_node;
	}
}

function cyrb53(str: string, seed = 0): number {
	let h1 = 0xdeadbeef ^ seed;
	let h2 = 0x41c6ce57 ^ seed;
	for (let i = 0; i < str.length; i++) {
		const ch = str.charCodeAt(i);
		h1 = Math.imul(h1 ^ ch, 2654435761);
		h2 = Math.imul(h2 ^ ch, 1597334677);
	}
	h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
	h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
	h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
	h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);
	return 4294967296 * (2097151 & h2) + (h1 >>> 0);
}
