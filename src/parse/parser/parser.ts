import { strict as assert } from "node:assert";

import {
	OTokenKind,
	OTreeKind,
	type TokenKind,
	type NodeKind,
} from "../syntax/syntax_kind";
import type { GreenToken, Token } from "../syntax/green_tree";
import type { ParseEvent } from "./events";

type MarkOpened = {
	index: number;
};

type MarkClosed = {
	index: number;
	kind: NodeKind;
};

export type ParseError = {
	tok: Token;
	msg: string;
};

export class Parser {
	private tokens: GreenToken[];
	private pos = 0;
	private fuel = 256;
	private events: ParseEvent[] = [];
	private errors: ParseError[] = [];

	constructor(lex_items: GreenToken[]) {
		this.tokens = lex_items;
	}

	public parse(): ParseEvent[] {
		const m = this.open();

		while (!this.eof()) {
			this.parse_declaration();

			if (this.peek().is_stmt_end()) {
				if (this.peek().kind === OTokenKind.Semicolon) {
					this.skip();
				}
				this.advance();
			}
		}

		this.close(m, OTreeKind.TreeRoot);

		return this.events;
	}

	private parse_declaration() {
		if (
			this.peek().kind === OTokenKind.KwConst ||
			this.peek().kind === OTokenKind.KwStatic
		) {
			this.bump_as(OTreeKind.WarningNode);
		}

		if (this.peek_item().is_type_specifier()) {
			const m = this.open();

			this.bump_as(OTreeKind.TypeAnnotation);

			if (this.peek().kind === OTokenKind.Ampr) {
				this.bump();
			}

			if (this.peek().kind === OTokenKind.Ident) {
				const m_name = this.bump_as(OTreeKind.NameRef);

				if (this.peek().kind === OTokenKind.Lparen) {
					return this.parse_func_declaration(m);
				} else {
					return this.parse_var_declaration(m, m_name);
				}
			} else {
				this.add_error(
					this.peek(),
					`Expected= ${OTokenKind.Ident}. Got= ${this.peek().kind}`,
				);
				return this.synchronize(m);
			}
		}

		this.parse_statement();
	}

	private parse_param() {
		const m = this.open();

		if (this.peek_item().is_type_specifier()) {
			this.bump_as(OTreeKind.TypeAnnotation);

			if (this.peek().kind === OTokenKind.Ampr) {
				this.bump();
			}

			if (this.peek().kind === OTokenKind.Ident) {
				this.bump_as(OTreeKind.NameRef);

				if (this.peek().kind === OTokenKind.Lparen) {
					return this.parse_func_declaration(m);
				} else {
					return this.parse_var_declaration(m, undefined);
				}
			} else {
				return this.close(m, OTreeKind.StmtFuncDecl);
			}
		} else {
			if (this.peek().kind === OTokenKind.Ampr) {
				this.bump();
			}

			if (this.peek().kind === OTokenKind.Ident) {
				this.bump_as(OTreeKind.NameRef);
				return this.parse_var_declaration(m, undefined);
			} else {
				this.add_error(
					this.peek(),
					`Expected= ${OTokenKind.Ident}. Got= ${this.peek().kind}`,
				);
				return this.synchronize(m);
			}
		}
	}

	private parse_func_declaration(m: MarkOpened) {
		if (
			this.expect(OTokenKind.Lparen) &&
			this.peek().kind !== OTokenKind.Rparen
		) {
			const m_params = this.open();

			while (true) {
				const m_param = this.open();

				switch (this.peek().kind) {
					case OTokenKind.Comma:
					case OTokenKind.Rparen:
						break;
					default:
						this.parse_param();
						break;
				}

				this.close(m_param, OTreeKind.Param);

				if (this.peek().kind === OTokenKind.Comma) {
					this.bump();
				} else {
					break;
				}
			}

			this.close(m_params, OTreeKind.ParamList);
		}

		this.expect(OTokenKind.Rparen);

		if (this.peek().kind === OTokenKind.Lcurly) {
			this.parse_block_stmt();
		}

		this.close(m, OTreeKind.StmtFuncDecl);
	}

