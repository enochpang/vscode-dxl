import type { RedNode, RedToken } from "./red_tree";
import { OTokenKind, ONodeKind } from "./syntax_kind";

export type AstNode = Stmt | Expr;

export type Stmt =
	| Root
	| ArgList
	| Arg
	| ParamList
	| Param
	| TypeAnnotation
	| StmtArrayDecl
	| StmtBlock
	| StmtBreak
	| StmtContinue
	| StmtExpr
	| StmtFor
	| StmtForIn
	| StmtFunctionDecl
	| StmtIf
	| StmtReturn
	| StmtVariableDecl
	| StmtWhile;

export type Expr =
	| ExprArrow
	| ExprAssignment
	| ExprBinary
	| ExprCall
	| ExprCast
	| ExprCompare
	| ExprGet
	| ExprGrouping
	| ExprIndex
	| ExprLiteral
	| ExprLogical
	| ExprNameRef
	| ExprNameRefList
	| ExprPostfix
	| ExprPrefix
	| ExprStringConcat
	| ExprTernary
	| ExprWrite;

export function cast(red: RedNode): AstNode | undefined {
	const stmt = castStmt(red);
	if (stmt) {
		return stmt;
	} else {
		return castExpr(red);
	}
}

export function castStmt(red: RedNode): Stmt | undefined {
	switch (red.getKind()) {
		case ONodeKind.TreeRoot:
			return new Root(red);
		case ONodeKind.ArgList:
			return new ArgList(red);
		case ONodeKind.Arg:
			return new Arg(red);
		case ONodeKind.ParamList:
			return new ParamList(red);
		case ONodeKind.Param:
			return new Param(red);
		case ONodeKind.TypeRef:
			return new TypeAnnotation(red);
		case ONodeKind.StmtArrayDecl:
			return new StmtArrayDecl(red);
		case ONodeKind.StmtBlock:
			return new StmtBlock(red);
		case ONodeKind.StmtExpr:
			return new StmtExpr(red);
		case ONodeKind.StmtFor:
			return new StmtFor(red);
		case ONodeKind.StmtForIn:
			return new StmtForIn(red);
		case ONodeKind.StmtFuncDecl:
			return new StmtFunctionDecl(red);
		case ONodeKind.StmtIf:
			return new StmtIf(red);
		case ONodeKind.StmtReturn:
			return new StmtReturn(red);
		case ONodeKind.StmtVarDecl:
			return new StmtVariableDecl(red);
		case ONodeKind.StmtWhile:
			return new StmtWhile(red);
		default:
			return undefined;
	}
}

export function castExpr(red: RedNode): Expr | undefined {
	switch (red.getKind()) {
		case ONodeKind.ExprAssignment:
			return new ExprAssignment(red);
		case ONodeKind.ExprBinary:
			return new ExprBinary(red);
		case ONodeKind.ExprCall:
			return new ExprCall(red);
		case ONodeKind.ExprCast:
			return new ExprCast(red);
		case ONodeKind.ExprCompare:
			return new ExprCompare(red);
		case ONodeKind.ExprGet:
			return new ExprGet(red);
		case ONodeKind.ExprGrouping:
			return new ExprGrouping(red);
		case ONodeKind.ExprIndex:
			return new ExprIndex(red);
		case ONodeKind.ExprLiteral:
			return new ExprLiteral(red);
		case ONodeKind.ExprLogical:
			return new ExprLogical(red);
		case ONodeKind.ExprArrow:
			return new ExprArrow(red);
		case ONodeKind.ExprStringConcat:
			return new ExprStringConcat(red);
		case ONodeKind.ExprTernary:
			return new ExprTernary(red);
		case ONodeKind.ExprPostfix:
			return new ExprPostfix(red);
		case ONodeKind.ExprWrite:
			return new ExprWrite(red);
		case ONodeKind.NameRefList:
			return new ExprNameRefList(red);
		case ONodeKind.NameRef:
		case ONodeKind.Null:
			return new ExprNameRef(red);
		default:
			return undefined;
	}
}

export class Root {
	public readonly tag = "Root";
	public readonly red: RedNode;

	constructor(red: RedNode) {
		this.red = red;
	}

