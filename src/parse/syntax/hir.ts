import type { GreenToken } from "./green_tree.ts";

export interface Expr {
    accept<R>(visitor: ExprVisitor<R>): R;
}

export interface ExprVisitor<R> {
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

export class ArrowExpr implements Expr {
    public left: Expr;
    public op: GreenToken;
    public right: Expr;

    constructor(left: Expr, op: GreenToken, right: Expr) {
        this.left = left;
        this.op = op;
        this.right = right;
    }

    accept<R>(visitor: ExprVisitor<R>): R {
        return visitor.visitArrowExpr(this);
    }
}

export class AssignmentExpr implements Expr {
    public name: Expr;
    public op: GreenToken;
    public value: Expr;

    constructor(name: Expr, op: GreenToken, value: Expr) {
        this.name = name;
        this.op = op;
        this.value = value;
    }

    accept<R>(visitor: ExprVisitor<R>): R {
        return visitor.visitAssignmentExpr(this);
    }
}

export class BinaryExpr implements Expr {
    public left: Expr;
    public op: GreenToken;
    public right: Expr;

    constructor(left: Expr, op: GreenToken, right: Expr) {
        this.left = left;
        this.op = op;
        this.right = right;
    }

    accept<R>(visitor: ExprVisitor<R>): R {
        return visitor.visitBinaryExpr(this);
    }
}

export class CallExpr implements Expr {
    public name: Expr;
    public args: Expr[];

    constructor(name: Expr, args: Expr[]) {
        this.name = name;
        this.args = args;
    }

    accept<R>(visitor: ExprVisitor<R>): R {
        return visitor.visitCallExpr(this);
    }
}

export class CastExpr implements Expr {
    public typing: Expr;
    public expr: Expr;

    constructor(typing: Expr, expr: Expr) {
        this.typing = typing;
        this.expr = expr;
    }

    accept<R>(visitor: ExprVisitor<R>): R {
        return visitor.visitCastExpr(this);
    }
}

export class CompareExpr implements Expr {
    public left: Expr;
    public op: GreenToken;
    public right: Expr;

    constructor(left: Expr, op: GreenToken, right: Expr) {
        this.left = left;
        this.op = op;
        this.right = right;
    }

    accept<R>(visitor: ExprVisitor<R>): R {
        return visitor.visitCompareExpr(this);
    }
}

export class GetExpr implements Expr {
    public name: Expr;
    public property: Expr;

    constructor(name: Expr, property: Expr) {
        this.name = name;
        this.property = property;
    }

    accept<R>(visitor: ExprVisitor<R>): R {
        return visitor.visitGetExpr(this);
    }
}

export class GroupingExpr implements Expr {
    public expr: Expr;

    constructor(expr: Expr) {
        this.expr = expr;
    }

    accept<R>(visitor: ExprVisitor<R>): R {
        return visitor.visitGroupingExpr(this);
    }
}

export class LiteralExpr implements Expr {
    public value: Object;

    constructor(value: Object) {
        this.value = value;
    }

    accept<R>(visitor: ExprVisitor<R>): R {
        return visitor.visitLiteralExpr(this);
    }
}

export class LogicalExpr implements Expr {
    public left: Expr;
    public op: GreenToken;
    public right: Expr;

    constructor(left: Expr, op: GreenToken, right: Expr) {
        this.left = left;
        this.op = op;
        this.right = right;
    }

    accept<R>(visitor: ExprVisitor<R>): R {
        return visitor.visitLogicalExpr(this);
    }
}

export class IndexExpr implements Expr {
    public name: Expr;
    public index: Expr;

    constructor(name: Expr, index: Expr) {
        this.name = name;
        this.index = index;
    }

    accept<R>(visitor: ExprVisitor<R>): R {
        return visitor.visitIndexExpr(this);
    }
}

export class NameRefExpr implements Expr {
    public name: Expr;

    constructor(name: Expr) {
        this.name = name;
    }

    accept<R>(visitor: ExprVisitor<R>): R {
        return visitor.visitNameRefExpr(this);
    }
}

export class NameRefListExpr implements Expr {
    public names: Expr[];

    constructor(names: Expr[]) {
        this.names = names;
    }

    accept<R>(visitor: ExprVisitor<R>): R {
        return visitor.visitNameRefListExpr(this);
    }
}

export class PostfixExpr implements Expr {
    public op: GreenToken;
    public right: Expr;

