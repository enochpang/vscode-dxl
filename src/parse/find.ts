import * as ast from "./syntax/ast";
import {
	type RedElement,
	RedNode,
	RedToken,
	pp_red_element,
} from "./syntax/red_tree";
import { OTokenKind, OTreeKind } from "./syntax/syntax_kind";

export function find_definition(
	red_tree: RedNode,
	offset: number,
): RedToken | undefined {
	const start_node = node_at_offset(red_tree, offset);
	if (!start_node) {
		return undefined;
	}

	let start_name: string | undefined;
	const start_expr = ast.cast_expr(start_node);
	if (start_expr instanceof ast.ExprNameRef) {
		start_name = start_expr.name()?.green.text;
	}

	if (!start_name) {
		return undefined;
	}

	const start_level = get_level(start_node);

	for (const previous_node of start_node.previous()) {
		const name = get_same_decl_name(previous_node, start_name);

		if (name && get_level(name) <= start_level) {
			return name;
		}
	}

	// If there were no variable or function declarations of the same name, then use the first variable
	// equal (=) assignment of the same name
	for (const previous_node of start_node.previous()) {
		const name = get_same_assign_name(previous_node, start_name);

		if (name && get_level(name) <= start_level) {
			return name;
		}
	}

	return undefined;
}

export function find_references(red_tree: RedNode, offset: number) {
	const start_node = find_definition(red_tree, offset)?.parent;
	if (!start_node) {
		return undefined;
	}

	let start_name: string | undefined;
	const start_expr = ast.cast_expr(start_node);
	if (start_expr instanceof ast.ExprNameRef) {
		start_name = start_expr.name()?.green.text;
	}

	if (!start_name) {
		return undefined;
	}

	const start_node_parent = start_node.parent;
	if (!start_node_parent) {
		return undefined;
	}

	const start_level = get_level(start_node);
	const start_offset = start_node.green.get_start_offset();
	let scoping_node = get_containing_scope(start_node);

	if (
		scoping_node.parent &&
		(scoping_node.green.kind === OTreeKind.StmtFuncDecl ||
			scoping_node.green.kind === OTreeKind.ParamList)
	) {
		scoping_node = scoping_node.parent;
	}

	const results = get_references(
		scoping_node,
		start_name,
		start_offset,
		start_level,
		[],
	);

	return results;
}

function get_references(
	node: RedNode,
	start_name: string,
	offset: number,
	start_level: number,
	acc: RedToken[],
) {
	let offset_skip = offset;

	for (const child of node.children_nodes()) {
		if (child.green.get_end_offset() <= offset_skip) continue;

		const name = get_same_decl_name(child, start_name);
		if (name && get_level(name) > start_level) {
			const scoping_node = get_containing_scope(child);
			if (scoping_node.green.kind !== OTreeKind.TreeRoot) {
				offset_skip = scoping_node.green.get_end_offset();
			}
		} else {
			const expr = ast.cast_expr(child);
			if (expr instanceof ast.ExprNameRef) {
				const name = expr.name();
				if (name && name.green.text === start_name) {
					acc.push(name);
				}
			}

			get_references(child, start_name, offset, start_level, acc);
		}
	}

	return acc;
}

