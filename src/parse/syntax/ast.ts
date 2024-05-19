import type { RedNode, RedToken } from "./red_tree";
import { OTokenKind, OTreeKind } from "./syntax_kind";

export type AstNode = Stmt | Expr;

export type Stmt =
	| StmtArrayDecl
	| StmtBlock
	| StmtBreak
	| StmtContinue
	| StmtExpr
	| StmtFunctionDecl
	| StmtFor
	| StmtForIn
	| StmtIf
	| StmtReturn
	| StmtVariableDecl
	| StmtWhile
	| ParamList
	| Param
	| Root;

export type Expr =
	| ExprAssign
	| ExprBinary
	| ExprCall
	| ExprCast
	| ExprCompare
	| ExprGet
	| ExprGrouping
	| ExprIndex
	| ExprLogical
	| ExprRange
	| ExprSet
	| ExprSetDbe
	| ExprStringConcat
	| ExprTernary
	| ExprNameRefList
	| ExprNameRef
	| ExprUnary
	| ExprWrite
	| ExprLiteral;

export function cast(red: RedNode): AstNode | undefined {
	const stmt = cast_stmt(red);
	if (stmt) {
		return stmt;
	} else {
		return cast_expr(red);
	}
}

export function cast_stmt(red: RedNode): Stmt | undefined {
	switch (red.green.kind) {
		case OTreeKind.TreeRoot:
			return new Root(red);
		case OTreeKind.ParamList:
			return new ParamList(red);
		case OTreeKind.Param:
			return new Param(red);
		case OTreeKind.StmtArrayDecl:
			return new StmtArrayDecl(red);
		case OTreeKind.StmtBlock:
			return new StmtBlock(red);
		case OTreeKind.StmtExpr:
			return new StmtExpr(red);
		case OTreeKind.StmtFor:
			return new StmtFor(red);
		case OTreeKind.StmtForIn:
			return new StmtForIn(red);
		case OTreeKind.StmtFuncDecl:
			return new StmtFunctionDecl(red);
		case OTreeKind.StmtIf:
			return new StmtIf(red);
		case OTreeKind.StmtReturn:
			return new StmtReturn(red);
		case OTreeKind.StmtVarDecl:
			return new StmtVariableDecl(red);
		case OTreeKind.StmtWhile:
			return new StmtWhile(red);
		default:
			return undefined;
	}
}

export function cast_expr(red: RedNode): Expr | undefined {
	switch (red.green.kind) {
		case OTreeKind.ExprAssign:
			return new ExprAssign(red);
		case OTreeKind.ExprBinary:
			return new ExprBinary(red);
		case OTreeKind.ExprCall:
			return new ExprCall(red);
		case OTreeKind.ExprCast:
			return new ExprCast(red);
		case OTreeKind.ExprCompare:
			return new ExprCompare(red);
		case OTreeKind.ExprGet:
			return new ExprGet(red);
		case OTreeKind.ExprGrouping:
			return new ExprGrouping(red);
		case OTreeKind.ExprIndex:
			return new ExprIndex(red);
		case OTreeKind.ExprLiteral:
			return new ExprLiteral(red);
		case OTreeKind.ExprLogical:
			return new ExprLogical(red);
		case OTreeKind.ExprRange:
			return new ExprRange(red);
		case OTreeKind.ExprSet:
			return new ExprSet(red);
		case OTreeKind.ExprSetDbe:
			return new ExprSetDbe(red);
		case OTreeKind.ExprStringConcat:
			return new ExprStringConcat(red);
		case OTreeKind.ExprTernary:
			return new ExprTernary(red);
		case OTreeKind.ExprUnary:
			return new ExprUnary(red);
		case OTreeKind.ExprWrite:
			return new ExprWrite(red);
		case OTreeKind.NameRefList:
			return new ExprNameRefList(red);
		case OTreeKind.NameRef:
		case OTreeKind.Null:
			return new ExprNameRef(red);
		default:
			return undefined;
	}
}

