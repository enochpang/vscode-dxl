import type * as ast from "./ast";
import { RedToken } from "./red_tree";

export type AstVisitor<R> = {
	stmt_array_decl(kind: ast.StmtArrayDecl): R;
	stmt_block(kind: ast.StmtBlock): R;
	stmt_break(kind: ast.StmtBreak): R;
	stmt_continue(kind: ast.StmtContinue): R;
	stmt_expr(kind: ast.StmtExpr): R;
	stmt_function_decl(kind: ast.StmtFunctionDecl): R;
	stmt_for(kind: ast.StmtFor): R;
	stmt_for_in(kind: ast.StmtForIn): R;
	stmt_if(kind: ast.StmtIf): R;
	stmt_return(kind: ast.StmtReturn): R;
	stmt_variable_decl(kind: ast.StmtVariableDecl): R;
	stmt_while(kind: ast.StmtWhile): R;
	expr_assign(kind: ast.ExprAssign): R;
	expr_binary(kind: ast.ExprBinary): R;
	expr_call(kind: ast.ExprCall): R;
	expr_cast(kind: ast.ExprCast): R;
	expr_compare(kind: ast.ExprCompare): R;
	expr_get(kind: ast.ExprGet): R;
	expr_grouping(kind: ast.ExprGrouping): R;
	expr_index(kind: ast.ExprIndex): R;
	expr_logical(kind: ast.ExprLogical): R;
	expr_range(kind: ast.ExprRange): R;
	expr_set(kind: ast.ExprSet): R;
	expr_set_dbe(kind: ast.ExprArrow): R;
	expr_string_concat(kind: ast.ExprStringConcat): R;
	expr_ternary(kind: ast.ExprTernary): R;
	expr_variable_ref_list(kind: ast.ExprNameRefList): R;
	expr_variable_ref(kind: ast.ExprNameRef): R;
	expr_unary(kind: ast.ExprUnary): R;
	expr_write(kind: ast.ExprWrite): R;
	expr_literal(kind: ast.ExprLiteral): R;
	param(kind: ast.Param): R;
	paramlist(kind: ast.ParamList): R;
	arglist(kind: ast.ArgList): R;
	typeAnnotation(kind: ast.TypeAnnotation): R;
	root(kind: ast.Root): R;
};

export function visit<R>(node: ast.AstNode, v: AstVisitor<R>): R {
	switch (node.tag) {
		case "StmtArrayDecl":
			return v.stmt_array_decl(node);
		case "StmtBlock":
			return v.stmt_block(node);
		case "StmtBreak":
			return v.stmt_break(node);
		case "StmtContinue":
			return v.stmt_continue(node);
		case "StmtExpr":
			return v.stmt_expr(node);
		case "StmtFunctionDecl":
			return v.stmt_function_decl(node);
		case "StmtFor":
			return v.stmt_for(node);
		case "StmtForIn":
			return v.stmt_for_in(node);
		case "StmtIf":
			return v.stmt_if(node);
		case "StmtReturn":
			return v.stmt_return(node);
		case "StmtVariableDecl":
			return v.stmt_variable_decl(node);
		case "StmtWhile":
			return v.stmt_while(node);
		case "ExprAssign":
			return v.expr_assign(node);
		case "ExprBinary":
			return v.expr_binary(node);
		case "ExprCall":
			return v.expr_call(node);
		case "ExprCast":
			return v.expr_cast(node);
		case "ExprCompare":
			return v.expr_compare(node);
		case "ExprGet":
			return v.expr_get(node);
		case "ExprGrouping":
			return v.expr_grouping(node);
		case "ExprIndex":
			return v.expr_index(node);
		case "ExprLogical":
			return v.expr_logical(node);
		case "ExprRange":
			return v.expr_range(node);
		case "ExprSet":
			return v.expr_set(node);
		case "ExprSetDbe":
			return v.expr_set_dbe(node);
		case "ExprStringConcat":
			return v.expr_string_concat(node);
		case "ExprTernary":
			return v.expr_ternary(node);
		case "ExprNameRefList":
			return v.expr_variable_ref_list(node);
		case "ExprNameRef":
			return v.expr_variable_ref(node);
		case "ExprUnary":
			return v.expr_unary(node);
		case "ExprWrite":
			return v.expr_write(node);
		case "ExprLiteral":
			return v.expr_literal(node);
		case "ArgList":
			return v.arglist(node);
		case "ParamList":
			return v.paramlist(node);
		case "Param":
			return v.param(node);
		case "TypeAnnotation":
			return v.typeAnnotation(node);
		case "Root":
			return v.root(node);
	}
}

