import { GreenNode, GreenToken, pp_green_element } from "./green_tree";

export type RedElement = RedNode | RedToken;

export class RedNode {
	public green: GreenNode;
	public index: number;
	public parent: RedNode | undefined;

	constructor(green: GreenNode, index: number) {
		this.green = green;
		this.index = index;
	}

	public *children(): Generator<RedElement> {
		for (let i = 0; i < this.green.children.length; i++) {
			const child = this.green.children[i];

			if (child instanceof GreenNode) {
				const syntax_node = new RedNode(child, i);
				syntax_node.parent = this;
				yield syntax_node;
			} else if (child instanceof GreenToken) {
				const syntax_token = new RedToken(child, i);
				syntax_token.parent = this;
				yield syntax_token;
			}
		}
	}

	public *children_rev(): Generator<RedElement> {
		for (let i = this.green.children.length - 1; i >= 0; i--) {
			const child = this.green.children[i];

			if (child instanceof GreenNode) {
				const syntax_node = new RedNode(child, i);
				syntax_node.parent = this;
				yield syntax_node;
			} else if (child instanceof GreenToken) {
				const syntax_token = new RedToken(child, i);
				syntax_token.parent = this;
				yield syntax_token;
			}
		}
	}

	public *children_nodes(): Generator<RedNode> {
		for (const child of this.children()) {
			if (child instanceof RedNode) {
				yield child;
			}
		}
	}

	public *children_tokens(): Generator<RedToken> {
		for (const child of this.children()) {
			if (child instanceof RedToken) {
				yield child;
			}
		}
	}

	public *ancestors(): Generator<RedNode> {
		let parent = this.parent;

		while (parent) {
			yield parent;
			parent = parent.parent;
		}
	}

	public *previous(): Generator<RedNode> {
		const start_offset = this.green.get_start_offset();

		for (const parent of this.ancestors()) {
			for (const child of parent.children_rev()) {
				if (
					child instanceof RedNode &&
					child.green.get_start_offset() < start_offset
				) {
					yield child;
				}
			}
		}
	}
}

export class RedToken {
	public green: GreenToken;
	public index: number;
	public parent: RedNode | undefined;

	constructor(green: GreenToken, index: number) {
		this.green = green;
		this.index = index;
	}

	public *ancestors(): Generator<RedNode> {
		let parent = this.parent;

		while (parent) {
			yield parent;
			parent = parent.parent;
		}
	}
}

export function pp_red_element(elem: RedElement): string {
	return pp_green_element(elem.green);
}
