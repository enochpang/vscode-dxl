type primitive = boolean | number | string | null;

export interface HirExprVistable {
	accept<R>(visitor: HirExprVisitor<R>): R;
}

export interface HirExprVisitor<R> {
	visitArrowExpr(expr: ArrowExpr): R;
	visitAssignmentExpr(expr: AssignmentExpr): R;
	visitBinaryExpr(expr: BinaryExpr): R;
	visitCallExpr(expr: CallExpr): R;
	visitCastExpr(expr: CastExpr): R;
	visitCompareExpr(expr: CompareExpr): R;
	visitGetExpr(expr: GetExpr): R;
	visitGroupingExpr(expr: GroupingExpr): R;
	visitIndexExpr(expr: IndexExpr): R;
	visitLiteralExpr(expr: LiteralExpr): R;
	visitLogicalExpr(expr: LogicalExpr): R;
	visitNameRefExpr(expr: NameRefExpr): R;
	visitNameRefListExpr(expr: NameRefListExpr): R;
	visitPostfixExpr(expr: PostfixExpr): R;
	visitPrefixExpr(expr: PrefixExpr): R;
	visitRangeExpr(expr: RangeExpr): R;
	visitSetExpr(expr: SetExpr): R;
	visitStringConcatExpr(expr: StringConcatExpr): R;
	visitTernaryExpr(expr: TernaryExpr): R;
	visitWriteExpr(expr: WriteExpr): R;
	visitMissingExpr(): R;
}

export class ArrowExpr implements HirExprVistable {
	public left: HirExprVistable;
	public op: string;
	public right: HirExprVistable;

	constructor(left: HirExprVistable, op: string, right: HirExprVistable) {
		this.left = left;
		this.op = op;
		this.right = right;
	}

	accept<R>(visitor: HirExprVisitor<R>): R {
		return visitor.visitArrowExpr(this);
	}
}

export class AssignmentExpr implements HirExprVistable {
	public name: HirExprVistable;
	public op: string;
	public value: HirExprVistable;

	constructor(name: HirExprVistable, op: string, value: HirExprVistable) {
		this.name = name;
		this.op = op;
		this.value = value;
	}

	accept<R>(visitor: HirExprVisitor<R>): R {
		return visitor.visitAssignmentExpr(this);
	}
}

export class BinaryExpr implements HirExprVistable {
	public left: HirExprVistable;
	public op: string;
	public right: HirExprVistable;

	constructor(left: HirExprVistable, op: string, right: HirExprVistable) {
		this.left = left;
		this.op = op;
		this.right = right;
	}

	accept<R>(visitor: HirExprVisitor<R>): R {
		return visitor.visitBinaryExpr(this);
	}
}

export class CallExpr implements HirExprVistable {
	public name: HirExprVistable;
	public args: HirExprVistable[];

	constructor(name: HirExprVistable, args: HirExprVistable[]) {
		this.name = name;
		this.args = args;
	}

	accept<R>(visitor: HirExprVisitor<R>): R {
		return visitor.visitCallExpr(this);
	}
}

export class CastExpr implements HirExprVistable {
	public typing: HirExprVistable;
	public expr: HirExprVistable;

	constructor(typing: HirExprVistable, expr: HirExprVistable) {
		this.typing = typing;
		this.expr = expr;
	}

	accept<R>(visitor: HirExprVisitor<R>): R {
		return visitor.visitCastExpr(this);
	}
}

export class CompareExpr implements HirExprVistable {
	public left: HirExprVistable;
	public op: string;
	public right: HirExprVistable;

	constructor(left: HirExprVistable, op: string, right: HirExprVistable) {
		this.left = left;
		this.op = op;
		this.right = right;
	}

	accept<R>(visitor: HirExprVisitor<R>): R {
		return visitor.visitCompareExpr(this);
	}
}

export class GetExpr implements HirExprVistable {
	public name: HirExprVistable;
	public property: HirExprVistable;

	constructor(name: HirExprVistable, property: HirExprVistable) {
		this.name = name;
		this.property = property;
	}

	accept<R>(visitor: HirExprVisitor<R>): R {
		return visitor.visitGetExpr(this);
	}
}