function cast_type_annotation(node: RedNode): TypeAnnotation | undefined {
	if (node.green.kind === OTreeKind.TypeAnnotation) {
		return new TypeAnnotation(node);
	}

	return undefined;
}

function cast_arglist(red: RedNode): ArgList | undefined {
	if (red.green.kind === OTreeKind.ArgList) {
		return new ArgList(red);
	}

	return undefined;
}

export class Root {
	public readonly tag = "Root";
	public red: RedNode;

	constructor(red: RedNode) {
		this.red = red;
	}

	stmts(): Stmt[] {
		const items: Stmt[] = [];

		for (const child of this.red.children_nodes()) {
			const stmt_cast = cast_stmt(child);
			if (stmt_cast) {
				items.push(stmt_cast);
			}
		}

		return items;
	}
}

export class StmtArrayDecl {
	public readonly tag = "StmtArrayDecl";
	public red: RedNode;

	constructor(red: RedNode) {
		this.red = red;
	}

	ret_type(): TypeAnnotation | undefined {
		for (const child of this.red.children_nodes()) {
			const type_annotation_cast = cast_type_annotation(child);
			if (type_annotation_cast) {
				return type_annotation_cast;
			}
		}

		return undefined;
	}

	name(): ExprNameRef | undefined {
		const expr = nth_expr(this.red, 0);
		if (expr instanceof ExprNameRef) {
			return expr;
		}

		return undefined;
	}

	count(): Expr | undefined {
		const stmt = nth_stmt(this.red, 0);
		if (stmt && stmt.tag === "StmtExpr") {
			return stmt.expr();
		}

		return undefined;
	}

	args(): ArgList | undefined {
		for (const child of this.red.children_nodes()) {
			const arglist_cast = cast_arglist(child);
			if (arglist_cast) {
				return arglist_cast;
			}
		}

		return undefined;
	}
}

export class StmtBlock {
	public readonly tag = "StmtBlock";
	public red: RedNode;

	constructor(red: RedNode) {
		this.red = red;
	}

	stmts(): Stmt[] {
		const items: Stmt[] = [];

		for (const child of this.red.children_nodes()) {
			const stmt_cast = cast_stmt(child);
			if (stmt_cast) {
				items.push(stmt_cast);
			}
		}

		return items;
	}
}

export class StmtBreak {
	public readonly tag = "StmtBreak";
	public red: RedNode;

	constructor(red: RedNode) {
		this.red = red;
	}
}

export class StmtContinue {
	public readonly tag = "StmtContinue";
	public red: RedNode;

	constructor(red: RedNode) {
		this.red = red;
	}
}

export class StmtExpr {
	public readonly tag = "StmtExpr";
	public red: RedNode;

	constructor(red: RedNode) {
		this.red = red;
	}

	expr(): Expr | undefined {
		return nth_expr(this.red, 0);
	}
}

export class StmtFunctionDecl {
	public readonly tag = "StmtFunctionDecl";
	public red: RedNode;

	constructor(red: RedNode) {
		this.red = red;
	}

	ret_type(): TypeAnnotation | undefined {
		for (const child of this.red.children_nodes()) {
			const type_annotation_cast = cast_type_annotation(child);
			if (type_annotation_cast) {
				return type_annotation_cast;
			}
		}

		return undefined;
	}

	name(): ExprNameRef | undefined {
		const expr = nth_expr(this.red, 0);
		if (expr instanceof ExprNameRef) {
			return expr;
		}

		return undefined;
	}

	params(): ParamList | undefined {
		for (const child of this.red.children_nodes()) {
			const stmt_cast = cast_stmt(child);
			if (stmt_cast && stmt_cast instanceof ParamList) {
				return stmt_cast;
			}
		}

		return undefined;
	}

