import * as ast from "./syntax/ast";
import { type RedElement, RedNode, RedToken } from "./syntax/red_tree";
import { ONodeKind, OTokenKind } from "./syntax/syntax_kind";

export function findDefinition(
	red_tree: RedNode,
	offset: number,
): RedToken | undefined {
	const start_node = nodeAtOffset(red_tree, offset);
	if (!start_node) {
		return undefined;
	}

	let start_name: string | undefined;
	const start_expr = ast.castExpr(start_node);
	if (start_expr instanceof ast.ExprNameRef) {
		start_name = start_expr.name()?.green.text;
	}

	if (!start_name) {
		return undefined;
	}

	const start_level = getLevel(start_node);

	const previous_nodes = elementsToOffset(red_tree, offset);
	previous_nodes.reverse();

	for (const previous_node of previous_nodes) {
		if (previous_node instanceof RedNode) {
			const name = getSameDeclName(previous_node, start_name);

			if (name && getLevel(name) <= start_level) {
				return name;
			}
		}
	}

	// If there were no variable or function declarations of the same name, then use the first variable
	// equal (=) assignment of the same name
	for (const previous_node of previous_nodes) {
		if (previous_node instanceof RedNode) {
			const name = getSameAssignName(previous_node, start_name);

			if (name && getLevel(name) <= start_level) {
				return name;
			}
		}
	}

	return undefined;
}

export function findReferences(red_tree: RedNode, offset: number) {
	function getReferences(
		node: RedNode,
		start_name: string,
		offset: number,
		start_level: number,
		acc: RedToken[],
	) {
		let offset_skip = offset;

		for (const child of node.childrenNodes()) {
			if (child.getRange().end <= offset_skip) continue;

			const name = getSameDeclName(child, start_name);
			if (name && getLevel(name) > start_level) {
				const scoping_node = getContainingScope(child);
				if (scoping_node.getKind() !== ONodeKind.TreeRoot) {
					offset_skip = scoping_node.getRange().end;
				}
			} else {
				const expr = ast.castExpr(child);
				if (expr instanceof ast.ExprNameRef) {
					const name = expr.name();
					if (name && name.green.text === start_name) {
						acc.push(name);
					}
				}

				getReferences(child, start_name, offset, start_level, acc);
			}
		}

		return acc;
	}

	const start_node = findDefinition(red_tree, offset)?.parent;
	if (!start_node) {
		return undefined;
	}

	let start_name: string | undefined;
	const start_expr = ast.castExpr(start_node);
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

	const start_level = getLevel(start_node);
	const start_offset = start_node.getRange().start;
	let scoping_node = getContainingScope(start_node);

	if (
		scoping_node.parent &&
		(scoping_node.getKind() === ONodeKind.StmtFuncDecl ||
			scoping_node.getKind() === ONodeKind.ParamList)
	) {
		scoping_node = scoping_node.parent;
	}

	const results = getReferences(
		scoping_node,
		start_name,
		start_offset,
		start_level,
		[],
	);

	return results;
}

export function elementsToOffset(node: RedNode, offset: number) {
	function loop(node: RedNode, offset: number, acc: RedElement[]) {
		for (const child of node.children()) {
			const range = child.getRange();

			if (range.start > offset) {
				break;
			}

			acc.push(child);

			if (
				offset >= range.start &&
				offset <= range.end &&
				child instanceof RedNode
			) {
				loop(child, offset, acc);
			}
		}

		return acc;
	}

	return loop(node, offset, []);
}

function getSameDeclName(
	node: RedNode,
	start_name: string,
): RedToken | undefined {
	const stmt = ast.castStmt(node);
	if (stmt instanceof ast.StmtVariableDecl) {
		const names = stmt.names();
		if (names) {
			for (const name_ref of names) {
				const name = name_ref.name();
				if (name && start_name === name.green.text) {
					return name;
				}
			}
		} else {
			const name_ref = stmt.name();
			if (name_ref) {
				const name = name_ref.name();
				if (name && start_name === name.green.text) {
					return name;
				}
			}
		}
	} else if (stmt instanceof ast.StmtArrayDecl) {
		const name_ref = stmt.name();
		if (name_ref) {
			const name = name_ref.name();
			if (name && start_name === name.green.text) {
				return name;
			}
		}
	} else if (stmt instanceof ast.StmtFunctionDecl) {
		const name_ref = stmt.name();
		if (name_ref) {
			const name = name_ref.name();
			if (name && start_name === name.green.text) {
				return name;
			}
		}
	} else if (stmt instanceof ast.ParamList) {
		for (const param of stmt.params()) {
			const param_decl = param.decl();

			if (param_decl instanceof ast.StmtVariableDecl) {
				const name_ref = param_decl.name();
				if (name_ref) {
					const name = name_ref.name();
					if (name && start_name === name.green.text) {
						return name;
					}
				}
			} else if (param_decl instanceof ast.StmtArrayDecl) {
				const name_ref = param_decl.name();
				if (name_ref) {
					const name = name_ref.name();
					if (name && start_name === name.green.text) {
						return name;
					}
				}
			} else if (param_decl instanceof ast.StmtFunctionDecl) {
				const name_ref = param_decl.name();
				if (name_ref) {
					const name = name_ref.name();
					if (name && start_name === name.green.text) {
						return name;
					}
				}
			}
		}
	}

	return undefined;
}

function getSameAssignName(
	node: RedNode,
	start_name: string,
): RedToken | undefined {
	let result_token = undefined;

	const expr = ast.castExpr(node);
	if (expr instanceof ast.ExprAssignment) {
		const op = expr.op();
		if (op && op.getKind() === OTokenKind.Equal) {
			const name_ref = expr.name();
			if (name_ref) {
				const name = name_ref.name();
				if (name && start_name === name.green.text) {
					result_token = name;
				}
			}
		}
	}

	return result_token;
}

export function nodeAtOffset(
	node: RedNode,
	offset: number,
): RedNode | undefined {
	let result: RedNode | undefined;

	for (const child of node.children()) {
		const range = child.getRange();

		if (child instanceof RedNode) {
			if (offset >= range.start && offset <= range.end) {
				return nodeAtOffset(child, offset);
			}
		} else if (child instanceof RedToken) {
			if (offset >= range.start && offset <= range.end) {
				result = node;
			}
		}
	}

	return result;
}

export function tokenAtOffset(
	node: RedNode,
	offset: number,
): RedToken | undefined {
	for (const child of node.children()) {
		const range = child.getRange();

		if (child instanceof RedNode) {
			if (offset >= range.start && offset <= range.end) {
				return tokenAtOffset(child, offset);
			}
		} else if (child instanceof RedToken) {
			if (offset >= range.start && offset <= range.end) {
				return child;
			}
		}
	}

	return undefined;
}

export function getContainingScope(node: RedNode): RedNode {
	for (const parent of node.ancestors()) {
		const stmt = ast.castStmt(parent);

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

export function getLevel(node: RedElement) {
	let count = 0;
	for (const item of node.ancestors()) {
		const stmt = ast.castStmt(item);

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