export class GroupingExpr implements HirExprVistable {
	public expr: HirExprVistable;

	constructor(expr: HirExprVistable) {
		this.expr = expr;
	}

	accept<R>(visitor: HirExprVisitor<R>): R {
		return visitor.visitGroupingExpr(this);
	}
}

export class LiteralExpr implements HirExprVistable {
	public value: primitive;

	constructor(value: primitive) {
		this.value = value;
	}

	accept<R>(visitor: HirExprVisitor<R>): R {
		return visitor.visitLiteralExpr(this);
	}
}

export class LogicalExpr implements HirExprVistable {
	public left: HirExprVistable;
	public op: string;
	public right: HirExprVistable;

	constructor(left: HirExprVistable, op: string, right: HirExprVistable) {
		this.left = left;
		this.op = op;
		this.right = right;
	}

	accept<R>(visitor: HirExprVisitor<R>): R {
		return visitor.visitLogicalExpr(this);
	}
}

export class IndexExpr implements HirExprVistable {
	public name: HirExprVistable;
	public index: HirExprVistable;

	constructor(name: HirExprVistable, index: HirExprVistable) {
		this.name = name;
		this.index = index;
	}

	accept<R>(visitor: HirExprVisitor<R>): R {
		return visitor.visitIndexExpr(this);
	}
}

export class NameRefExpr implements HirExprVistable {
	public name: HirExprVistable;

	constructor(name: HirExprVistable) {
		this.name = name;
	}

	accept<R>(visitor: HirExprVisitor<R>): R {
		return visitor.visitNameRefExpr(this);
	}
}

export class NameRefListExpr implements HirExprVistable {
	public names: HirExprVistable[];

	constructor(names: HirExprVistable[]) {
		this.names = names;
	}

	accept<R>(visitor: HirExprVisitor<R>): R {
		return visitor.visitNameRefListExpr(this);
	}
}

export class PostfixExpr implements HirExprVistable {
	public op: string;
	public right: HirExprVistable;

	constructor(op: string, right: HirExprVistable) {
		this.op = op;
		this.right = right;
	}

	accept<R>(visitor: HirExprVisitor<R>): R {
		return visitor.visitPostfixExpr(this);
	}
}

export class PrefixExpr implements HirExprVistable {
	public left: HirExprVistable;
	public op: string;

	constructor(left: HirExprVistable, op: string) {
		this.left = left;
		this.op = op;
	}

	accept<R>(visitor: HirExprVisitor<R>): R {
		return visitor.visitPrefixExpr(this);
	}
}

export class RangeExpr implements HirExprVistable {
	public start: HirExprVistable;
	public end: HirExprVistable;

	constructor(start: HirExprVistable, end: HirExprVistable) {
		this.start = start;
		this.end = end;
	}

	accept<R>(visitor: HirExprVisitor<R>): R {
		return visitor.visitRangeExpr(this);
	}
}

export class SetExpr implements HirExprVistable {
	public name: HirExprVistable;
	public property: HirExprVistable;
	public value: HirExprVistable;

	constructor(name: HirExprVistable, property: HirExprVistable, value: HirExprVistable) {
		this.name = name;
		this.property = property;
		this.value = value;
	}

	accept<R>(visitor: HirExprVisitor<R>): R {
		return visitor.visitSetExpr(this);
	}
}

export class StringConcatExpr implements HirExprVistable {
	public left: HirExprVistable;
	public right: HirExprVistable;

	constructor(left: HirExprVistable, right: HirExprVistable) {
		this.left = left;
		this.right = right;
	}

	accept<R>(visitor: HirExprVisitor<R>): R {
		return visitor.visitStringConcatExpr(this);
	}
}

export class TernaryExpr implements HirExprVistable {
	public condition: HirExprVistable;
	public thenBranch: HirExprVistable;
	public elseBranch: HirExprVistable;

	constructor(condition: HirExprVistable, thenBranch: HirExprVistable, elseBranch: HirExprVistable) {
		this.condition = condition;
		this.thenBranch = thenBranch;
		this.elseBranch = elseBranch;
	}