	body(): Stmt | undefined {
		return nth_stmt(this.red, 0);
	}
}

export class StmtFor {
	public readonly tag = "StmtFor";
	public red: RedNode;

	constructor(red: RedNode) {
		this.red = red;
	}

	initializer(): Expr | undefined {
		const stmt_cast = nth_stmt(this.red, 0);
		if (stmt_cast && stmt_cast instanceof StmtExpr) {
			return stmt_cast.expr();
		}

		return undefined;
	}

	condition(): Expr | undefined {
		const stmt_cast = nth_stmt(this.red, 1);
		if (stmt_cast && stmt_cast instanceof StmtExpr) {
			return stmt_cast.expr();
		}

		return undefined;
	}

	increment(): Expr | undefined {
		const stmt_cast = nth_stmt(this.red, 2);
		if (stmt_cast && stmt_cast instanceof StmtExpr) {
			return stmt_cast.expr();
		}

		return undefined;
	}

	body(): Stmt | undefined {
		return nth_stmt(this.red, 3);
	}
}

export class StmtForIn {
	public readonly tag = "StmtForIn";
	public red: RedNode;

	constructor(red: RedNode) {
		this.red = red;
	}

	item(): Expr | undefined {
		const stmt_cast = nth_stmt(this.red, 0);
		if (stmt_cast && stmt_cast instanceof StmtExpr) {
			return stmt_cast.expr();
		}

		return undefined;
	}

	parent(): Expr | undefined {
		const stmt_cast = nth_stmt(this.red, 1);
		if (stmt_cast && stmt_cast instanceof StmtExpr) {
			return stmt_cast.expr();
		}

		return undefined;
	}

	body(): Stmt | undefined {
		return nth_stmt(this.red, 2);
	}
}

export class StmtIf {
	public readonly tag = "StmtIf";
	public red: RedNode;

	constructor(red: RedNode) {
		this.red = red;
	}

	condition(): Expr | undefined {
		const stmt_cast = nth_stmt(this.red, 0);
		if (stmt_cast && stmt_cast instanceof StmtExpr) {
			return stmt_cast.expr();
		}

		return undefined;
	}

	then_branch(): Stmt | undefined {
		return nth_stmt(this.red, 1);
	}

	else_branch(): Stmt | undefined {
		return nth_stmt(this.red, 2);
	}
}

export class StmtReturn {
	public readonly tag = "StmtReturn";
	public red: RedNode;

	constructor(red: RedNode) {
		this.red = red;
	}

	expr(): Expr | undefined {
		const stmt_cast = nth_stmt(this.red, 0);
		if (stmt_cast && stmt_cast instanceof StmtExpr) {
			return stmt_cast.expr();
		}

		return undefined;
	}
}

export class StmtVariableDecl {
	public readonly tag = "StmtVariableDecl";
	public red: RedNode;

	constructor(red: RedNode) {
		this.red = red;
	}

	var_type(): TypeAnnotation | undefined {
		for (const child of this.red.children_nodes()) {
			const type_annotation_cast = cast_type_annotation(child);
			if (type_annotation_cast) {
				return type_annotation_cast;
			}
		}

		return undefined;
	}

	value(): Expr | undefined {
		const stmt_cast = nth_stmt(this.red, 0);
		if (stmt_cast && stmt_cast instanceof StmtExpr) {
			return stmt_cast.expr();
		}

		return undefined;
	}

	name(): ExprNameRef | undefined {
		const expr = nth_expr(this.red, 0);
		if (expr instanceof ExprNameRef) {
			return expr;
		}

		return undefined;
	}

	names(): ExprNameRef[] | undefined {
		const expr_list = nth_expr(this.red, 0);
		if (expr_list instanceof ExprNameRefList) {
			return expr_list.names();
		}

		return undefined;
	}
}

export class StmtWhile {
	public readonly tag = "StmtWhile";
	public red: RedNode;

