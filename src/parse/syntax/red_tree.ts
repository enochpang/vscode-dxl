import { GreenNode, GreenToken } from "./green_tree";
import { OTokenKind, type SyntaxKind } from "./syntax_kind";

export interface OffsetRange {
	start: number;
	end: number;
}

export type RedElement = RedNode | RedToken;

export class RedNode {
	public green: GreenNode;
	public offset: number;
	public parent: RedNode | undefined;

	constructor(green: GreenNode, offset: number) {
		this.green = green;
		this.offset = offset;
	}

	getKind(): SyntaxKind {
		return this.green.kind;
	}

	getOffsetRange(): OffsetRange {
		return {
			start: this.offset,
			end: this.offset + this.green.getLength(),
		};
	}

	*children(): Generator<RedElement> {
		let offset_sum = this.offset;

		for (let i = 0; i < this.green.children.length; i++) {
			const child = this.green.children[i];

			if (child instanceof GreenNode) {
				const syntax_node = new RedNode(child, offset_sum);
				syntax_node.parent = this;
				yield syntax_node;
			} else if (child instanceof GreenToken) {
				const syntax_token = new RedToken(child, offset_sum);
				syntax_token.parent = this;
				yield syntax_token;
			}

			offset_sum += child.getLength();
		}
	}

	*childrenNodes(): Generator<RedNode> {
		for (const child of this.children()) {
			if (child instanceof RedNode) {
				yield child;
			}
		}
	}

	*childrenTokens(): Generator<RedToken> {
		for (const child of this.children()) {
			if (child instanceof RedToken) {
				yield child;
			}
		}
	}

	*ancestors(): Generator<RedNode> {
		let parent = this.parent;

		while (parent) {
			yield parent;
			parent = parent.parent;
		}
	}

	toString() {
		const kind = this.getKind();
		const range = this.getOffsetRange();
		return `Node ${kind}@${range.start}..${range.end}`;
	}
}

export class RedToken {
	public green: GreenToken;
	public offset: number;
	public parent: RedNode | undefined;

	constructor(green: GreenToken, offset: number) {
		this.green = green;
		this.offset = offset;
	}

	getKind(): SyntaxKind {
		return this.green.kind;
	}

	getOffsetRange(): OffsetRange {
		return {
			start: this.offset,
			end: this.offset + this.green.getLength(),
		};
	}

	*ancestors(): Generator<RedNode> {
		let parent = this.parent;

		while (parent) {
			yield parent;
			parent = parent.parent;
		}
	}

	toString() {
		const kind = this.getKind();
		const range = this.getOffsetRange();
		const text = this.green.text;

		if (kind === OTokenKind.Eol || kind === OTokenKind.End) {
			return `Leaf ${kind}@${range.start}..${range.end}`;
		} else {
			return `Leaf ${kind}@${range.start}..${range.end} "${text}"`;
		}
	}
}

export function ppRedTree(node: RedNode): string {
	function loop(n: number, red: RedElement): string {
		if (red instanceof RedToken) {
			return red.toString();
		} else {
			let res = red.toString();

			for (const child of red.children()) {
				res += `\n${" ".repeat(2 * n)}`;
				res += loop(n + 1, child);
			}

			return res;
		}
	}

	return loop(1, node);
}