function get_same_decl_name(
	node: RedNode,
	start_name: string,
): RedToken | undefined {
	const stmt = ast.cast_stmt(node);
	if (stmt instanceof ast.StmtVariableDecl) {
		const names = stmt.names();
		if (names) {
			for (const nameRef of names) {
				const name = nameRef.name();
				if (name && start_name === name.green.text) {
					return name;
				}
			}
		} else {
			const nameRef = stmt.name();
			if (nameRef) {
				const name = nameRef.name();
				if (name && start_name === name.green.text) {
					return name;
				}
			}
		}
	} else if (stmt instanceof ast.StmtArrayDecl) {
		const nameRef = stmt.name();
		if (nameRef) {
			const name = nameRef.name();
			if (name && start_name === name.green.text) {
				return name;
			}
		}
	} else if (stmt instanceof ast.StmtFunctionDecl) {
		const nameRef = stmt.name();
		if (nameRef) {
			const name = nameRef.name();
			if (name && start_name === name.green.text) {
				return name;
			}
		}
	} else if (stmt instanceof ast.ParamList) {
		for (const param of stmt.params()) {
			const param_decl = param.decl();

			if (param_decl instanceof ast.StmtVariableDecl) {
				const nameRef = param_decl.name();
				if (nameRef) {
					const name = nameRef.name();
					if (name && start_name === name.green.text) {
						return name;
					}
				}
			} else if (param_decl instanceof ast.StmtArrayDecl) {
				const nameRef = param_decl.name();
				if (nameRef) {
					const name = nameRef.name();
					if (name && start_name === name.green.text) {
						return name;
					}
				}
			} else if (param_decl instanceof ast.StmtFunctionDecl) {
				const nameRef = param_decl.name();
				if (nameRef) {
					const name = nameRef.name();
					if (name && start_name === name.green.text) {
						return name;
					}
				}
			}
		}
	}

	return undefined;
}

function get_same_assign_name(
	node: RedNode,
	start_name: string,
): RedToken | undefined {
	let result_token = undefined;

	const stmt = ast.cast_stmt(node);
	if (stmt instanceof ast.StmtExpr) {
		const expr = stmt.expr();
		if (expr instanceof ast.ExprAssign) {
			const op = expr.op();
			if (op && op.green.token.kind === OTokenKind.Equal) {
				const nameRef = expr.name();
				if (nameRef) {
					const name = nameRef.name();
					if (name && start_name === name.green.text) {
						result_token = name;
					}
				}
			}
		}
	}

	return result_token;
}

export function node_at_offset(
	node: RedNode,
	offset: number,
): RedNode | undefined {
	let result: RedNode | undefined;

	for (const child of node.children()) {
		if (child instanceof RedNode) {
			if (
				offset >= child.green.get_start_offset() &&
				offset <= child.green.get_end_offset()
			) {
				return node_at_offset(child, offset);
			}
		} else if (child instanceof RedToken) {
			if (
				offset >= child.green.token.offset &&
				offset <= child.green.token.end_offset
			) {
				result = node;
			}
		}
	}

	return result;
}

export function token_at_offset(
	node: RedNode,
	offset: number,
): RedToken | undefined {
	for (const child of node.children()) {
		if (child instanceof RedNode) {
			if (
				offset >= child.green.get_start_offset() &&
				offset <= child.green.get_end_offset()
			) {
				return token_at_offset(child, offset);
			}
		} else if (child instanceof RedToken) {
			if (
				offset >= child.green.token.offset &&
				offset <= child.green.token.end_offset
			) {
				return child;
			}
		}
	}

	return undefined;
}

export function get_containing_scope(node: RedNode): RedNode {
	for (const parent of node.ancestors()) {
		const stmt = ast.cast_stmt(parent);

		if (
			stmt instanceof ast.Root ||
			stmt instanceof ast.StmtIf ||
			stmt instanceof ast.StmtFor ||
			stmt instanceof ast.StmtWhile ||
			stmt instanceof ast.StmtBlock ||
			stmt instanceof ast.StmtFunctionDecl ||
			stmt instanceof ast.ParamList
		) {
			return parent;
		}
	}

	return node;
}

export function get_level(node: RedElement) {
	let count = 0;
	for (const item of node.ancestors()) {
		const stmt = ast.cast_stmt(item);

		if (
			stmt instanceof ast.Root ||
			stmt instanceof ast.StmtIf ||
			stmt instanceof ast.StmtFor ||
			stmt instanceof ast.StmtWhile ||
			stmt instanceof ast.StmtBlock ||
			stmt instanceof ast.ParamList
		) {
			count++;
		}
	}

	return count;
}