	stmts(): Stmt[] {
		const items: Stmt[] = [];

		for (const child of this.red.childrenNodes()) {
			const stmt_cast = castStmt(child);
			if (stmt_cast) {
				items.push(stmt_cast);
			}
		}

		return items;
	}
}

export class ArgList {
	public readonly tag = "ArgList";
	public readonly red: RedNode;

	constructor(red: RedNode) {
		this.red = red;
	}

	args(): Stmt[] {
		const items: Stmt[] = [];

		for (const child of this.red.childrenNodes()) {
			const stmt_cast = castStmt(child);
			if (stmt_cast && stmt_cast instanceof Arg) {
				items.push(stmt_cast);
			}
		}

		return items;
	}
}

export class Arg {
	public readonly tag = "Arg";
	public readonly red: RedNode;

	constructor(red: RedNode) {
		this.red = red;
	}

	expr(): Expr | undefined {
		const stmt = nthStmt(this.red, 0);
		if (stmt && stmt.tag === "StmtExpr") {
			return stmt.expr();
		}

		return undefined;
	}
}

export class ParamList {
	public readonly tag = "ParamList";
	public readonly red: RedNode;

	constructor(red: RedNode) {
		this.red = red;
	}

	params(): Param[] {
		const items: Param[] = [];

		for (const child of this.red.childrenNodes()) {
			const stmt_cast = castStmt(child);
			if (stmt_cast && stmt_cast instanceof Param) {
				items.push(stmt_cast);
			}
		}

		return items;
	}
}

export class Param {
	public readonly tag = "Param";
	public readonly red: RedNode;

	constructor(red: RedNode) {
		this.red = red;
	}

	decl(): Stmt | undefined {
		for (const child of this.red.childrenNodes()) {
			if (child.getKind() === ONodeKind.StmtVarDecl) {
				return new StmtVariableDecl(child);
			} else if (child.getKind() === ONodeKind.StmtFuncDecl) {
				return new StmtFunctionDecl(child);
			} else if (child.getKind() === ONodeKind.StmtArrayDecl) {
				return new StmtArrayDecl(child);
			}
		}

		return undefined;
	}
}

export class TypeAnnotation {
	public readonly tag = "TypeAnnotation";
	public readonly red: RedNode;

	constructor(red: RedNode) {
		this.red = red;
	}

	name(): RedToken | undefined {
		for (const child of this.red.childrenTokens()) {
			return child;
		}

		return undefined;
	}
}

export class StmtArrayDecl {
	public readonly tag = "StmtArrayDecl";
	public readonly red: RedNode;

	constructor(red: RedNode) {
		this.red = red;
	}

	typing(): TypeAnnotation | undefined {
		const stmt = nthStmt(this.red, 0);
		if (stmt instanceof TypeAnnotation) {
			return stmt;
		}

		return undefined;
	}

	name(): ExprNameRef | undefined {
		const expr = nthExpr(this.red, 0);
		if (expr instanceof ExprNameRef) {
			return expr;
		}

		return undefined;
	}

	count(): Expr | undefined {
		const stmt = nthStmt(this.red, 1);
		if (stmt && stmt.tag === "StmtExpr") {
			return stmt.expr();
		}

		return undefined;
	}

	argList(): ArgList | undefined {
		const stmt_cast = nthStmt(this.red, 0);
		if (stmt_cast && stmt_cast instanceof ArgList) {
			return stmt_cast;
		}

		return undefined;
	}
}

export class StmtBlock {
	public readonly tag = "StmtBlock";
	public readonly red: RedNode;

	constructor(red: RedNode) {
		this.red = red;
	}

	stmts(): Stmt[] {
		const items: Stmt[] = [];

		for (const child of this.red.childrenNodes()) {
			const stmt_cast = castStmt(child);
			if (stmt_cast) {
				items.push(stmt_cast);
			}
		}

		return items;
	}
}

export class StmtExpr {
	public readonly tag = "StmtExpr";
	public red: RedNode;

	constructor(red: RedNode) {
		this.red = red;
	}

	expr(): Expr | undefined {
		return nthExpr(this.red, 0);
	}
}

export class StmtBreak {
	public readonly tag = "StmtBreak";
	public readonly red: RedNode;

	constructor(red: RedNode) {
		this.red = red;
	}