	private parse_var_declaration(m: MarkOpened, m_name: MarkClosed | undefined) {
		if (this.consume_if(OTokenKind.Equal)) {
			this.parse_expression();
		} else if (this.consume_if(OTokenKind.Lbracket)) {
			if (!this.consume_if(OTokenKind.Rbracket)) {
				this.parse_expression();
				this.expect(OTokenKind.Rbracket);
			}

			if (this.consume_if(OTokenKind.Equal)) {
				if (this.expect(OTokenKind.Lcurly)) {
					this.parse_expr_list(OTokenKind.Rcurly);

					this.expect(OTokenKind.Rcurly);
				}
			}

			this.close(m, OTreeKind.StmtArrayDecl);
			return;
		}

		if (m_name && this.peek().kind === OTokenKind.Comma) {
			const m_list = this.open_before(m_name);
			while (this.peek().kind === OTokenKind.Comma) {
				this.bump();

				if (this.peek().kind === OTokenKind.Ident) {
					this.bump_as(OTreeKind.NameRef);
				}

				if (this.consume_if(OTokenKind.Equal)) {
					this.parse_expression();
				}
			}
			this.close(m_list, OTreeKind.NameRefList);
		}

		this.close(m, OTreeKind.StmtVarDecl);
	}

	private parse_statement() {
		switch (this.peek().kind) {
			case OTokenKind.KwReturn:
			case OTokenKind.KwBreak:
			case OTokenKind.KwContinue:
				this.parse_jump_stmt();
				break;
			case OTokenKind.KwIf:
				this.parse_if_stmt();
				break;
			case OTokenKind.KwWhile:
				this.parse_while_stmt();
				break;
			case OTokenKind.KwFor:
				this.parse_for_stmt();
				break;
			case OTokenKind.Lcurly:
				this.parse_block_stmt();
				break;
			case OTokenKind.KwPragma:
				this.parse_pragma();
				break;
			case OTokenKind.KwInclude:
				this.parse_include();
				break;
			default:
				this.parse_expression();
				break;
		}

		if (this.peek().kind === OTokenKind.Semicolon) {
			this.skip();
		}
	}

	private parse_block_stmt() {
		const m = this.open();

		const lcurly_tok = this.peek();
		this.expect(OTokenKind.Lcurly);

		while (this.peek().kind !== OTokenKind.Rcurly && !this.eof()) {
			this.parse_declaration();
		}

		if (!this.expect(OTokenKind.Rcurly)) {
			this.add_error(lcurly_tok, "Open bracket missing closing bracket");
		}

		this.close(m, OTreeKind.StmtBlock);
	}

	private parse_if_stmt() {
		const m = this.open();

		this.expect(OTokenKind.KwIf);

		if (this.consume_if(OTokenKind.Lparen)) {
			this.parse_expression(); // The condition

			if (this.expect(OTokenKind.Rparen)) {
				if (this.peek().kind === OTokenKind.Lcurly) {
					this.parse_block_stmt(); // The then body

					if (this.consume_if(OTokenKind.KwElse)) {
						if (this.peek().kind === OTokenKind.KwIf) {
							this.parse_if_stmt();
						} else {
							if (this.peek().kind === OTokenKind.Lcurly) {
								this.parse_block_stmt();
							} else {
								this.parse_statement();
							}
						}
					}
				} else if (this.consume_if(OTokenKind.KwThen)) {
					this.parse_expression();
				} else {
					this.parse_statement();

					if (this.consume_if(OTokenKind.KwElse)) {
						this.parse_statement();
					}
				}
			}
		} else {
			this.parse_expression();

			if (this.consume_if(OTokenKind.KwThen)) {
				this.parse_expression();
			}
		}

		this.close(m, OTreeKind.StmtIf);
	}

	private parse_while_stmt() {
		const m = this.open();

		this.expect(OTokenKind.KwWhile);

		if (this.expect(OTokenKind.Lparen)) {
			this.parse_expression(); // The condition

			if (this.expect(OTokenKind.Rparen)) {
				if (this.peek().kind === OTokenKind.Lcurly) {
					this.parse_block_stmt();
				} else {
					this.parse_statement();
				}
			}
		}

		this.close(m, OTreeKind.StmtWhile);
	}

