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

export function cast_stmt(node: RedNode): Stmt | undefined {
	switch (node.green.kind) {
		case OTreeKind.TreeRoot:
			return new Root(node);
		case OTreeKind.ParamList:
			return new ParamList(node);
		case OTreeKind.Param:
			return new Param(node);
		case OTreeKind.StmtArrayDecl:
			return new StmtArrayDecl(node);
		case OTreeKind.StmtBlock:
			return new StmtBlock(node);
		case OTreeKind.StmtExpr:
			return new StmtExpr(node);
		case OTreeKind.StmtFor:
			return new StmtFor(node);
		case OTreeKind.StmtForIn:
			return new StmtForIn(node);
		case OTreeKind.StmtFuncDecl:
			return new StmtFunctionDecl(node);
		case OTreeKind.StmtIf:
			return new StmtIf(node);
		case OTreeKind.StmtReturn:
			return new StmtReturn(node);
		case OTreeKind.StmtVarDecl:
			return new StmtVariableDecl(node);
		case OTreeKind.StmtWhile:
			return new StmtWhile(node);
		default:
			return undefined;
	}
}

export function cast_expr(node: RedNode): Expr | undefined {
	switch (node.green.kind) {
		case OTreeKind.ExprAssign:
			return new ExprAssign(node);
		case OTreeKind.ExprBinary:
			return new ExprBinary(node);
		case OTreeKind.ExprCall:
			return new ExprCall(node);
		case OTreeKind.ExprCast:
			return new ExprCast(node);
		case OTreeKind.ExprCompare:
			return new ExprCompare(node);
		case OTreeKind.ExprGet:
			return new ExprGet(node);
		case OTreeKind.ExprGrouping:
			return new ExprGrouping(node);
		case OTreeKind.ExprIndex:
			return new ExprIndex(node);
		case OTreeKind.ExprLiteral:
			return new ExprLiteral(node);
		case OTreeKind.ExprLogical:
			return new ExprLogical(node);
		case OTreeKind.ExprRange:
			return new ExprRange(node);
		case OTreeKind.ExprSet:
			return new ExprSet(node);
		case OTreeKind.ExprSetDbe:
			return new ExprSetDbe(node);
		case OTreeKind.ExprStringConcat:
			return new ExprStringConcat(node);
		case OTreeKind.ExprTernary:
			return new ExprTernary(node);
		case OTreeKind.ExprUnary:
			return new ExprUnary(node);
		case OTreeKind.ExprWrite:
			return new ExprWrite(node);
		case OTreeKind.NameRefList:
			return new ExprNameRefList(node);
		case OTreeKind.NameRef:
		case OTreeKind.Null:
			return new ExprNameRef(node);
		default:
			return undefined;
	}
}

export function cast_type_annotation(
	node: RedNode,
): TypeAnnotation | undefined {
	if (node.green.kind === OTreeKind.TypeAnnotation) {
		return new TypeAnnotation(node);
	}

	return undefined;
}

export function cast_arglist(node: RedNode): ArgList | undefined {
	if (node.green.kind === OTreeKind.ArgList) {
		return new ArgList(node);
	}

	return undefined;
}

export function cast_paramlist(node: RedNode): ParamList | undefined {
	if (node.green.kind === OTreeKind.ParamList) {
		return new ParamList(node);
	}

	return undefined;
}

export function cast_param(node: RedNode): Param | undefined {
	if (node.green.kind === OTreeKind.Param) {
		return new Param(node);
	}

	return undefined;
}

export function cast_root(node: RedNode): Root | undefined {
	if (node.green.kind === OTreeKind.TreeRoot) {
		return new Root(node);
	}

	return undefined;
}

export class Root {
	public readonly tag = "Root";
	public node: RedNode;

	constructor(node: RedNode) {
		this.node = node;
	}

