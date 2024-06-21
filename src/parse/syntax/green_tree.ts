import { BUILTIN_TYPES, OTokenKind, type SyntaxKind } from "./syntax_kind";

export type GreenElement = GreenNode | GreenToken;

export class GreenNode {
	public kind: SyntaxKind;
	public children: GreenElement[];
	private length: number;

	constructor(kind: SyntaxKind, children: GreenElement[]) {
		this.kind = kind;
		this.children = children;

		let length = 0;
		for (const elem of this.children) {
			length += elem.getLength();
		}
		this.length = length;
	}

	getLength(): number {
		return this.length;
	}

	toString() {
		return `Node ${this.kind}`;
	}
}

export class GreenToken {
	public kind: SyntaxKind;
	public text: string;

	constructor(kind: SyntaxKind, text: string) {
		this.kind = kind;
		this.text = text;
	}

	getLength(): number {
		return this.text.length;
	}

	toString() {
		return `Leaf ${this.kind} "${this.text}"`;
	}

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

	isStmtEnd(): boolean {
		switch (this.kind) {
			case OTokenKind.Semicolon:
			case OTokenKind.End:
				return true;
			default:
				return false;
		}
	}

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