	private parse_for_stmt() {
		const m = this.open();

		this.expect(OTokenKind.KwFor);

		if (this.peek().kind === OTokenKind.Lparen) {
			this.expect(OTokenKind.Lparen);

			this.parse_expression(); // The initializer

			if (this.expect(OTokenKind.Semicolon)) {
				this.parse_expression(); // The condition

				if (this.expect(OTokenKind.Semicolon)) {
					this.parse_expression(); // The increment

					if (this.expect(OTokenKind.Rparen)) {
						if (this.peek().kind === OTokenKind.Lcurly) {
							this.parse_block_stmt();
						} else {
							this.parse_statement();
						}
					}
				}
			}

			this.close(m, OTreeKind.StmtFor);
		} else {
			if (this.peek().kind === OTokenKind.Ident) {
				this.parse_expression();

				if (this.expect(OTokenKind.KwIn)) {
					this.parse_expression();
				}
			}

			this.expect(OTokenKind.KwDo);

			this.parse_declaration(); // The body

			this.close(m, OTreeKind.StmtForIn);
		}
	}

	private parse_jump_stmt() {
		const m = this.open();

		const tok = this.peek();

		this.bump();

		let kind: NodeKind;
		switch (tok.kind) {
			case OTokenKind.KwBreak:
				kind = OTreeKind.StmtBreak;
				break;
			case OTokenKind.KwContinue:
				kind = OTreeKind.StmtContinue;
				break;
			default:
				kind = OTreeKind.StmtReturn;
				break;
		}

		if (
			tok.kind === OTokenKind.KwReturn &&
			!this.nth(0).is_stmt_end() &&
			this.peek().kind !== OTokenKind.Rcurly
		) {
			this.parse_expression();
		}

		this.close(m, kind);
	}

	private parse_pragma() {
		const m = this.open();

		this.expect(OTokenKind.KwPragma);

		if (this.expect(OTokenKind.Ident) && this.expect(OTokenKind.Comma)) {
			this.expect_oneof([OTokenKind.Integer, OTokenKind.String]);
		}

		this.close(m, OTreeKind.DxlPragma);
	}

	private parse_include() {
		const m = this.open();

		this.expect(OTokenKind.KwInclude);

		if (this.peek().kind === OTokenKind.Less) {
			this.expect(OTokenKind.Less);

			while (this.peek().kind !== OTokenKind.Great && !this.eof()) {
				if (
					!this.expect_oneof([
						OTokenKind.Ident,
						OTokenKind.Bslash,
						OTokenKind.Fslash,
						OTokenKind.Period,
					])
				) {
					break;
				}
			}

			this.expect(OTokenKind.Great);
		} else {
			this.expect(OTokenKind.String);
		}

		this.close(m, OTreeKind.DxlInclude);
	}

	private parse_expression() {
		const m = this.open();
		this.expr_bp(BP.LOWEST);
		this.close(m, OTreeKind.StmtExpr);
	}