	stmts(): Stmt[] {
		const items: Stmt[] = [];

		for (const child of this.node.children_nodes()) {
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
	public node: RedNode;

	constructor(node: RedNode) {
		this.node = node;
	}

	ret_type(): TypeAnnotation | undefined {
		for (const child of this.node.children_nodes()) {
			const type_annotation_cast = cast_type_annotation(child);
			if (type_annotation_cast) {
				return type_annotation_cast;
			}
		}

		return undefined;
	}

	name(): ExprNameRef | undefined {
		const expr = nth_expr(this.node, 0);
		if (expr instanceof ExprNameRef) {
			return expr;
		}

		return undefined;
	}

	count(): Expr | undefined {
		const stmt = nth_stmt(this.node, 0);
		if (stmt && stmt.tag === "StmtExpr") {
			return stmt.expr();
		}

		return undefined;
	}

	args(): ArgList | undefined {
		for (const child of this.node.children_nodes()) {
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
	public node: RedNode;

	constructor(node: RedNode) {
		this.node = node;
	}

	stmts(): Stmt[] {
		const items: Stmt[] = [];

		for (const child of this.node.children_nodes()) {
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
	public node: RedNode;

	constructor(node: RedNode) {
		this.node = node;
	}
}

export class StmtContinue {
	public readonly tag = "StmtContinue";
	public node: RedNode;

	constructor(node: RedNode) {
		this.node = node;
	}
}

export class StmtExpr {
	public readonly tag = "StmtExpr";
	public node: RedNode;

	constructor(node: RedNode) {
		this.node = node;
	}

	expr(): Expr | undefined {
		return nth_expr(this.node, 0);
	}
}

export class StmtFunctionDecl {
	public readonly tag = "StmtFunctionDecl";
	public node: RedNode;

	constructor(node: RedNode) {
		this.node = node;
	}

	ret_type(): TypeAnnotation | undefined {
		for (const child of this.node.children_nodes()) {
			const type_annotation_cast = cast_type_annotation(child);
			if (type_annotation_cast) {
				return type_annotation_cast;
			}
		}

		return undefined;
	}

	name(): ExprNameRef | undefined {
		const expr = nth_expr(this.node, 0);
		if (expr instanceof ExprNameRef) {
			return expr;
		}

		return undefined;
	}

	params(): ParamList | undefined {
		for (const child of this.node.children_nodes()) {
			const paramlist_cast = cast_paramlist(child);
			if (paramlist_cast) {
				return paramlist_cast;
			}
		}

		return undefined;
	}

	body(): Stmt | undefined {
		return nth_stmt(this.node, 0);
	}
}

export class StmtFor {
	public readonly tag = "StmtFor";
	public node: RedNode;

	constructor(node: RedNode) {
		this.node = node;
	}

	initializer(): Expr | undefined {
		const stmt_cast = nth_stmt(this.node, 0);
		if (stmt_cast && stmt_cast instanceof StmtExpr) {
			return stmt_cast.expr();
		}

		return undefined;
	}

	condition(): Expr | undefined {
		const stmt_cast = nth_stmt(this.node, 1);
		if (stmt_cast && stmt_cast instanceof StmtExpr) {
			return stmt_cast.expr();
		}

		return undefined;
	}

	increment(): Expr | undefined {
		const stmt_cast = nth_stmt(this.node, 2);
		if (stmt_cast && stmt_cast instanceof StmtExpr) {
			return stmt_cast.expr();
		}

		return undefined;
	}

	body(): Stmt | undefined {
		return nth_stmt(this.node, 3);
	}
}

export class StmtForIn {
	public readonly tag = "StmtForIn";
	public node: RedNode;

	constructor(node: RedNode) {
		this.node = node;
	}

	item(): Expr | undefined {
		const stmt_cast = nth_stmt(this.node, 0);
		if (stmt_cast && stmt_cast instanceof StmtExpr) {
			return stmt_cast.expr();
		}

		return undefined;
	}

	parent(): Expr | undefined {
		const stmt_cast = nth_stmt(this.node, 1);
		if (stmt_cast && stmt_cast instanceof StmtExpr) {
			return stmt_cast.expr();
		}

		return undefined;
	}

	body(): Stmt | undefined {
		return nth_stmt(this.node, 2);
	}
}

export class StmtIf {
	public readonly tag = "StmtIf";
	public node: RedNode;

	constructor(node: RedNode) {
		this.node = node;
	}

	condition(): Expr | undefined {
		const stmt_cast = nth_stmt(this.node, 0);
		if (stmt_cast && stmt_cast instanceof StmtExpr) {
			return stmt_cast.expr();
		}

		return undefined;
	}

	then_branch(): Stmt | undefined {
		return nth_stmt(this.node, 1);
	}

	else_branch(): Stmt | undefined {
		return nth_stmt(this.node, 2);
	}
}

export class StmtReturn {
	public readonly tag = "StmtReturn";
	public node: RedNode;

	constructor(node: RedNode) {
		this.node = node;
	}

	expr(): Expr | undefined {
		const stmt_cast = nth_stmt(this.node, 0);
		if (stmt_cast && stmt_cast instanceof StmtExpr) {
			return stmt_cast.expr();
		}

		return undefined;
	}
}

export class StmtVariableDecl {
	public readonly tag = "StmtVariableDecl";
	public node: RedNode;

	constructor(node: RedNode) {
		this.node = node;
	}

	var_type(): TypeAnnotation | undefined {
		for (const child of this.node.children_nodes()) {
			const type_annotation_cast = cast_type_annotation(child);
			if (type_annotation_cast) {
				return type_annotation_cast;
			}
		}

		return undefined;
	}

	value(): Expr | undefined {
		const stmt_cast = nth_stmt(this.node, 0);
		if (stmt_cast && stmt_cast instanceof StmtExpr) {
			return stmt_cast.expr();
		}

		return undefined;
	}

	name(): ExprNameRef | undefined {
		const expr = nth_expr(this.node, 0);
		if (expr instanceof ExprNameRef) {
			return expr;
		}

		return undefined;
	}

	names(): ExprNameRef[] | undefined {
		const expr_list = nth_expr(this.node, 0);
		if (expr_list instanceof ExprNameRefList) {
			return expr_list.names();
		}

		return undefined;
	}
}

export class StmtWhile {
	public readonly tag = "StmtWhile";
	public node: RedNode;

	constructor(node: RedNode) {
		this.node = node;
	}

	condition(): Expr | undefined {
		const stmt_cast = nth_stmt(this.node, 0);
		if (stmt_cast && stmt_cast instanceof StmtExpr) {
			return stmt_cast.expr();
		}

		return undefined;
	}

	body(): Stmt | undefined {
		return nth_stmt(this.node, 1);
	}
}

export class ExprAssign {
	public readonly tag = "ExprAssign";
	public node: RedNode;

	constructor(node: RedNode) {
		this.node = node;
	}

	name(): ExprNameRef | undefined {
		const expr = nth_expr(this.node, 0);
		if (expr instanceof ExprNameRef) {
			return expr;
		}

		return undefined;
	}

	value(): Expr | undefined {
		return nth_expr(this.node, 1);
	}

	op(): RedToken | undefined {
		for (const child of this.node.children_tokens()) {
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
	public node: RedNode;

	constructor(node: RedNode) {
		this.node = node;
	}

	lhs(): Expr | undefined {
		return nth_expr(this.node, 0);
	}

	rhs(): Expr | undefined {
		return nth_expr(this.node, 1);
	}

	op(): RedToken | undefined {
		for (const child of this.node.children_tokens()) {
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
	public node: RedNode;

	constructor(node: RedNode) {
		this.node = node;
	}

	name(): ExprNameRef | undefined {
		const expr = nth_expr(this.node, 0);
		if (expr instanceof ExprNameRef) {
			return expr;
		}

		return undefined;
	}

	args(): ArgList | undefined {
		for (const child of this.node.children_nodes()) {
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
	public node: RedNode;

	constructor(node: RedNode) {
		this.node = node;
	}

	ret_type(): TypeAnnotation | undefined {
		for (const child of this.node.children_nodes()) {
			const type_annotation_cast = cast_type_annotation(child);
			if (type_annotation_cast) {
				return type_annotation_cast;
			}
		}

		return undefined;
	}

	expr(): Expr | undefined {
		return nth_expr(this.node, 0);
	}
}

export class ExprCompare {
	public readonly tag = "ExprCompare";
	public node: RedNode;

	constructor(node: RedNode) {
		this.node = node;
	}

	lhs(): Expr | undefined {
		return nth_expr(this.node, 0);
	}

	rhs(): Expr | undefined {
		return nth_expr(this.node, 1);
	}

	op(): RedToken | undefined {
		for (const child of this.node.children_tokens()) {
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
	public node: RedNode;

	constructor(node: RedNode) {
		this.node = node;
	}

	name(): ExprNameRef | undefined {
		const expr = nth_expr(this.node, 0);
		if (expr instanceof ExprNameRef) {
			return expr;
		}

		return undefined;
	}

	property(): Expr | undefined {
		return nth_expr(this.node, 1);
	}
}

export class ExprGrouping {
	public readonly tag = "ExprGrouping";
	public node: RedNode;

	constructor(node: RedNode) {
		this.node = node;
	}

	expr(): Expr | undefined {
		return nth_expr(this.node, 0);
	}
}

export class ExprIndex {
	public readonly tag = "ExprIndex";
	public node: RedNode;

	constructor(node: RedNode) {
		this.node = node;
	}

	name(): ExprNameRef | undefined {
		const expr = nth_expr(this.node, 0);
		if (expr instanceof ExprNameRef) {
			return expr;
		}

		return undefined;
	}

	index(): Expr | undefined {
		return nth_expr(this.node, 1);
	}
}

export class ExprLogical {
	public readonly tag = "ExprLogical";
	public node: RedNode;

	constructor(node: RedNode) {
		this.node = node;
	}

	lhs(): Expr | undefined {
		return nth_expr(this.node, 0);
	}

	rhs(): Expr | undefined {
		return nth_expr(this.node, 1);
	}

	op(): RedToken | undefined {
		for (const child of this.node.children_tokens()) {
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
	public node: RedNode;

	constructor(node: RedNode) {
		this.node = node;
	}

	name(): ExprNameRef | undefined {
		const expr = nth_expr(this.node, 0);
		if (expr instanceof ExprNameRef) {
			return expr;
		}

		return undefined;
	}

	start_index(): Expr | undefined {
		return nth_expr(this.node, 1);
	}

	end_index(): Expr | undefined {
		return nth_expr(this.node, 2);
	}
}

export class ExprSet {
	public readonly tag = "ExprSet";
	public node: RedNode;

	constructor(node: RedNode) {
		this.node = node;
	}

	name(): ExprNameRef | undefined {
		const expr = nth_expr(this.node, 0);
		if (expr instanceof ExprNameRef) {
			return expr;
		}

		return undefined;
	}

	property(): Expr | undefined {
		return nth_expr(this.node, 1);
	}

	value(): Expr | undefined {
		return nth_expr(this.node, 2);
	}
}

export class ExprSetDbe {
	public readonly tag = "ExprSetDbe";
	public node: RedNode;

	constructor(node: RedNode) {
		this.node = node;
	}

	lhs(): Expr | undefined {
		return nth_expr(this.node, 0);
	}

	rhs(): Expr | undefined {
		return nth_expr(this.node, 1);
	}
}

export class ExprStringConcat {
	public readonly tag = "ExprStringConcat";
	public node: RedNode;

	constructor(node: RedNode) {
		this.node = node;
	}

	lhs(): Expr | undefined {
		return nth_expr(this.node, 0);
	}

	rhs(): Expr | undefined {
		return nth_expr(this.node, 1);
	}
}

export class ExprTernary {
	public readonly tag = "ExprTernary";
	public node: RedNode;

	constructor(node: RedNode) {
		this.node = node;
	}

	condition(): Expr | undefined {
		return nth_expr(this.node, 0);
	}

	then_branch(): Expr | undefined {
		return nth_expr(this.node, 1);
	}

	else_branch(): Expr | undefined {
		return nth_expr(this.node, 2);
	}
}

export class ExprNameRef {
	public readonly tag = "ExprNameRef";
	public node: RedNode;

	constructor(node: RedNode) {
		this.node = node;
	}

	name(): RedToken | undefined {
		for (const child of this.node.children_tokens()) {
			return child;
		}

		return undefined;
	}
}

export class ExprNameRefList {
	public readonly tag = "ExprNameRefList";
	public node: RedNode;

	constructor(node: RedNode) {
		this.node = node;
	}

	names(): ExprNameRef[] | undefined {
		const name_refs: ExprNameRef[] = [];

		for (const child of this.node.children_nodes()) {
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
	public node: RedNode;

	constructor(node: RedNode) {
		this.node = node;
	}

	expr(): Expr | undefined {
		return nth_expr(this.node, 0);
	}

	op(): RedToken | undefined {
		for (const child of this.node.children_tokens()) {
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
	public node: RedNode;

	constructor(node: RedNode) {
		this.node = node;
	}

	lhs(): Expr | undefined {
		return nth_expr(this.node, 0);
	}

	rhs(): Expr | undefined {
		return nth_expr(this.node, 1);
	}
}

export class ExprLiteral {
	public readonly tag = "ExprLiteral";
	public node: RedNode;

	constructor(node: RedNode) {
		this.node = node;
	}

	parse(): RedToken | undefined {
		for (const child of this.node.children_tokens()) {
			return child;
		}

		return undefined;
	}
}

export class TypeAnnotation {
	public readonly tag = "TypeAnnotation";
	public node: RedNode;

	constructor(node: RedNode) {
		this.node = node;
	}

	name(): RedToken | undefined {
		for (const child of this.node.children_tokens()) {
			return child;
		}

		return undefined;
	}
}

export class ArgList {
	public readonly tag = "ArgList";
	public node: RedNode;

	constructor(node: RedNode) {
		this.node = node;
	}

	args(): Expr[] {
		const items: Expr[] = [];

		for (const child of this.node.children_nodes()) {
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
	public node: RedNode;

	constructor(node: RedNode) {
		this.node = node;
	}

	params(): Param[] {
		const items: Param[] = [];

		for (const child of this.node.children_nodes()) {
			const param_cast = cast_param(child);
			if (param_cast) {
				items.push(param_cast);
			}
		}

		return items;
	}
}

export class Param {
	public readonly tag = "Param";
	public node: RedNode;

	constructor(node: RedNode) {
		this.node = node;
	}

	expr(): Stmt | undefined {
		for (const child of this.node.children_nodes()) {
			if (child.green.kind === OTreeKind.StmtVarDecl) {
				return new StmtVariableDecl(child);
			} else if (child.green.kind === OTreeKind.StmtFuncDecl) {
				return new StmtFunctionDecl(child);
			}
		}

		return undefined;
	}
}

function nth_expr(node: RedNode, n: number): Expr | undefined {
	let count = 0;
	for (const child of node.children_nodes()) {
		const expr_cast = cast_expr(child);
		if (expr_cast) {
			if (count === n) return expr_cast;
			count++;
		}
	}

	return undefined;
}

function nth_stmt(node: RedNode, n: number): Stmt | undefined {
	let count = 0;
	for (const child of node.children_nodes()) {
		const stmt_cast = cast_stmt(child);
		if (stmt_cast) {
			if (count === n) return stmt_cast;
			count++;
		}
	}

	return undefined;
}