export function pp_ast(node: ast.AstNode): string {
	function pp_ast(n: number, node: ast.AstNode | RedToken | undefined): string {
		if (!node) {
			return "";
		}

		const sb: string[] = [];

		if (n > 0) {
			sb.push("\n");
			sb.push(`${" ".repeat(2 * n)}`);
		}

		if (node instanceof RedToken) {
			sb.push(node.green.text);
			return sb.join("");
		}

		switch (node.tag) {
			case "ExprAssign":
				sb.push(node.tag, ", ", pp_ast(0, node.op()));
				sb.push(pp_ast(n + 1, node.name()));
				sb.push(pp_ast(n + 1, node.value()));
				break;
			case "ExprBinary":
				sb.push(node.tag, ", ", pp_ast(0, node.op()));
				sb.push(pp_ast(n + 1, node.lhs()));
				sb.push(pp_ast(n + 1, node.rhs()));
				break;
			case "ExprCall": {
				sb.push(node.tag, ", ", pp_ast(0, node.name()));
				const arglist = node.args();
				if (arglist) {
					for (const arg of arglist.args()) {
						sb.push(pp_ast(n + 2, arg));
					}
				}
				break;
			}
			case "ExprCast":
				sb.push(node.tag, ", ", pp_ast(0, node.typing()?.name()));
				sb.push(pp_ast(n + 1, node.expr()));
				break;
			case "ExprCompare":
				sb.push(node.tag, ", ", pp_ast(0, node.op()));
				sb.push(pp_ast(n + 1, node.lhs()));
				sb.push(pp_ast(n + 1, node.rhs()));
				break;
			case "ExprGet":
				sb.push(node.tag, ", ", pp_ast(0, node.name()));
				sb.push(pp_ast(n + 1, node.property()));
				break;
			case "ExprGrouping":
				sb.push(node.tag);
				sb.push(pp_ast(n + 1, node.expr()));
				break;
			case "ExprIndex":
				sb.push(node.tag, ", ", pp_ast(0, node.name()));
				sb.push(pp_ast(n + 1, node.index()));
				break;
			case "ExprLiteral":
				sb.push(node.tag, ", ", pp_ast(0, node.parse()));
				break;
			case "ExprLogical":
				sb.push(node.tag, ", ", pp_ast(0, node.op()));
				sb.push(pp_ast(n + 1, node.lhs()));
				sb.push(pp_ast(n + 1, node.rhs()));
				break;
			case "ExprRange":
				sb.push(node.tag, ", ", pp_ast(0, node.name()));
				sb.push(pp_ast(n + 1, node.start_index()));
				sb.push(pp_ast(n + 1, node.end_index()));
				break;
			case "ExprSet":
				sb.push(node.tag, ", ", pp_ast(0, node.name()));
				sb.push(pp_ast(n + 1, node.property()));
				sb.push(pp_ast(n + 1, node.value()));
				break;
			case "ExprSetDbe":
				sb.push(node.tag);
				sb.push(pp_ast(n + 1, node.side()));
				sb.push(pp_ast(n + 1, node.attachment()));
				break;
			case "ExprStringConcat":
				sb.push(node.tag);
				sb.push(pp_ast(n + 1, node.lhs()));
				sb.push(pp_ast(n + 1, node.rhs()));
				break;
			case "ExprTernary":
				sb.push(node.tag);
				sb.push(pp_ast(n + 1, node.condition()));
				sb.push(pp_ast(n + 1, node.then_branch()));
				sb.push(pp_ast(n + 1, node.else_branch()));
				break;
			case "ExprUnary":
				sb.push(node.tag, ", ", pp_ast(0, node.op()));
				sb.push(pp_ast(n + 1, node.expr()));
				break;
			case "ExprNameRef":
				sb.push(node.tag, ", ", pp_ast(0, node.name()));
				break;
			case "ExprWrite":
				sb.push(node.tag);
				sb.push(pp_ast(n + 1, node.lhs()));
				sb.push(pp_ast(n + 1, node.rhs()));
				break;
			case "StmtArrayDecl": {
				sb.push(node.tag);
				sb.push(pp_ast(n + 1, node.name()));
				sb.push(pp_ast(n + 1, node.count()));

				const arglist = node.args();
				if (arglist) {
					for (const arg of arglist.args()) {
						sb.push(pp_ast(n + 2, arg));
					}
				}
				break;
			}
			case "StmtBlock":
				sb.push(node.tag);
				for (const stmt of node.stmts()) {
					sb.push(pp_ast(n + 2, stmt));
				}
				break;
			case "StmtExpr":
				sb.push(node.tag);
				sb.push(pp_ast(n + 1, node.expr()));
				break;
			case "StmtFor":
				sb.push(node.tag);
				sb.push(pp_ast(n + 1, node.initializer()));
				sb.push(pp_ast(n + 1, node.condition()));
				sb.push(pp_ast(n + 1, node.increment()));
				sb.push(pp_ast(n + 1, node.body()));
				break;
			case "StmtForIn":
				sb.push(node.tag);
				sb.push(pp_ast(n + 1, node.item()));
				sb.push(pp_ast(n + 1, node.parent()));
				sb.push(pp_ast(n + 1, node.body()));
				break;
			case "StmtFunctionDecl": {
				sb.push(node.tag);
				sb.push(
					pp_ast(n + 1, node.name()),
					" => ",
					pp_ast(0, node.typing()?.name()),
				);
				const paramlist = node.params();
				if (paramlist) {
					for (const param of paramlist.params()) {
						sb.push(pp_ast(n + 1, param));
					}
				}
				break;
			}
			case "StmtIf":
				sb.push(node.tag);
				sb.push(pp_ast(n + 1, node.condition()));
				sb.push(pp_ast(n + 1, node.then_branch()));
				if (node.else_branch) {
					sb.push(pp_ast(n + 1, node.else_branch()));
				}
				break;
			case "StmtReturn":
				sb.push(node.tag);
				if (node.expr) {
					sb.push(pp_ast(n + 1, node.expr()));
				}
				break;
			case "StmtVariableDecl":
				sb.push(node.tag);
				sb.push(
					pp_ast(n + 1, node.name()),
					" => ",
					pp_ast(0, node.typing()?.name()),
				);
				sb.push(pp_ast(n + 1, node.value()));
				break;
			case "StmtWhile":
				sb.push(node.tag);
				sb.push(pp_ast(n + 1, node.condition()));
				sb.push(pp_ast(n + 1, node.body()));
				break;
			case "Param":
				sb.push(node.tag);
				sb.push(pp_ast(n + 1, node.decl()));
				break;
			case "Root":
				sb.push(node.tag);
				for (const stmt of node.stmts()) {
					sb.push(pp_ast(n + 1, stmt));
				}
				break;
			default:
				sb.push("Not Implemented");
				break;
		}

		return sb.join("");
	}

	return pp_ast(0, node);
}