	private expr_bp(bp: number) {
		let lhs: MarkClosed;

		switch (this.peek().kind) {
			case OTokenKind.KwTrue:
			case OTokenKind.KwFalse:
			case OTokenKind.String:
			case OTokenKind.Real:
			case OTokenKind.Integer: {
				lhs = this.bump_as(OTreeKind.ExprLiteral);
				break;
			}
			case OTokenKind.KwNull: {
				lhs = this.bump_as(OTreeKind.Null);
				break;
			}
			case OTokenKind.Ident:
			case OTokenKind.KwObject:
			case OTokenKind.KwModule: {
				lhs = this.bump_as(OTreeKind.NameRef);
				break;
			}
			case OTokenKind.Bang:
			case OTokenKind.Minus:
			case OTokenKind.Tilde:
			case OTokenKind.MinusMinus:
			case OTokenKind.PlusPlus: {
				const m = this.open();
				this.bump();
				this.expr_bp(BP.Unary);
				lhs = this.close(m, OTreeKind.ExprUnary);
				break;
			}
			case OTokenKind.Lparen:
				lhs = this.parse_grouping_expr();
				break;
			case OTokenKind.Semicolon:
				this.bump();
				return;
			default: {
				this.add_error(
					this.peek(),
					`Expected expression. Got= ${this.peek().kind}`,
				);
				lhs = lhs = this.bump_as(OTreeKind.ErrorNode);
				return;
			}
		}

		const isCallExpr = (lhs: MarkClosed) => {
			if (
				lhs.kind === OTreeKind.NameRef ||
				lhs.kind === OTreeKind.Null ||
				lhs.kind === OTreeKind.ExprGrouping
			) {
				switch (this.peek().kind) {
					case OTokenKind.String:
					case OTokenKind.Integer:
					case OTokenKind.Real:
					case OTokenKind.Ident:
					case OTokenKind.KwModule:
					case OTokenKind.KwNull:
					case OTokenKind.KwTrue:
					case OTokenKind.KwFalse:
						return true;
				}
			}

			return false;
		};

		outer: while (
			bp - 1 < get_precedence(this.peek().kind) ||
			isCallExpr(lhs)
		) {
			let count = 1;
			while (true) {
				let prev_tok: Token;
				if (this.pos - count > 0) {
					prev_tok = this.tokens[this.pos - count].token;
				} else {
					prev_tok = this.tokens[0].token;
				}

				if (prev_tok.is_trivia()) {
					count += 1;
				} else if (prev_tok.is_stmt_end()) {
					break outer;
				} else {
					break;
				}
			}

			if (this.peek().is_stmt_end()) {
				break;
			}

			switch (this.peek().kind) {
				case OTokenKind.PlusPlus:
				case OTokenKind.MinusMinus: {
					//FIXME: special case for function call without parenthesis and unary argument
					if (this.nth(1).kind === OTokenKind.Ident) {
						lhs = this.parse_call_expr(lhs);
					} else {
						const m = this.open_before(lhs);
						this.bump();
						lhs = this.close(m, OTreeKind.ExprUnary);
					}

					break;
				}
				case OTokenKind.Plus:
				case OTokenKind.Minus:
				case OTokenKind.Star:
				case OTokenKind.Fslash:
				case OTokenKind.Percent:
				case OTokenKind.EqualEqual:
				case OTokenKind.BangEqual:
				case OTokenKind.Great:
				case OTokenKind.GreatEqual:
				case OTokenKind.Less:
				case OTokenKind.LessEqual:
				case OTokenKind.Bar:
				case OTokenKind.BarBar:
				case OTokenKind.Ampr:
				case OTokenKind.AmprAmpr:
				case OTokenKind.KwAnd:
				case OTokenKind.KwOr:
					lhs = this.parse_infix_expr(lhs);
					break;
				case OTokenKind.Qmark:
					lhs = this.parse_ternary_expr(lhs);
					break;
				case OTokenKind.Lbracket:
					lhs = this.parse_index_expr(lhs);
					break;
				case OTokenKind.Period:
					lhs = this.parse_obj_expr(lhs);
					break;
				case OTokenKind.MinusGreat:
				case OTokenKind.LessMinus:
					lhs = this.parse_arrow_expr(lhs);
					break;
				case OTokenKind.GreatGreat:
				case OTokenKind.LessLess:
					lhs = this.parse_write_expr(lhs);
					break;
				case OTokenKind.String:
					lhs = this.parse_string_expr(lhs);
					break;
				case OTokenKind.Equal:
				case OTokenKind.PlusEqual:
				case OTokenKind.MinusEqual:
					lhs = this.parse_set_expr(lhs);
					break;
				case OTokenKind.Lparen:
					if (lhs.kind === OTreeKind.NameRef || lhs.kind === OTreeKind.Null) {
						lhs = this.parse_call_expr(lhs);
					} else {
						lhs = this.parse_grouping_expr();
					}
					break;
				default:
					if (lhs.kind === OTreeKind.NameRef || lhs.kind === OTreeKind.Null) {
						lhs = this.parse_call_expr(lhs);
					} else if (
						(lhs.kind === OTreeKind.ExprGrouping ||
							lhs.kind === OTreeKind.ExprLiteral ||
							lhs.kind === OTreeKind.ExprStringConcat ||
							lhs.kind === OTreeKind.ExprCall) &&
						(this.peek().kind === OTokenKind.Ident ||
							this.peek().kind === OTokenKind.Integer ||
							this.peek().kind === OTokenKind.Real)
					) {
						lhs = this.parse_string_expr(lhs);
					} else {
						const m = this.open();
						const item = this.peek_item();
						this.add_error(
							this.peek(),
							`Expr failed at ${item.token.kind} ${item.text}. lhs= ${lhs.kind}`,
						);
						this.bump();
						lhs = this.close(m, OTreeKind.ErrorNode);
					}
			}
		}
	}

	private parse_grouping_expr(): MarkClosed {
		const m = this.open();
		this.expect(OTokenKind.Lparen);

		if (this.peek_item().is_type_specifier()) {
			this.bump_as(OTreeKind.TypeAnnotation);

			this.expr_bp(BP.LOWEST);
			this.expect(OTokenKind.Rparen);
			return this.close(m, OTreeKind.ExprCast);
		} else {
			this.expr_bp(BP.LOWEST);
			this.expect(OTokenKind.Rparen);
			return this.close(m, OTreeKind.ExprGrouping);
		}
	}

