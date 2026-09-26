type primitive = boolean | number | string | null;

export interface HirNode {
	tag: string;
}

export type Expr =
	| ArrowExpr
	| AssignmentExpr
	| BinaryExpr
	| CallExpr
	| CastExpr
	| CompareExpr
	| GetExpr
	| GroupingExpr
	| LiteralExpr
	| LogicalExpr
	| IndexExpr
	| NameRefExpr
	| NameRefListExpr
	| PostfixExpr
	| PrefixExpr
	| RangeExpr
	| SetExpr
	| StringConcatExpr
	| TernaryExpr
	| WriteExpr
	| MissingExpr;

export class ArrowExpr implements HirNode {
	public readonly tag = "ArrowExpr";

	public left: Expr;
	public op: string;
	public right: Expr;

	constructor(left: Expr, op: string, right: Expr) {
		this.left = left;
		this.op = op;
		this.right = right;
	}
}

export class AssignmentExpr implements HirNode {
	public readonly tag = "AssignmentExpr";

	public name: Expr;
	public op: string;
	public value: Expr;

	constructor(name: Expr, op: string, value: Expr) {
		this.name = name;
		this.op = op;
		this.value = value;
	}
}

export class BinaryExpr implements HirNode {
	public readonly tag = "BinaryExpr";

	public left: Expr;
	public op: string;
	public right: Expr;

	constructor(left: Expr, op: string, right: Expr) {
		this.left = left;
		this.op = op;
		this.right = right;
	}
}

export class CallExpr implements HirNode {
	public readonly tag = "CallExpr";

	public name: Expr;
	public args: Expr[];

	constructor(name: Expr, args: Expr[]) {
		this.name = name;
		this.args = args;
	}
}

export class CastExpr implements HirNode {
	public readonly tag = "CastExpr";

	public typing: Expr;
	public expr: Expr;

	constructor(typing: Expr, expr: Expr) {
		this.typing = typing;
		this.expr = expr;
	}
}

export class CompareExpr implements HirNode {
	public readonly tag = "CompareExpr";

	public left: Expr;
	public op: string;
	public right: Expr;

	constructor(left: Expr, op: string, right: Expr) {
		this.left = left;
		this.op = op;
		this.right = right;
	}
}

export class GetExpr implements HirNode {
	public readonly tag = "GetExpr";

	public name: Expr;
	public property: Expr;

	constructor(name: Expr, property: Expr) {
		this.name = name;
		this.property = property;
	}
}

export class GroupingExpr implements HirNode {
	public readonly tag = "GroupingExpr";

	public expr: Expr;

	constructor(expr: Expr) {
		this.expr = expr;
	}
}

export class IndexExpr implements HirNode {
	public readonly tag = "IndexExpr";

	public name: Expr;
	public index: Expr;

	constructor(name: Expr, index: Expr) {
		this.name = name;
		this.index = index;
	}
}

export class LiteralExpr implements HirNode {
	public readonly tag = "LiteralExpr";

	public value: primitive;

	constructor(value: primitive) {
		this.value = value;
	}
}

export class LogicalExpr implements HirNode {
	public readonly tag = "LogicalExpr";

	public left: Expr;
	public op: string;
	public right: Expr;

	constructor(left: Expr, op: string, right: Expr) {
		this.left = left;
		this.op = op;
		this.right = right;
	}
}

export class NameRefExpr implements HirNode {
	public readonly tag = "NameRefExpr";

	public name: Expr;

	constructor(name: Expr) {
		this.name = name;
	}
}

export class NameRefListExpr implements HirNode {
	public readonly tag = "NameRefListExpr";

	public names: Expr[];

	constructor(names: Expr[]) {
		this.names = names;
	}
}

export class PostfixExpr implements HirNode {
	public readonly tag = "PostfixExpr";

	public op: string;
	public right: Expr;

	constructor(op: string, right: Expr) {
		this.op = op;
		this.right = right;
	}
}

export class PrefixExpr implements HirNode {
	public readonly tag = "PrefixExpr";

	public left: Expr;
	public op: string;