	keyword(): RedToken | undefined {
		for (const child of this.red.childrenTokens()) {
			if (child.getKind() === OTokenKind.KwBreak) {
				return child;
			}
		}

		return undefined;
	}
}

export class StmtContinue {
	public readonly tag = "StmtContinue";
	public readonly red: RedNode;

	constructor(red: RedNode) {
		this.red = red;
	}

	keyword(): RedToken | undefined {
		for (const child of this.red.childrenTokens()) {
			if (child.getKind() === OTokenKind.KwContinue) {
				return child;
			}
		}

		return undefined;
	}
}

export class StmtFor {
	public readonly tag = "StmtFor";
	public readonly red: RedNode;

	constructor(red: RedNode) {
		this.red = red;
	}

	initializer(): Expr | undefined {
		const stmt = nthStmt(this.red, 0);
		if (stmt && stmt.tag === "StmtExpr") {
			const expr = stmt.expr();
			if (expr instanceof ExprAssignment) {
				return expr;
			}
		}

		return undefined;
	}

	condition(): Expr | undefined {
		const stmt = nthStmt(this.red, 1);
		if (stmt && stmt.tag === "StmtExpr") {
			const expr = stmt.expr();
			if (expr instanceof ExprCompare) {
				return expr;
			}
		}

		return undefined;
	}

	increment(): Expr | undefined {
		const stmt = nthStmt(this.red, 2);
		if (stmt && stmt.tag === "StmtExpr") {
			return stmt.expr();
		}

		return undefined;
	}

	body(): Stmt | undefined {
		return nthStmt(this.red, 3);
	}

	keyword(): RedToken | undefined {
		for (const child of this.red.childrenTokens()) {
			if (child.getKind() === OTokenKind.KwFor) {
				return child;
			}
		}

		return undefined;
	}
}

export class StmtForIn {
	public readonly tag = "StmtForIn";
	public readonly red: RedNode;

	constructor(red: RedNode) {
		this.red = red;
	}

	item(): Expr | undefined {
		const stmt = nthStmt(this.red, 0);
		if (stmt && stmt.tag === "StmtExpr") {
			return stmt.expr();
		}

		return undefined;
	}

	parent(): Expr | undefined {
		const stmt = nthStmt(this.red, 1);
		if (stmt && stmt.tag === "StmtExpr") {
			return stmt.expr();
		}

		return undefined;
	}

	body(): Stmt | undefined {
		return nthStmt(this.red, 0);
	}

	keyword1(): RedToken | undefined {
		for (const child of this.red.childrenTokens()) {
			if (child.getKind() === OTokenKind.KwFor) {
				return child;
			}
		}

		return undefined;
	}

	keyword2(): RedToken | undefined {
		for (const child of this.red.childrenTokens()) {
			if (child.getKind() === OTokenKind.KwIn) {
				return child;
			}
		}

		return undefined;
	}

	keyword3(): RedToken | undefined {
		for (const child of this.red.childrenTokens()) {
			if (child.getKind() === OTokenKind.KwDo) {
				return child;
			}
		}

		return undefined;
	}
}

export class StmtFunctionDecl {
	public readonly tag = "StmtFunctionDecl";
	public readonly red: RedNode;

	constructor(red: RedNode) {
		this.red = red;
	}

	typing(): TypeAnnotation | undefined {
		const stmt = nthStmt(this.red, 0);
		if (stmt instanceof TypeAnnotation) {
			return stmt;
		}

		return undefined;
	}

	name(): ExprNameRef | undefined {
		const expr = nthExpr(this.red, 0);
		if (expr instanceof ExprNameRef) {
			return expr;
		}

		return undefined;
	}

	params(): ParamList | undefined {
		for (const child of this.red.childrenNodes()) {
			const stmt_cast = castStmt(child);
			if (stmt_cast && stmt_cast instanceof ParamList) {
				return stmt_cast;
			}
		}

		return undefined;
	}

	body(): Stmt | undefined {
		return nthStmt(this.red, 2);
	}
}

export class StmtIf {
	public readonly tag = "StmtIf";
	public readonly red: RedNode;

	constructor(red: RedNode) {
		this.red = red;
	}

