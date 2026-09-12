import { BUILTIN_TYPES, OTokenKind, type SyntaxKind } from "./syntax_kind.ts";

export type GreenElement = GreenNode | GreenToken;

export class GreenNode {
	public readonly kind: SyntaxKind;
	public readonly children: GreenElement[];
	private readonly length: number;

	constructor(kind: SyntaxKind, children: GreenElement[]) {
		this.kind = kind;
		this.children = children;

		let length = 0;
		for (const elem of this.children) {
			length += elem.getLength();
		}
		this.length = length;
	}

	/** Returns the node's character count, including all children. */
	getLength(): number {
		return this.length;
	}

	toString() {
		return `Node ${this.kind}`;
	}
}

export class GreenToken {
	public readonly kind: SyntaxKind;
	public readonly text: string;

	constructor(kind: SyntaxKind, text: string) {
		this.kind = kind;
		this.text = text;
	}

	/** Returns the token's character count. */
	getLength(): number {
		return this.text.length;
	}

	toString() {
		return `Leaf ${this.kind} "${this.text}"`;
	}

	/** Reports if the token is whitespace. */
	isTrivia(): boolean {
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

	/** Reports if the token ends a statement. */
	isStmtEnd(): boolean {
		switch (this.kind) {
			case OTokenKind.Semicolon:
			case OTokenKind.End:
				return true;
			default:
				return false;
		}
	}

	/** Reports if the token is type identifier. */
	isTypeSpecifier(): boolean {
		switch (this.kind) {
			case OTokenKind.KwInt:
			case OTokenKind.KwString:
			case OTokenKind.KwChar:
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
 * Returns a string representation for the given green node.
 */
export function ppGreenTree(node: GreenNode): string {
	function loop(n: number, green: GreenElement): string {
		if (green instanceof GreenToken) {
			return green.toString();
		} else {
			let res = green.toString();

			for (const child of green.children) {
				res += `\n${" ".repeat(2 * n)}`;
				res += loop(n + 1, child);
			}

			return res;
		}
	}

	return loop(1, node);
}