	constructor(left: Expr, op: string) {
		this.left = left;
		this.op = op;
	}
}

export class RangeExpr implements HirNode {
	public readonly tag = "RangeExpr";

	public start: Expr;
	public end: Expr;

	constructor(start: Expr, end: Expr) {
		this.start = start;
		this.end = end;
	}
}

export class SetExpr implements HirNode {
	public readonly tag = "SetExpr";

	public name: Expr;
	public property: Expr;
	public value: Expr;

	constructor(name: Expr, property: Expr, value: Expr) {
		this.name = name;
		this.property = property;
		this.value = value;
	}
}

export class StringConcatExpr implements HirNode {
	public readonly tag = "StringConcatExpr";

	public left: Expr;
	public right: Expr;

	constructor(left: Expr, right: Expr) {
		this.left = left;
		this.right = right;
	}
}

export class TernaryExpr implements HirNode {
	public readonly tag = "TernaryExpr";

	public condition: Expr;
	public thenBranch: Expr;
	public elseBranch: Expr;

	constructor(condition: Expr, thenBranch: Expr, elseBranch: Expr) {
		this.condition = condition;
		this.thenBranch = thenBranch;
		this.elseBranch = elseBranch;
	}
}

export class WriteExpr implements HirNode {
	public readonly tag = "WriteExpr";

	public left: Expr;
	public right: Expr;

	constructor(left: Expr, right: Expr) {
		this.left = left;
		this.right = right;
	}
}

export class MissingExpr implements HirNode {
	public readonly tag = "MissingExpr";
}

/**
 * Returns a string representation for the given Expr.
 */
export function ppHirExpr(expr: Expr): string {
	function parenthesize(name: string, ...exprs: Expr[]): string {
		const result = [];

		result.push("(");

		if (name !== "") {
			result.push(name);
		}

		for (const expr of exprs) {
			result.push(" ");
			result.push(visit(expr));
		}

		result.push(")");

		return result.join("");
	}

	function visit(expr: Expr): string {
		switch (expr.tag) {
			case "ArrowExpr":
				return parenthesize(expr.op, expr.left, expr.right);
			case "AssignmentExpr":
				return parenthesize(expr.op, expr.name, expr.value);
			case "BinaryExpr":
				return parenthesize(expr.op, expr.left, expr.right);
			case "CallExpr":
				return parenthesize(visit(expr.name), ...expr.args);
			case "CastExpr":
				return parenthesize("CAST", expr.typing, expr.expr);
			case "CompareExpr":
				return parenthesize(expr.op, expr.left, expr.right);
			case "GetExpr":
				return parenthesize("GET", expr.name, expr.property);
			case "GroupingExpr":
				return parenthesize("", expr.expr);
			case "IndexExpr":
				return parenthesize("INDEX", expr.name, expr.index);
			case "LiteralExpr":
				if (expr.value === null) {
					return "NULL";
				} else if (typeof expr.value === "string") {
					return expr.value as string;
				} else {
					return expr.value.toString();
				}
			case "LogicalExpr":
				return parenthesize(expr.op, expr.left, expr.right);
			case "NameRefExpr":
				return parenthesize("NAMEREF", expr.name);
			case "NameRefListExpr":
				return parenthesize("NAMEREFLIST", ...expr.names);
			case "PostfixExpr":
				return parenthesize(expr.op, expr.right);
			case "PrefixExpr":
				return parenthesize(expr.op, expr.left);
			case "RangeExpr":
				return parenthesize("RANGE", expr.start, expr.end);
			case "SetExpr":
				return parenthesize("SET", expr.name, expr.property, expr.value);
			case "StringConcatExpr":
				return parenthesize("CONCAT", expr.left, expr.right);
			case "TernaryExpr":
				return parenthesize("TERNARY", expr.condition, expr.thenBranch, expr.elseBranch);
			case "WriteExpr":
				return parenthesize("WRITE", expr.left, expr.right);
			case "MissingExpr":
				return parenthesize("MISSING");
		}
	}

	return visit(expr);
}