	condition(): Expr | undefined {
		const stmt = nthStmt(this.red, 0);
		if (stmt && stmt.tag === "StmtExpr") {
			return stmt.expr();
		}

		return undefined;
	}

	thenBranch(): Stmt | undefined {
		return nthStmt(this.red, 1);
	}

	elseBranch(): Stmt | undefined {
		return nthStmt(this.red, 2);
	}

	keyword1(): RedToken | undefined {
		for (const child of this.red.childrenTokens()) {
			if (child.getKind() === OTokenKind.KwIf) {
				return child;
			}
		}

		return undefined;
	}

	keyword2(): RedToken | undefined {
		for (const child of this.red.childrenTokens()) {
			if (child.getKind() === OTokenKind.KwElse) {
				return child;
			}
		}

		return undefined;
	}
}

export class StmtReturn {
	public readonly tag = "StmtReturn";
	public readonly red: RedNode;

	constructor(red: RedNode) {
		this.red = red;
	}

	expr(): Expr | undefined {
		const stmt = nthStmt(this.red, 0);
		if (stmt && stmt.tag === "StmtExpr") {
			return stmt.expr();
		}

		return undefined;
	}

	keyword(): RedToken | undefined {
		for (const child of this.red.childrenTokens()) {
			if (child.getKind() === OTokenKind.KwReturn) {
				return child;
			}
		}

		return undefined;
	}
}

export class StmtVariableDecl {
	public readonly tag = "StmtVariableDecl";
	public readonly red: RedNode;

	constructor(red: RedNode) {
		this.red = red;
	}

	typing(): TypeAnnotation | undefined {
		const stmt = nthStmt(this.red, 0);
		if (stmt instanceof TypeAnnotation) {
			return stmt;
		}

		return undefined;
	}

	name(): ExprNameRef | undefined {
		const expr = nthExpr(this.red, 0);
		if (expr instanceof ExprNameRef) {
			return expr;
		}

		return undefined;
	}

	names(): ExprNameRef[] | undefined {
		const expr_list = nthExpr(this.red, 0);
		if (expr_list instanceof ExprNameRefList) {
			return expr_list.names();
		}

		return undefined;
	}

	value(): Expr | undefined {
		const stmt = nthStmt(this.red, 1);
		if (stmt && stmt.tag === "StmtExpr") {
			return stmt.expr();
		}

		return undefined;
	}
}

export class StmtWhile {
	public readonly tag = "StmtWhile";
	public readonly red: RedNode;

	constructor(red: RedNode) {
		this.red = red;
	}

	condition(): Expr | undefined {
		const stmt = nthStmt(this.red, 0);
		if (stmt && stmt.tag === "StmtExpr") {
			const expr = stmt.expr();
			if (expr && expr instanceof ExprCompare) {
				return expr;
			}
		}

		return undefined;
	}

	body(): Stmt | undefined {
		return nthStmt(this.red, 1);
	}

	keyword(): RedToken | undefined {
		for (const child of this.red.childrenTokens()) {
			if (child.getKind() === OTokenKind.KwWhile) {
				return child;
			}
		}

		return undefined;
	}
}

export class ExprArrow {
	public readonly tag = "ExprArrow";
	public readonly red: RedNode;

	constructor(red: RedNode) {
		this.red = red;
	}

	lhs(): Expr | undefined {
		return nthExpr(this.red, 0);
	}

	rhs(): Expr | undefined {
		return nthExpr(this.red, 1);
	}

	op(): RedToken | undefined {
		for (const child of this.red.childrenTokens()) {
			switch (child.getKind()) {
				case OTokenKind.MinusGreat:
				case OTokenKind.LessMinus:
					return child;
			}
		}

		return undefined;
	}
}

export class ExprAssignment {
	public readonly tag = "ExprAssign";
	public readonly red: RedNode;

	constructor(red: RedNode) {
		this.red = red;
	}

	name(): ExprNameRef | undefined {
		const expr = nthExpr(this.red, 0);
		if (expr instanceof ExprNameRef) {
			return expr;
		}

		return undefined;
	}

	value(): Expr | undefined {
		return nthExpr(this.red, 1);
	}