	constructor(red: RedNode) {
		this.red = red;
	}

	condition(): Expr | undefined {
		const stmt_cast = nth_stmt(this.red, 0);
		if (stmt_cast && stmt_cast instanceof StmtExpr) {
			return stmt_cast.expr();
		}

		return undefined;
	}

	body(): Stmt | undefined {
		return nth_stmt(this.red, 1);
	}
}

export class ExprAssign {
	public readonly tag = "ExprAssign";
	public red: RedNode;

	constructor(red: RedNode) {
		this.red = red;
	}

	name(): ExprNameRef | undefined {
		const expr = nth_expr(this.red, 0);
		if (expr instanceof ExprNameRef) {
			return expr;
		}

		return undefined;
	}

	value(): Expr | undefined {
		return nth_expr(this.red, 1);
	}

	op(): RedToken | undefined {
		for (const child of this.red.children_tokens()) {
			switch (child.green.token.kind) {
				case OTokenKind.Equal:
				case OTokenKind.PlusEqual:
				case OTokenKind.MinusEqual:
					return child;
			}
		}

		return undefined;
	}
}

export class ExprBinary {
	public readonly tag = "ExprBinary";
	public red: RedNode;

	constructor(red: RedNode) {
		this.red = red;
	}

	lhs(): Expr | undefined {
		return nth_expr(this.red, 0);
	}

	rhs(): Expr | undefined {
		return nth_expr(this.red, 1);
	}

	op(): RedToken | undefined {
		for (const child of this.red.children_tokens()) {
			switch (child.green.token.kind) {
				case OTokenKind.Plus:
				case OTokenKind.Minus:
				case OTokenKind.Star:
				case OTokenKind.Fslash:
					return child;
			}
		}

		return undefined;
	}
}

export class ExprCall {
	public readonly tag = "ExprCall";
	public red: RedNode;

	constructor(red: RedNode) {
		this.red = red;
	}

	name(): ExprNameRef | undefined {
		const expr = nth_expr(this.red, 0);
		if (expr instanceof ExprNameRef) {
			return expr;
		}

		return undefined;
	}

	args(): ArgList | undefined {
		for (const child of this.red.children_nodes()) {
			const arglist_cast = cast_arglist(child);
			if (arglist_cast) {
				return arglist_cast;
			}
		}

		return undefined;
	}
}

export class ExprCast {
	public readonly tag = "ExprCast";
	public red: RedNode;

	constructor(red: RedNode) {
		this.red = red;
	}

	ret_type(): TypeAnnotation | undefined {
		for (const child of this.red.children_nodes()) {
			const type_annotation_cast = cast_type_annotation(child);
			if (type_annotation_cast) {
				return type_annotation_cast;
			}
		}

		return undefined;
	}

	expr(): Expr | undefined {
		return nth_expr(this.red, 0);
	}
}

export class ExprCompare {
	public readonly tag = "ExprCompare";
	public red: RedNode;

	constructor(red: RedNode) {
		this.red = red;
	}

	lhs(): Expr | undefined {
		return nth_expr(this.red, 0);
	}

	rhs(): Expr | undefined {
		return nth_expr(this.red, 1);
	}

	op(): RedToken | undefined {
		for (const child of this.red.children_tokens()) {
			switch (child.green.token.kind) {
				case OTokenKind.EqualEqual:
				case OTokenKind.BangEqual:
				case OTokenKind.Great:
				case OTokenKind.GreatEqual:
				case OTokenKind.Less:
				case OTokenKind.LessEqual:
					return child;
			}
		}

		return undefined;
	}
}

export class ExprGet {
	public readonly tag = "ExprGet";
	public red: RedNode;

	constructor(red: RedNode) {
		this.red = red;
	}

	name(): ExprNameRef | undefined {
		const expr = nth_expr(this.red, 0);
		if (expr instanceof ExprNameRef) {
			return expr;
		}

		return undefined;
	}