	private parse_infix_expr(lhs: MarkClosed): MarkClosed {
		const m = this.open_before(lhs);

		const op = this.nth(0);
		const bp = get_precedence(op.kind);

		let kind: NodeKind;
		switch (op.kind) {
			case OTokenKind.BarBar:
			case OTokenKind.AmprAmpr:
				kind = OTreeKind.ExprLogical;
				break;
			case OTokenKind.EqualEqual:
			case OTokenKind.BangEqual:
			case OTokenKind.Great:
			case OTokenKind.GreatEqual:
			case OTokenKind.Less:
			case OTokenKind.LessEqual:
				kind = OTreeKind.ExprCompare;
				break;
			default:
				kind = OTreeKind.ExprBinary;
				break;
		}

		this.bump();
		this.expr_bp(bp);

		return this.close(m, kind);
	}

	private parse_ternary_expr(lhs: MarkClosed): MarkClosed {
		const m = this.open_before(lhs);

		const op = this.nth(0);
		const bp = get_precedence(op.kind);

		this.bump();
		this.expr_bp(BP.LOWEST);

		if (this.expect(OTokenKind.Colon)) {
			this.expr_bp(bp);
		}

		return this.close(m, OTreeKind.ExprTernary);
	}

	private parse_call_expr(lhs: MarkClosed): MarkClosed {
		const m = this.open_before(lhs);

		if (this.peek_item().is_type_specifier()) {
			this.bump_as(OTreeKind.TypeAnnotation);
			return this.close(m, OTreeKind.ExprCast);
		} else if (this.peek().kind === OTokenKind.Lparen) {
			this.expect(OTokenKind.Lparen);

			if (this.peek().kind !== OTokenKind.Rparen) {
				this.parse_expr_list(OTokenKind.Rparen);
			}

			this.expect(OTokenKind.Rparen);
		} else {
			const m_arg = this.open();

			this.expr_bp(BP.LOWEST);
			this.close(m_arg, OTreeKind.ArgList);
		}

		return this.close(m, OTreeKind.ExprCall);
	}

	private parse_string_expr(lhs: MarkClosed): MarkClosed {
		const m = this.open_before(lhs);

		if (this.peek().kind === OTokenKind.String) {
			const m = this.open();
			this.expect(OTokenKind.String);
			this.close(m, OTreeKind.ExprLiteral);
		} else {
			this.expr_bp(BP.LOWEST);
		}

		return this.close(m, OTreeKind.ExprStringConcat);
	}

	private parse_index_expr(lhs: MarkClosed): MarkClosed {
		const m = this.open_before(lhs);

		this.expect(OTokenKind.Lbracket);
		this.expr_bp(BP.LOWEST);

		if (this.peek().kind === OTokenKind.Colon) {
			this.expect(OTokenKind.Colon);

			if (this.peek().kind !== OTokenKind.Rbracket) {
				this.expr_bp(BP.LOWEST);
			}

			this.expect(OTokenKind.Rbracket);
			return this.close(m, OTreeKind.ExprRange);
		} else {
			this.expect(OTokenKind.Rbracket);
			return this.close(m, OTreeKind.ExprIndex);
		}
	}

	private parse_obj_expr(lhs: MarkClosed): MarkClosed {
		const m = this.open_before(lhs);

		this.expect(OTokenKind.Period);

		if (
			this.peek().kind === OTokenKind.String ||
			this.peek().kind === OTokenKind.Ident ||
			this.peek().kind === OTokenKind.KwObject ||
			this.peek().kind === OTokenKind.KwModule
		) {
			this.bump_as(OTreeKind.ExprLiteral);

			if (this.consume_if(OTokenKind.Equal)) {
				this.expr_bp(BP.LOWEST);
				return this.close(m, OTreeKind.ExprSet);
			}
		}

		return this.close(m, OTreeKind.ExprGet);
	}

	private parse_arrow_expr(lhs: MarkClosed): MarkClosed {
		const m = this.open_before(lhs);

		this.bump();

		if (
			this.peek().kind === OTokenKind.String ||
			this.peek().kind === OTokenKind.KwModule ||
			this.peek().kind === OTokenKind.KwObject
		) {
			this.bump_as(OTreeKind.ExprLiteral);
		} else if (this.peek().kind === OTokenKind.Ident) {
			this.bump_as(OTreeKind.NameRef);
		}

		return this.close(m, OTreeKind.ExprArrow);
	}