	op(): RedToken | undefined {
		for (const child of this.red.childrenTokens()) {
			switch (child.getKind()) {
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
	public readonly red: RedNode;

	constructor(red: RedNode) {
		this.red = red;
	}

	lhs(): Expr | undefined {
		return nthExpr(this.red, 0);
	}

	rhs(): Expr | undefined {
		return nthExpr(this.red, 1);
	}

	op(): RedToken | undefined {
		for (const child of this.red.childrenTokens()) {
			switch (child.getKind()) {
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
	public readonly red: RedNode;

	constructor(red: RedNode) {
		this.red = red;
	}

	name(): ExprNameRef | undefined {
		const expr_cast = nthExpr(this.red, 0);
		if (expr_cast instanceof ExprNameRef) {
			return expr_cast;
		}

		return undefined;
	}

	argList(): ArgList | undefined {
		const stmt_cast = nthStmt(this.red, 0);
		if (stmt_cast && stmt_cast instanceof ArgList) {
			return stmt_cast;
		}

		return undefined;
	}
}

export class ExprCast {
	public readonly tag = "ExprCast";
	public readonly red: RedNode;

	constructor(red: RedNode) {
		this.red = red;
	}

	typing(): TypeAnnotation | undefined {
		const stmt = nthStmt(this.red, 0);
		if (stmt instanceof TypeAnnotation) {
			return stmt;
		}

		return undefined;
	}

	expr(): Expr | undefined {
		return nthExpr(this.red, 0);
	}
}

export class ExprCompare {
	public readonly tag = "ExprCompare";
	public readonly red: RedNode;

	constructor(red: RedNode) {
		this.red = red;
	}

	lhs(): Expr | undefined {
		return nthExpr(this.red, 0);
	}

	rhs(): Expr | undefined {
		return nthExpr(this.red, 1);
	}

	op(): RedToken | undefined {
		for (const child of this.red.childrenTokens()) {
			switch (child.getKind()) {
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
	public readonly red: RedNode;

	constructor(red: RedNode) {
		this.red = red;
	}

	name(): ExprNameRef | undefined {
		const expr = nthExpr(this.red, 0);
		if (expr instanceof ExprNameRef) {
			return expr;
		}

		return undefined;
	}

	property(): Expr | undefined {
		return nthExpr(this.red, 1);
	}
}

export class ExprGrouping {
	public readonly tag = "ExprGrouping";
	public readonly red: RedNode;

	constructor(red: RedNode) {
		this.red = red;
	}

	expr(): Expr | undefined {
		return nthExpr(this.red, 0);
	}
}

export class ExprIndex {
	public readonly tag = "ExprIndex";
	public readonly red: RedNode;

	constructor(red: RedNode) {
		this.red = red;
	}

	name(): ExprNameRef | undefined {
		const expr = nthExpr(this.red, 0);
		if (expr instanceof ExprNameRef) {
			return expr;
		}

		return undefined;
	}

	index(): Expr | undefined {
		return nthExpr(this.red, 1);
	}
}

export class ExprLiteral {
	public readonly tag = "ExprLiteral";
	public readonly red: RedNode;

	constructor(red: RedNode) {
		this.red = red;
	}

	parse(): RedToken | undefined {
		for (const child of this.red.childrenTokens()) {
			return child;
		}

		return undefined;
	}
}

export class ExprLogical {
	public readonly tag = "ExprLogical";
	public readonly red: RedNode;

	constructor(red: RedNode) {
		this.red = red;
	}

	lhs(): Expr | undefined {
		return nthExpr(this.red, 0);
	}

	rhs(): Expr | undefined {
		return nthExpr(this.red, 1);
	}

	op(): RedToken | undefined {
		for (const child of this.red.childrenTokens()) {
			switch (child.getKind()) {
				case OTokenKind.BarBar:
				case OTokenKind.AmprAmpr:
					return child;
			}
		}

		return undefined;
	}
}

export class ExprNameRef {
	public readonly tag = "ExprNameRef";
	public readonly red: RedNode;

	constructor(red: RedNode) {
		this.red = red;
	}

	name(): RedToken | undefined {
		for (const child of this.red.childrenTokens()) {
			return child;
		}

		return undefined;
	}
}

export class ExprNameRefList {
	public readonly tag = "ExprNameRefList";
	public readonly red: RedNode;

	constructor(red: RedNode) {
		this.red = red;
	}

	names(): ExprNameRef[] | undefined {
		const name_refs: ExprNameRef[] = [];

		for (const child of this.red.childrenNodes()) {
			const expr = castExpr(child);
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

export class ExprPostfix {
	public readonly tag = "ExprPostfix";
	public readonly red: RedNode;

	constructor(red: RedNode) {
		this.red = red;
	}

	expr(): Expr | undefined {
		return nthExpr(this.red, 0);
	}

	op(): RedToken | undefined {
		for (const child of this.red.childrenTokens()) {
			switch (child.getKind()) {
				case OTokenKind.PlusPlus:
				case OTokenKind.MinusMinus:
					return child;
			}
		}

		return undefined;
	}
}

export class ExprPrefix {
	public readonly tag = "ExprPrefix";
	public readonly red: RedNode;

	constructor(red: RedNode) {
		this.red = red;
	}

	expr(): Expr | undefined {
		return nthExpr(this.red, 0);
	}

	op(): RedToken | undefined {
		for (const child of this.red.childrenTokens()) {
			switch (child.getKind()) {
				case OTokenKind.PlusPlus:
				case OTokenKind.MinusMinus:
				case OTokenKind.Ampr:
				case OTokenKind.Plus:
				case OTokenKind.Minus:
				case OTokenKind.Tilde:
				case OTokenKind.Bang:
				case OTokenKind.KwSizeof:
				case OTokenKind.KwNull:
					return child;
			}
		}

		return undefined;
	}
}

export class ExprRange {
	public readonly tag = "ExprRange";
	public readonly red: RedNode;

	constructor(red: RedNode) {
		this.red = red;
	}

	name(): ExprNameRef | undefined {
		const expr = nthExpr(this.red, 0);
		if (expr instanceof ExprNameRef) {
			return expr;
		}

		return undefined;
	}

	startIndex(): Expr | undefined {
		return nthExpr(this.red, 1);
	}

	endIndex(): Expr | undefined {
		return nthExpr(this.red, 2);
	}
}

export class ExprSet {
	public readonly tag = "ExprSet";
	public readonly red: RedNode;

	constructor(red: RedNode) {
		this.red = red;
	}

	name(): ExprNameRef | undefined {
		const expr = nthExpr(this.red, 0);
		if (expr instanceof ExprNameRef) {
			return expr;
		}

		return undefined;
	}

	property(): Expr | undefined {
		return nthExpr(this.red, 1);
	}

	value(): Expr | undefined {
		return nthExpr(this.red, 2);
	}
}

export class ExprStringConcat {
	public readonly tag = "ExprStringConcat";
	public readonly red: RedNode;

	constructor(red: RedNode) {
		this.red = red;
	}

	lhs(): Expr | undefined {
		return nthExpr(this.red, 0);
	}

	rhs(): Expr | undefined {
		return nthExpr(this.red, 1);
	}
}

export class ExprTernary {
	public readonly tag = "ExprTernary";
	public readonly red: RedNode;

	constructor(red: RedNode) {
		this.red = red;
	}

	condition(): Expr | undefined {
		return nthExpr(this.red, 0);
	}

	thenBranch(): Expr | undefined {
		return nthExpr(this.red, 1);
	}

	elseBranch(): Expr | undefined {
		return nthExpr(this.red, 2);
	}
}

export class ExprWrite {
	public readonly tag = "ExprWrite";
	public readonly red: RedNode;

	constructor(red: RedNode) {
		this.red = red;
	}

	lhs(): Expr | undefined {
		return nthExpr(this.red, 0);
	}

	rhs(): Expr | undefined {
		return nthExpr(this.red, 1);
	}
}

function nthExpr(red: RedNode, n: number): Expr | undefined {
	let count = 0;
	for (const child of red.childrenNodes()) {
		const expr_cast = castExpr(child);
		if (expr_cast) {
			if (count === n) return expr_cast;
			count++;
		}
	}

	return undefined;
}

function nthStmt(red: RedNode, n: number): Stmt | undefined {
	let count = 0;
	for (const child of red.childrenNodes()) {
		const stmt_cast = castStmt(child);
		if (stmt_cast) {
			if (count === n) return stmt_cast;
			count++;
		}
	}

	return undefined;
}