	property(): Expr | undefined {
		return nth_expr(this.red, 1);
	}
}

export class ExprGrouping {
	public readonly tag = "ExprGrouping";
	public red: RedNode;

	constructor(red: RedNode) {
		this.red = red;
	}

	expr(): Expr | undefined {
		return nth_expr(this.red, 0);
	}
}

export class ExprIndex {
	public readonly tag = "ExprIndex";
	public red: RedNode;

	constructor(red: RedNode) {
		this.red = red;
	}

	name(): ExprNameRef | undefined {
		const expr = nth_expr(this.red, 0);
		if (expr instanceof ExprNameRef) {
			return expr;
		}

		return undefined;
	}

	index(): Expr | undefined {
		return nth_expr(this.red, 1);
	}
}

export class ExprLogical {
	public readonly tag = "ExprLogical";
	public red: RedNode;

	constructor(red: RedNode) {
		this.red = red;
	}

	lhs(): Expr | undefined {
		return nth_expr(this.red, 0);
	}

	rhs(): Expr | undefined {
		return nth_expr(this.red, 1);
	}

	op(): RedToken | undefined {
		for (const child of this.red.children_tokens()) {
			switch (child.green.token.kind) {
				case OTokenKind.BarBar:
				case OTokenKind.AmprAmpr:
					return child;
			}
		}

		return undefined;
	}
}

export class ExprRange {
	public readonly tag = "ExprRange";
	public red: RedNode;

	constructor(red: RedNode) {
		this.red = red;
	}

	name(): ExprNameRef | undefined {
		const expr = nth_expr(this.red, 0);
		if (expr instanceof ExprNameRef) {
			return expr;
		}

		return undefined;
	}

	start_index(): Expr | undefined {
		return nth_expr(this.red, 1);
	}

	end_index(): Expr | undefined {
		return nth_expr(this.red, 2);
	}
}

export class ExprSet {
	public readonly tag = "ExprSet";
	public red: RedNode;

	constructor(red: RedNode) {
		this.red = red;
	}

	name(): ExprNameRef | undefined {
		const expr = nth_expr(this.red, 0);
		if (expr instanceof ExprNameRef) {
			return expr;
		}

		return undefined;
	}

	property(): Expr | undefined {
		return nth_expr(this.red, 1);
	}

	value(): Expr | undefined {
		return nth_expr(this.red, 2);
	}
}

export class ExprSetDbe {
	public readonly tag = "ExprSetDbe";
	public red: RedNode;

	constructor(red: RedNode) {
		this.red = red;
	}

	lhs(): Expr | undefined {
		return nth_expr(this.red, 0);
	}

	rhs(): Expr | undefined {
		return nth_expr(this.red, 1);
	}
}

export class ExprStringConcat {
	public readonly tag = "ExprStringConcat";
	public red: RedNode;

	constructor(red: RedNode) {
		this.red = red;
	}

	lhs(): Expr | undefined {
		return nth_expr(this.red, 0);
	}

	rhs(): Expr | undefined {
		return nth_expr(this.red, 1);
	}
}

export class ExprTernary {
	public readonly tag = "ExprTernary";
	public red: RedNode;

	constructor(red: RedNode) {
		this.red = red;
	}

	condition(): Expr | undefined {
		return nth_expr(this.red, 0);
	}

	then_branch(): Expr | undefined {
		return nth_expr(this.red, 1);
	}

	else_branch(): Expr | undefined {
		return nth_expr(this.red, 2);
	}
}

export class ExprNameRef {
	public readonly tag = "ExprNameRef";
	public red: RedNode;

	constructor(red: RedNode) {
		this.red = red;
	}

	name(): RedToken | undefined {
		for (const child of this.red.children_tokens()) {
			return child;
		}

		return undefined;
	}
}

export class ExprNameRefList {
	public readonly tag = "ExprNameRefList";
	public red: RedNode;