    constructor(op: GreenToken, right: Expr) {
        this.op = op;
        this.right = right;
    }

    accept<R>(visitor: ExprVisitor<R>): R {
        return visitor.visitPostfixExpr(this);
    }
}

export class PrefixExpr implements Expr {
    public left: Expr;
    public op: GreenToken;

    constructor(left: Expr, op: GreenToken) {
        this.left = left;
        this.op = op;
    }

    accept<R>(visitor: ExprVisitor<R>): R {
        return visitor.visitPrefixExpr(this);
    }
}

export class RangeExpr implements Expr {
    public start: Expr;
    public end: Expr;

    constructor(start: Expr, end: Expr) {
        this.start = start;
        this.end = end;
    }

    accept<R>(visitor: ExprVisitor<R>): R {
        return visitor.visitRangeExpr(this);
    }
}

export class SetExpr implements Expr {
    public name: Expr;
    public property: Expr;
    public value: Expr;

    constructor(name: Expr, property: Expr, value: Expr) {
        this.name = name;
        this.property = property;
        this.value = value;
    }

    accept<R>(visitor: ExprVisitor<R>): R {
        return visitor.visitSetExpr(this);
    }
}

export class StringConcatExpr implements Expr {
    public left: Expr;
    public right: Expr;

    constructor(left: Expr, right: Expr) {
        this.left = left;
        this.right = right;
    }

    accept<R>(visitor: ExprVisitor<R>): R {
        return visitor.visitStringConcatExpr(this);
    }
}

export class TernaryExpr implements Expr {
    public condition: Expr;
    public thenBranch: Expr;
    public elseBranch: Expr;

    constructor(condition: Expr, thenBranch: Expr, elseBranch: Expr) {
        this.condition = condition;
        this.thenBranch = thenBranch;
        this.elseBranch = elseBranch;
    }

    accept<R>(visitor: ExprVisitor<R>): R {
        return visitor.visitTernaryExpr(this);
    }
}

export class WriteExpr implements Expr {
    public left: Expr;
    public right: Expr;

    constructor(left: Expr, right: Expr) {
        this.left = left;
        this.right = right;
    }

    accept<R>(visitor: ExprVisitor<R>): R {
        return visitor.visitWriteExpr(this);
    }
}

export class MissingExpr implements Expr {
    accept<R>(visitor: ExprVisitor<R>): R {
        return visitor.visitMissingExpr();
    }
}

/**
 * TODO
 */
export class AstPrinter implements ExprVisitor<string> {
    parenthesize(name: string, ...exprs: Expr[]): string {
        const result = [];

        result.push("(");
        result.push(name);
        for (const expr of exprs) {
            result.push(expr.accept(this));
        }
        result.push(")");

        return result.join();
    }

    visitArrowExpr(expr: ArrowExpr): string {
        return this.parenthesize(expr.op.text, expr.left, expr.right);
    }

    visitAssignmentExpr(expr: AssignmentExpr): string {
        return this.parenthesize(expr.op.text, expr.name, expr.value);
    }

    visitBinaryExpr(expr: BinaryExpr): string {
        return this.parenthesize(expr.op.text, expr.left, expr.right);
    }

    visitCallExpr(expr: CallExpr): string {
        return this.parenthesize("call", expr.name, ...expr.args);
    }

    visitCastExpr(expr: CastExpr): string {
        return this.parenthesize("CAST", expr.typing, expr.expr);
    }

    visitCompareExpr(expr: CompareExpr): string {
        return this.parenthesize(expr.op.text, expr.left, expr.right);
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
        return this.parenthesize(expr.op.text, expr.left, expr.right);
    }

    visitNameRefExpr(expr: NameRefExpr): string {
        return this.parenthesize("NAMEREF", expr.name);
    }

    visitNameRefListExpr(expr: NameRefListExpr): string {
        return this.parenthesize("NAMEREFLIST", ...expr.names);
    }

    visitPostfixExpr(expr: PostfixExpr): string {
        return this.parenthesize(expr.op.text, expr.right);
    }

    visitPrefixExpr(expr: PrefixExpr): string {
        return this.parenthesize(expr.op.text, expr.left);
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
        return this.parenthesize("MISSING")
    }
}
