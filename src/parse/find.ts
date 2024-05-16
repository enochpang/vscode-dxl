import * as ast from "./syntax/ast";
import {
	type RedElement,
	RedNode,
	RedToken,
	pp_red_element,
} from "./syntax/red_tree";
import { OTreeKind } from "./syntax/syntax_kind";

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
		const stmt = ast.cast_stmt(previous_node);

		if (stmt instanceof ast.StmtVariableDecl) {
			const names = stmt.names();
			if (names) {
				for (const nameRef of names) {
					const name = nameRef.name();
					if (name && start_name === name.green.text) {
						const name_level = get_level(name);
						if (name_level <= start_level) {
							return name;
						}
					}
				}
			} else {
				const nameRef = stmt.name();
				if (nameRef) {
					const name = nameRef.name();
					if (name && start_name === name.green.text) {
						const name_level = get_level(name);
						if (name_level <= start_level) {
							return name;
						}
					}
				}
			}
		} else if (stmt instanceof ast.StmtFunctionDecl) {
			const nameRef = stmt.name();
			if (nameRef) {
				const name = nameRef.name();
				if (name && start_name === name.green.text) {
					const name_level = get_level(name);
					if (name_level <= start_level) {
						return name;
					}
				}
			}

			const paramList = stmt.params();
			if (!paramList) {
				continue;
			}

			for (const param of paramList.params()) {
				const param_expr = param.expr();
				if (param_expr instanceof ast.StmtVariableDecl) {
					const nameRef = param_expr.name();
					if (nameRef) {
						const name = nameRef.name();
						if (name && start_name === name.green.text) {
							const name_level = get_level(name);
							if (name_level <= start_level) {
								return name;
							}
						}
					}
				} else if (param_expr instanceof ast.StmtFunctionDecl) {
					const nameRef = param_expr.name();
					if (nameRef) {
						const name = nameRef.name();
						if (name && start_name === name.green.text) {
							const name_level = get_level(name);
							if (name_level <= start_level) {
								return name;
							}
						}
					}
				}
			}
		} else if (stmt instanceof ast.StmtFor) {
			const init_expr = stmt.initializer();
			if (init_expr && init_expr instanceof ast.ExprAssign) {
				const nameRef = init_expr.name();
				if (nameRef) {
					const name = nameRef.name();
					if (name && start_name === name.green.text) {
						const name_level = get_level(name);
						if (name_level <= start_level) {
							return name;
						}
					}
				}
			}
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
	const containing_context = get_containing_context(start_node);

	const results = get_references(
		containing_context,
		start_name,
		start_offset,
		start_level,
		[],
	);

	if (results) {
		for (const item of results) {
			const level = get_level(item);
			const line = item.green.token.start_loc.line + 1;

			console.log(`${pp_red_element(item)} Ln${line} ${level}`);
		}
	}

	return results;
}

function get_references(
	node: RedNode,
	start_name: string,
	offset_skip: number,
	start_level: number,
	acc: RedToken[],
) {
	for (const child of node.children_nodes()) {
		if (child.green.get_end_offset() <= offset_skip) continue;

		let skipName = false;

		const stmt = ast.cast_stmt(child);
		if (stmt instanceof ast.StmtVariableDecl) {
			const names = stmt.names();
			if (names) {
				for (const nameRef of names) {
					const name = nameRef.name();
					if (name && start_name === name.green.text) {
						const name_level = get_level(name);
						if (name_level > start_level) {
							skipName = true;
						}
					}
				}
			} else {
				const nameRef = stmt.name();
				if (nameRef) {
					const name = nameRef.name();
					if (name && start_name === name.green.text) {
						const name_level = get_level(name);
						if (name_level > start_level) {
							skipName = true;
						}
					}
				}
			}
		} else if (stmt instanceof ast.StmtFunctionDecl) {
			const nameRef = stmt.name();
			if (nameRef) {
				const name = nameRef.name();
				if (name && start_name === name.green.text) {
					const name_level = get_level(name);
					if (name_level > start_level) {
						skipName = true;
					}
				}
			}

			const paramList = stmt.params();
			if (!paramList) {
				continue;
			}

			for (const param of paramList.params()) {
				const param_expr = param.expr();
				if (param_expr instanceof ast.StmtVariableDecl) {
					const nameRef = param_expr.name();
					if (nameRef) {
						const name = nameRef.name();
						if (name && start_name === name.green.text) {
							const name_level = get_level(name);
							if (name_level > start_level) {
								skipName = true;
							}
						}
					}
				} else if (param_expr instanceof ast.StmtFunctionDecl) {
					const nameRef = param_expr.name();
					if (nameRef) {
						const name = nameRef.name();
						if (name && start_name === name.green.text) {
							const name_level = get_level(name);
							if (name_level > start_level) {
								skipName = true;
							}
						}
					}
				}
			}
		}

		if (!skipName) {
			const expr = ast.cast_expr(child);
			if (expr instanceof ast.ExprNameRef) {
				const name = expr.name();
				if (name && name.green.text === start_name) {
					const name_level = get_level(name);
					if (name_level < start_level) {
						break;
					}
					acc.push(name);
				}
			}

			get_references(child, start_name, offset_skip, start_level, acc);
		}
	}

	return acc;
}

export function get_functions(
	red_tree: RedNode,
): [ast.StmtFunctionDecl, RedToken][] {
	const res: [ast.StmtFunctionDecl, RedToken][] = [];

	const ast_tree = ast.cast_root(red_tree);
	const stmts = ast_tree?.stmts();

	if (stmts) {
		for (const stmt of stmts) {
			if (stmt instanceof ast.StmtFunctionDecl) {
				const nameRef = stmt.name();
				if (nameRef) {
					const name = nameRef.name();
					if (name) {
						res.push([stmt, name]);
					}
				}
			}
		}
	}

	return res;
}

export function node_at_offset(
	node: RedNode,
	offset: number,
): RedNode | undefined {
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
				return node;
			}
		}
	}

	return undefined;
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

function get_containing_context(node: RedNode): RedNode {
	for (const parent of node.ancestors()) {
		const stmt = ast.cast_stmt(parent);

		if (
			stmt instanceof ast.Root ||
			stmt instanceof ast.StmtBlock ||
			stmt instanceof ast.StmtIf ||
			stmt instanceof ast.StmtFor ||
			stmt instanceof ast.StmtWhile
		) {
			return parent;
		}
	}

	return node;
}

function get_level(node: RedElement) {
	let count = 0;
	for (const item of node.ancestors()) {
		switch (item.green.kind) {
			case OTreeKind.StmtBlock:
			case OTreeKind.ParamList:
				count++;
		}
	}

	return count;
}