	constructor(red: RedNode) {
		this.red = red;
	}

	names(): ExprNameRef[] | undefined {
		const name_refs: ExprNameRef[] = [];

		for (const child of this.red.children_nodes()) {
			const expr = cast_expr(child);
			if (expr instanceof ExprNameRef) {
				name_refs.push(expr);
			}
		}

		if (name_refs.length > 0) {
			return name_refs;
		} else {
			return undefined;
		}
	}
}

export class ExprUnary {
	public readonly tag = "ExprUnary";
	public red: RedNode;

	constructor(red: RedNode) {
		this.red = red;
	}

	expr(): Expr | undefined {
		return nth_expr(this.red, 0);
	}

	op(): RedToken | undefined {
		for (const child of this.red.children_tokens()) {
			switch (child.green.token.kind) {
				case OTokenKind.Bang:
				case OTokenKind.Minus:
				case OTokenKind.PlusPlus:
				case OTokenKind.MinusMinus:
					return child;
			}
		}

		return undefined;
	}
}

export class ExprWrite {
	public readonly tag = "ExprWrite";
	public red: RedNode;

	constructor(red: RedNode) {
		this.red = red;
	}

	lhs(): Expr | undefined {
		return nth_expr(this.red, 0);
	}

	rhs(): Expr | undefined {
		return nth_expr(this.red, 1);
	}
}

export class ExprLiteral {
	public readonly tag = "ExprLiteral";
	public red: RedNode;

	constructor(red: RedNode) {
		this.red = red;
	}

	parse(): RedToken | undefined {
		for (const child of this.red.children_tokens()) {
			return child;
		}

		return undefined;
	}
}

export class TypeAnnotation {
	public readonly tag = "TypeAnnotation";
	public red: RedNode;

	constructor(red: RedNode) {
		this.red = red;
	}

	name(): RedToken | undefined {
		for (const child of this.red.children_tokens()) {
			return child;
		}

		return undefined;
	}
}

export class ArgList {
	public readonly tag = "ArgList";
	public red: RedNode;

	constructor(red: RedNode) {
		this.red = red;
	}

	args(): Expr[] {
		const items: Expr[] = [];

		for (const child of this.red.children_nodes()) {
			const expr_cast = cast_expr(child);
			if (expr_cast) {
				items.push(expr_cast);
			}
		}

		return items;
	}
}

export class ParamList {
	public readonly tag = "ParamList";
	public red: RedNode;

	constructor(red: RedNode) {
		this.red = red;
	}

	params(): Param[] {
		const items: Param[] = [];

		for (const child of this.red.children_nodes()) {
			const stmt_cast = cast_stmt(child);
			if (stmt_cast && stmt_cast instanceof Param) {
				items.push(stmt_cast);
			}
		}

		return items;
	}
}

export class Param {
	public readonly tag = "Param";
	public red: RedNode;

	constructor(red: RedNode) {
		this.red = red;
	}

	expr(): Stmt | undefined {
		for (const child of this.red.children_nodes()) {
			if (child.green.kind === OTreeKind.StmtVarDecl) {
				return new StmtVariableDecl(child);
			} else if (child.green.kind === OTreeKind.StmtFuncDecl) {
				return new StmtFunctionDecl(child);
			}
		}

		return undefined;
	}
}

function nth_expr(red: RedNode, n: number): Expr | undefined {
	let count = 0;
	for (const child of red.children_nodes()) {
		const expr_cast = cast_expr(child);
		if (expr_cast) {
			if (count === n) return expr_cast;
			count++;
		}
	}

	return undefined;
}

function nth_stmt(red: RedNode, n: number): Stmt | undefined {
	let count = 0;
	for (const child of red.children_nodes()) {
		const stmt_cast = cast_stmt(child);
		if (stmt_cast) {
			if (count === n) return stmt_cast;
			count++;
		}
	}

	return undefined;
}