	private parse_set_expr(lhs: MarkClosed): MarkClosed {
		const m = this.open_before(lhs);

		const op = this.nth(0);
		const op_kind = op.kind;

		this.bump();
		this.expr_bp(BP.LOWEST);

		let kind: NodeKind;
		switch (op_kind) {
			case OTokenKind.Equal:
			case OTokenKind.PlusEqual:
			case OTokenKind.MinusEqual:
				kind = OTreeKind.ExprAssign;
				break;
			default:
				kind = OTreeKind.ErrorNode;
				break;
		}

		return this.close(m, kind);
	}

	private parse_write_expr(lhs: MarkClosed): MarkClosed {
		const m = this.open_before(lhs);

		this.expect_oneof([OTokenKind.LessLess, OTokenKind.GreatGreat]);

		this.expr_bp(BP.LOWEST);
		return this.close(m, OTreeKind.ExprWrite);
	}

	private parse_expr_list(end_kind: TokenKind): MarkClosed {
		const m = this.open();

		while (this.peek().kind !== end_kind && !this.eof()) {
			if (this.peek_item().is_type_specifier()) {
				this.bump();
			} else {
				if (this.peek().kind === OTokenKind.Ampr) {
					this.bump();
				}
				this.expr_bp(BP.LOWEST);
			}

			if (this.peek().kind === OTokenKind.Comma) {
				this.bump();
			} else {
				break;
			}
		}

		return this.close(m, OTreeKind.ArgList);
	}

	/**
	 * Advances the parser and adds the token the the accumulated nodes if it matches any of the the
	 * given kinds. Adds an error if it does not match
	 */
	private expect_oneof(kinds: TokenKind[]): boolean {
		const peek_tok = this.peek();

		if (kinds.includes(peek_tok.kind)) {
			this.bump();
			return true;
		}

		this.add_error(peek_tok, `Expected= ${kinds}. Got= ${peek_tok.kind}`);

		return false;
	}

	/**
	 * Advances the parser and adds the token the the accumulated nodes if it matches the given kind
	 * Adds an error if it does not match
	 */
	private expect(kind: TokenKind): boolean {
		const peek_tok = this.peek();

		if (peek_tok.kind === kind) {
			this.bump();
			return true;
		}

		this.add_error(peek_tok, `Expected= ${kind}. Got= ${peek_tok.kind}`);

		return false;
	}

	/** Advances the parser and adds the token the the accumulated nodes if it matches the given kind */
	private consume_if(kind: TokenKind): boolean {
		if (this.peek().kind === kind) {
			this.bump();
			return true;
		}

		return false;
	}

	/** Moves the parser to the next valid statement starting token */
	private synchronize(m: MarkOpened) {
		outer: while (!this.eof()) {
			switch (this.peek().kind) {
				case OTokenKind.Semicolon:
				case OTokenKind.KwFor:
				case OTokenKind.KwWhile:
				case OTokenKind.KwReturn:
				case OTokenKind.Eof:
					break outer;
				default:
					this.bump();
			}
		}

		this.close(m, OTreeKind.ErrorNode);
	}

	/** Consumes the next token and wraps it with the given token */
	private bump_as(kind: NodeKind): MarkClosed {
		const m = this.open();
		this.bump();
		return this.close(m, kind);
	}

	/** Consume the next token and adds a Add Token event */
	private bump() {
		this.eat_trivia();

		this.fuel = 256;
		this.pos += 1;

		this.events.push({ event_kind: "ADD_TOKEN" });
	}

	/** Consume the next token and adds a Skip Token event */
	private skip() {
		this.fuel = 256;
		this.pos += 1;
		this.events.push({ event_kind: "SKIP" });
	}

	/** Returns the next non-whitespace token */
	private peek(): Token {
		return this.peek_item().token;
	}

	/** Returns the next non-whitespace token and the token's text */
	private peek_item(): GreenToken {
		this.eat_trivia();
		return this.nth_item(0);
	}

	/** Consumes tokens until a non-whitespace token is found */
	private eat_trivia() {
		while (true) {
			const token = this.nth(0);

			if (token.is_trivia() || token.kind === OTokenKind.End) {
				this.advance();
			} else {
				break;
			}
		}
	}