	accept<R>(visitor: HirExprVisitor<R>): R {
		return visitor.visitTernaryExpr(this);
	}
}

export class WriteExpr implements HirExprVistable {
	public left: HirExprVistable;
	public right: HirExprVistable;

	constructor(left: HirExprVistable, right: HirExprVistable) {
		this.left = left;
		this.right = right;
	}

	accept<R>(visitor: HirExprVisitor<R>): R {
		return visitor.visitWriteExpr(this);
	}
}

export class MissingExpr implements HirExprVistable {
	accept<R>(visitor: HirExprVisitor<R>): R {
		return visitor.visitMissingExpr();
	}
}

/**
 * Returns a string representation for the given Expr.
 */
export function ppExpr(expr: HirExprVistable): string {
	const astPrinter = new AstPrinter();
	return astPrinter.parenthesize("", expr);
}

/**
 * Visitor to write the Expr to a string.
 */
export class AstPrinter implements HirExprVisitor<string> {
	parenthesize(name: string, ...exprs: HirExprVistable[]): string {
		const result = [];

		if (name !== "") {
			result.push("(");
			result.push(name);
		}

		for (const expr of exprs) {
			result.push(" ");
			result.push(expr.accept(this));
		}

		if (name !== "") {
			result.push(")");
		}

		return result.join("");
	}

	visitArrowExpr(expr: ArrowExpr): string {
		return this.parenthesize(expr.op, expr.left, expr.right);
	}

	visitAssignmentExpr(expr: AssignmentExpr): string {
		return this.parenthesize(expr.op, expr.name, expr.value);
	}

	visitBinaryExpr(expr: BinaryExpr): string {
		return this.parenthesize(expr.op, expr.left, expr.right);
	}

	visitCallExpr(expr: CallExpr): string {
		return this.parenthesize("call", expr.name, ...expr.args);
	}

	visitCastExpr(expr: CastExpr): string {
		return this.parenthesize("CAST", expr.typing, expr.expr);
	}

	visitCompareExpr(expr: CompareExpr): string {
		return this.parenthesize(expr.op, expr.left, expr.right);
	}

	visitGetExpr(expr: GetExpr): string {
		return this.parenthesize("GET", expr.name, expr.property);
	}

	visitGroupingExpr(expr: GroupingExpr): string {
		return this.parenthesize("GROUP", expr.expr);
	}

	visitIndexExpr(expr: IndexExpr): string {
		return this.parenthesize("INDEX", expr.name, expr.index);
	}

	visitLiteralExpr(expr: LiteralExpr): string {
		if (expr.value === null) {
			return "NULL";
		} else if (typeof expr.value === "string") {
			return expr.value as string;
		} else {
			return expr.value.toString();
		}
	}

	visitLogicalExpr(expr: LogicalExpr): string {
		return this.parenthesize(expr.op, expr.left, expr.right);
	}

	visitNameRefExpr(expr: NameRefExpr): string {
		return this.parenthesize("NAMEREF", expr.name);
	}

	visitNameRefListExpr(expr: NameRefListExpr): string {
		return this.parenthesize("NAMEREFLIST", ...expr.names);
	}

	visitPostfixExpr(expr: PostfixExpr): string {
		return this.parenthesize(expr.op, expr.right);
	}

	visitPrefixExpr(expr: PrefixExpr): string {
		return this.parenthesize(expr.op, expr.left);
	}

	visitRangeExpr(expr: RangeExpr): string {
		return this.parenthesize("RANGE", expr.start, expr.end);
	}

	visitSetExpr(expr: SetExpr): string {
		return this.parenthesize("SET", expr.name, expr.property, expr.value);
	}

	visitStringConcatExpr(expr: StringConcatExpr): string {
		return this.parenthesize("CONCAT", expr.left, expr.right);
	}

	visitTernaryExpr(expr: TernaryExpr): string {
		return this.parenthesize("TERNARY", expr.condition, expr.thenBranch, expr.elseBranch);
	}

	visitWriteExpr(expr: WriteExpr): string {
		return this.parenthesize("WRITE", expr.left, expr.right);
	}

	visitMissingExpr(): string {
		return this.parenthesize("MISSING");
	}
}