	/** Consumes the next token without adding an event */
	private advance() {
		this.fuel = 256;
		this.pos += 1;
	}

	/** Reports if the parser is at the end of input */
	private eof(): boolean {
		return this.nth(0).kind === OTokenKind.Eof;
	}

	/** Returns the nth token ahead without consuming it */
	private nth(lookahead: number): Token {
		return this.nth_item(lookahead).token;
	}

	/** Returns the nth token ahead and its text without consuming it */
	private nth_item(lookahead: number): GreenToken {
		if (this.fuel <= 0) {
			const tok_kind = this.tokens[this.pos].token.kind;
			assert.fail(`Parser is stuck: ${tok_kind}`);
		}

		this.fuel -= 1;

		if (this.pos + lookahead >= this.tokens.length) {
			return this.tokens[this.tokens.length - 1];
		} else {
			return this.tokens[this.pos + lookahead];
		}
	}

	/** Adds an error log to the parser */
	private add_error(token: Token, message: string) {
		this.errors.push({
			tok: token,
			msg: `[Line ${token.start_loc.line + 1}] ${message}`,
		});
	}

	/** Create a marker at the parser's current position */
	private open(): MarkOpened {
		const mark: MarkOpened = {
			index: this.events.length,
		};
		this.events.push({ event_kind: "PLACEHOLDER" });
		return mark;
	}

	/** Creates a marker before a closed marker */
	private open_before(m: MarkClosed): MarkOpened {
		const new_m = this.open();

		const event_at_pos = this.events[m.index];
		if (event_at_pos.event_kind === "START_NODE") {
			this.events[m.index] = {
				event_kind: "START_NODE",
				kind: event_at_pos.kind,
				forward_parent: new_m.index - m.index,
			};
		} else {
			assert.fail("Unreachable");
		}

		return new_m;
	}

	/** Completes the marker with the given syntax kind */
	private close(m: MarkOpened, kind: NodeKind): MarkClosed {
		// NOTE: may lead to infinite loop in main parse loop, used to fix have more than 51 left brackets
		// without closing brackets
		this.fuel = 256;

		const event_at_pos = this.events[m.index];
		assert.equal(event_at_pos.event_kind, "PLACEHOLDER");

		this.events[m.index] = {
			event_kind: "START_NODE",
			kind: kind,
			forward_parent: -1,
		};

		this.events.push({ event_kind: "FINISH_NODE" });

		return {
			index: m.index,
			kind: kind,
		};
	}

	public get_errors(): ParseError[] {
		return this.errors;
	}
}

const BP = {
	LOWEST: 1,
	Unary: 14,
};

/** Returns the binding power of the token kind */
function get_precedence(kind: TokenKind) {
	switch (kind) {
		case OTokenKind.Ident:
		case OTokenKind.Integer:
		case OTokenKind.Real:
		case OTokenKind.KwObject:
			return BP.LOWEST;
		case OTokenKind.Equal:
		case OTokenKind.PlusEqual:
		case OTokenKind.MinusEqual:
		case OTokenKind.Qmark:
			return 2;
		case OTokenKind.BarBar:
		case OTokenKind.KwOr:
			return 3;
		case OTokenKind.AmprAmpr:
		case OTokenKind.KwAnd:
			return 4;
		case OTokenKind.Bar:
			return 5;
		case OTokenKind.Ampr:
			return 7;
		case OTokenKind.BangEqual:
		case OTokenKind.EqualEqual:
			return 8;
		case OTokenKind.Great:
		case OTokenKind.GreatEqual:
		case OTokenKind.Less:
		case OTokenKind.LessEqual:
			return 9;
		case OTokenKind.Plus:
		case OTokenKind.Minus:
		case OTokenKind.String:
			return 11;
		case OTokenKind.Star:
		case OTokenKind.Fslash:
		case OTokenKind.Percent:
			return 12;
		case OTokenKind.Bang:
			return BP.Unary;
		case OTokenKind.PlusPlus:
		case OTokenKind.MinusMinus:
		case OTokenKind.Lbracket:
			return 15;
		case OTokenKind.Period:
		case OTokenKind.MinusGreat:
		case OTokenKind.LessMinus:
		case OTokenKind.LessLess:
		case OTokenKind.GreatGreat:
			return 17;
		case OTokenKind.Lparen:
			return 18;
		default:
			return 0;
	}
}
