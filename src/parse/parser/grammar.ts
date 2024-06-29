import {
	type NodeKind,
	ONodeKind,
	OTokenKind,
	type SyntaxKind,
	type TokenKind,
} from "../syntax/syntax_kind";
import type { MarkClosed, MarkOpened, Parser } from "./parser";

export function parseDeclaration(p: Parser) {
	if (p.atAny([OTokenKind.KwConst, OTokenKind.KwStatic])) {
		p.bumpAs(ONodeKind.WarningNode);
	}

	if (p.peek().isTypeSpecifier()) {
		const m = p.open();

		p.bumpAs(ONodeKind.TypeRef);

		p.consume(OTokenKind.Ampr);

		if (p.at(OTokenKind.Ident)) {
			const m_name = p.bumpAs(ONodeKind.NameRef);

			if (p.at(OTokenKind.Lparen)) {
				return parseFuncDeclaration(p, m);
			} else {
				return parseVarDeclaration(p, m, m_name);
			}
		} else {
			p.addError(`Expected= ${OTokenKind.Ident}. Got= ${p.peek().kind}`);
			return p.synchronize(m);
		}
	}

	parseStatement(p);

	while (p.peek().isStmtEnd()) {
		p.bump();
	}
}

function parseParam(p: Parser) {
	const m = p.open();

	if (p.peek().isTypeSpecifier()) {
		p.bumpAs(ONodeKind.TypeRef);

		p.consume(OTokenKind.Ampr);

		if (p.at(OTokenKind.Ident)) {
			p.bumpAs(ONodeKind.NameRef);

			if (p.at(OTokenKind.Lparen)) {
				return parseFuncDeclaration(p, m);
			} else {
				return parseVarDeclaration(p, m, undefined);
			}
		} else {
			return p.close(m, ONodeKind.StmtFuncDecl);
		}
	} else {
		p.consume(OTokenKind.Ampr);

		if (p.at(OTokenKind.Ident)) {
			p.bumpAs(ONodeKind.NameRef);
			return parseVarDeclaration(p, m, undefined);
		} else {
			p.addError(`Expected= ${OTokenKind.Ident}. Got= ${p.peek().kind}`);
			return p.synchronize(m);
		}
	}
}

function parseFuncDeclaration(p: Parser, m: MarkOpened) {
	if (p.expect(OTokenKind.Lparen) && !p.at(OTokenKind.Rparen)) {
		const m_params = p.open();

		while (true) {
			const m_param = p.open();

			switch (p.peek().kind) {
				case OTokenKind.Comma:
				case OTokenKind.Rparen:
					break;
				default:
					parseParam(p);
					break;
			}

			p.close(m_param, ONodeKind.Param);

			if (!p.consume(OTokenKind.Comma)) {
				break;
			}
		}

		p.close(m_params, ONodeKind.ParamList);
	}

	p.expect(OTokenKind.Rparen);

	if (p.at(OTokenKind.Lcurly)) {
		parseBlockStmt(p);
	}

	p.close(m, ONodeKind.StmtFuncDecl);
}

function parseVarDeclaration(
	p: Parser,
	m: MarkOpened,
	m_name: MarkClosed | undefined,
) {
	if (p.consume(OTokenKind.Equal)) {
		parseExpression(p);
	} else if (p.consume(OTokenKind.Lbracket)) {
		if (!p.consume(OTokenKind.Rbracket)) {
			parseExpression(p);
			p.expect(OTokenKind.Rbracket);
		}

		if (p.consume(OTokenKind.Equal)) {
			if (p.expect(OTokenKind.Lcurly)) {
				parseExprList(p, OTokenKind.Rcurly);

				p.expect(OTokenKind.Rcurly);
			}
		}

		return p.close(m, ONodeKind.StmtArrayDecl);
	}

	if (m_name && p.at(OTokenKind.Comma)) {
		const m_list = p.openBefore(m_name);
		while (p.consume(OTokenKind.Comma)) {
			if (p.at(OTokenKind.Ident)) {
				p.bumpAs(ONodeKind.NameRef);
			}

			if (p.consume(OTokenKind.Equal)) {
				parseExpression(p);
			}
		}
		p.close(m_list, ONodeKind.NameRefList);
	}

	return p.close(m, ONodeKind.StmtVarDecl);
}

function parseExprList(p: Parser, end_kind: TokenKind): MarkClosed {
	const m = p.open();

	while (!p.at(end_kind) && !p.eof()) {
		if (p.peek().isTypeSpecifier()) {
			p.bump();
		} else {
			p.consume(OTokenKind.Ampr);

			parseExpression(p);
		}

		if (!p.consume(OTokenKind.Comma)) {
			break;
		}
	}

	return p.close(m, ONodeKind.ArgList);
}

function parseStatement(p: Parser) {
	switch (p.peek().kind) {
		case OTokenKind.Lcurly:
			parseBlockStmt(p);
			break;
		case OTokenKind.KwIf:
			parseIfStmt(p);
			break;
		case OTokenKind.KwWhile:
			parseWhileStmt(p);
			break;
		case OTokenKind.KwFor:
			parseForStmt(p);
			break;
		case OTokenKind.KwReturn:
		case OTokenKind.KwBreak:
		case OTokenKind.KwContinue:
			parseJumpStmt(p);
			break;
		case OTokenKind.KwPragma:
			parsePragmaStmt(p);
			break;
		case OTokenKind.KwInclude:
			parseIncludeStmt(p);
			break;
		default:
			parseExpression(p);
			break;
	}

	while (p.peek().isStmtEnd()) {
		p.bump();
	}
}

function parseBlockStmt(p: Parser) {
	const m = p.open();

	p.expect(OTokenKind.Lcurly);

	while (!p.at(OTokenKind.Rcurly) && !p.eof()) {
		parseDeclaration(p);
	}

	p.expect(OTokenKind.Rcurly);

	p.close(m, ONodeKind.StmtBlock);
}

function parsePragmaStmt(p: Parser) {
	const m = p.open();

	p.expect(OTokenKind.KwPragma);

	if (p.expect(OTokenKind.Ident) && p.expect(OTokenKind.Comma)) {
		if (p.atAny([OTokenKind.Integer, OTokenKind.String])) {
			p.bump();
		}
	}

	p.close(m, ONodeKind.StmtPragma);
}

function parseIncludeStmt(p: Parser) {
	const m = p.open();

	p.expect(OTokenKind.KwInclude);

	if (p.at(OTokenKind.Less)) {
		p.expect(OTokenKind.Less);

		while (!p.at(OTokenKind.Great) && !p.eof()) {
			if (
				p.atAny([
					OTokenKind.Ident,
					OTokenKind.Bslash,
					OTokenKind.Fslash,
					OTokenKind.Period,
				])
			) {
				p.bump();
			} else {
				break;
			}
		}

		p.expect(OTokenKind.Great);
	} else {
		p.expect(OTokenKind.String);
	}

	p.close(m, ONodeKind.StmtInclude);
}

function parseJumpStmt(p: Parser) {
	const m = p.open();

	const tok = p.peek();

	p.bump();

	let kind: NodeKind;
	switch (tok.kind) {
		case OTokenKind.KwBreak:
			kind = ONodeKind.StmtBreak;
			break;
		case OTokenKind.KwContinue:
			kind = ONodeKind.StmtContinue;
			break;
		default:
			kind = ONodeKind.StmtReturn;
			break;
	}

	if (
		tok.kind === OTokenKind.KwReturn &&
		!p.nth(0).isStmtEnd() &&
		!p.at(OTokenKind.Rcurly) &&
		!p.eof()
	) {
		parseExpression(p);
	}

	p.close(m, kind);
}

function parseIfStmt(p: Parser) {
	const m = p.open();

	p.expect(OTokenKind.KwIf);

	if (p.consume(OTokenKind.Lparen)) {
		parseExpression(p); // The condition

		if (p.expect(OTokenKind.Rparen)) {
			while (p.consume(OTokenKind.End)) {}

			if (p.at(OTokenKind.Lcurly)) {
				parseStatement(p); // The then body

				if (p.consume(OTokenKind.KwElse)) {
					if (p.at(OTokenKind.KwIf)) {
						parseIfStmt(p);
					} else {
						if (p.at(OTokenKind.Lcurly)) {
							parseBlockStmt(p);
						} else {
							parseStatement(p);
						}
					}
				}
			} else if (p.consume(OTokenKind.KwThen)) {
				parseExpression(p);
			} else {
				parseStatement(p);

				if (p.consume(OTokenKind.KwElse)) {
					parseStatement(p);
				}
			}
		}
	} else {
		parseExpression(p);

		if (p.consume(OTokenKind.KwThen)) {
			parseExpression(p);
		}
	}

	p.close(m, ONodeKind.StmtIf);
}

function parseWhileStmt(p: Parser) {
	const m = p.open();

	p.expect(OTokenKind.KwWhile);

	if (p.expect(OTokenKind.Lparen)) {
		parseExpression(p); // The condition

		if (p.expect(OTokenKind.Rparen)) {
			if (p.at(OTokenKind.Lcurly)) {
				parseBlockStmt(p);
			} else {
				parseStatement(p);
			}
		}
	}

	p.close(m, ONodeKind.StmtWhile);
}

function parseForStmt(p: Parser) {
	const m = p.open();

	p.expect(OTokenKind.KwFor);

	if (p.at(OTokenKind.Lparen)) {
		p.expect(OTokenKind.Lparen);

		parseExpression(p); // The initializer

		if (p.consume(OTokenKind.Semicolon)) {
			parseExpression(p); // The condition

			if (p.consume(OTokenKind.Semicolon)) {
				parseExpression(p); // The increment
			}
		}

		if (p.expect(OTokenKind.Rparen)) {
			if (p.at(OTokenKind.Lcurly)) {
				parseBlockStmt(p);
			} else {
				parseStatement(p);
			}
		}

		return p.close(m, ONodeKind.StmtFor);
	} else {
		if (p.at(OTokenKind.Ident)) {
			parseExpression(p);

			if (p.expect(OTokenKind.KwIn)) {
				parseExpression(p);
			}
		}

		if (p.consume(OTokenKind.KwBy)) {
			parseExpression(p);
		}

		p.expect(OTokenKind.KwDo);

		parseDeclaration(p); // The body

		return p.close(m, ONodeKind.StmtForIn);
	}
}

function parseExpression(p: Parser) {
	const m = p.open();
	expr_bp(p, 0);
	p.close(m, ONodeKind.StmtExpr);
}

function expr_bp(p: Parser, min_bp: number) {
	let lhs: MarkClosed;

	switch (p.peek().kind) {
		case OTokenKind.KwTrue:
		case OTokenKind.KwFalse:
		case OTokenKind.String:
		case OTokenKind.Real:
		case OTokenKind.Integer:
			lhs = p.bumpAs(ONodeKind.ExprLiteral);
			break;
		case OTokenKind.KwNull:
			lhs = p.bumpAs(ONodeKind.Null);
			break;
		case OTokenKind.Ident:
		case OTokenKind.KwObject:
		case OTokenKind.KwModule:
			lhs = p.bumpAs(ONodeKind.NameRef);
			break;
		case OTokenKind.Lparen:
			lhs = parseGroupingExpr(p);
			break;
		case OTokenKind.Semicolon:
			p.bump();
			return;
		default: {
			const bp_prefix = prefixBindingPower(p.peek().kind);
			if (bp_prefix) {
				const m = p.open();
				p.bump(); // The operator
				expr_bp(p, bp_prefix);
				lhs = p.close(m, ONodeKind.ExprPrefix);
			} else {
				if (!p.peek().isStmtEnd()) {
					p.addError(`Expected expression start. Got= ${p.peek().kind}`);
					lhs = p.bumpAs(ONodeKind.ErrorNode);
				}
				return;
			}
		}
	}

	outer: while (true) {
		const op = p.peek();

		if (
			lhs.kind === ONodeKind.NameRef ||
			lhs.kind === ONodeKind.Null ||
			lhs.kind === ONodeKind.ExprGrouping
		) {
			switch (p.peek().kind) {
				case OTokenKind.Integer:
				case OTokenKind.Real:
				case OTokenKind.Ident:
				case OTokenKind.KwModule:
				case OTokenKind.KwNull:
				case OTokenKind.KwTrue:
				case OTokenKind.KwFalse:
					lhs = parseCallExpr(p, lhs);
					continue;
			}
		}

		const bp_postfix = postfixBindingPower(op.kind);
		if (bp_postfix) {
			switch (op.kind) {
				case OTokenKind.Lbracket:
					lhs = parseIndexExpr(p, lhs);
					break;
				case OTokenKind.Period:
					lhs = parseObjExpr(p, lhs, bp_postfix);
					break;
				case OTokenKind.MinusGreat:
				case OTokenKind.LessMinus:
					lhs = parseArrowExpr(p, lhs, bp_postfix);
					break;
				case OTokenKind.PlusPlus:
				case OTokenKind.MinusMinus: {
					const m = p.openBefore(lhs);
					p.bump();
					lhs = p.close(m, ONodeKind.ExprPostfix);
					break;
				}
				default:
					if (op.kind === OTokenKind.String) {
						lhs = parseStringExpr(p, lhs, bp_postfix);
					} else if (
						lhs.kind === ONodeKind.NameRef ||
						lhs.kind === ONodeKind.Null
					) {
						lhs = parseCallExpr(p, lhs);
					} else if (op.kind === OTokenKind.Lparen) {
						lhs = parseGroupingExpr(p);
					}
			}

			continue;
		}

		const [lbp, rbp] = infixBindingPower(op.kind);
		if (lbp < min_bp) {
			return;
		}

		switch (op.kind) {
			case OTokenKind.Plus:
			case OTokenKind.Minus:
			case OTokenKind.Star:
			case OTokenKind.Fslash:
			case OTokenKind.Percent:
			case OTokenKind.Ampr:
				lhs = parseInfixExpr(p, lhs, rbp, ONodeKind.ExprBinary);
				break;
			case OTokenKind.EqualEqual:
			case OTokenKind.BangEqual:
				lhs = parseInfixExpr(p, lhs, rbp, ONodeKind.ExprEquality);
				break;
			case OTokenKind.Bar:
			case OTokenKind.Caret:
			case OTokenKind.AmprAmpr:
			case OTokenKind.BarBar:
			case OTokenKind.KwAnd:
			case OTokenKind.KwOr:
				lhs = parseInfixExpr(p, lhs, rbp, ONodeKind.ExprLogical);
				break;
			case OTokenKind.Less:
			case OTokenKind.LessEqual:
			case OTokenKind.Great:
			case OTokenKind.GreatEqual:
				lhs = parseInfixExpr(p, lhs, rbp, ONodeKind.ExprCompare);
				break;
			case OTokenKind.Equal:
			case OTokenKind.PlusEqual:
			case OTokenKind.MinusEqual:
				lhs = parseInfixExpr(p, lhs, rbp, ONodeKind.ExprAssignment);
				break;
			case OTokenKind.Qmark:
				lhs = parseTernaryExpr(p, lhs, rbp);
				break;
			case OTokenKind.Colon:
				lhs = parseRangeExpr(p, lhs, rbp);
				break;
			case OTokenKind.LessLess:
			case OTokenKind.GreatGreat:
				lhs = parseWriteExpr(p, lhs, rbp);
				break;
			default:
				if (
					(lhs.kind === ONodeKind.ExprStringConcat ||
						lhs.kind === ONodeKind.ExprGrouping ||
						lhs.kind === ONodeKind.ExprLiteral ||
						lhs.kind === ONodeKind.ExprCall) &&
					p.atAny([OTokenKind.Ident, OTokenKind.Integer, OTokenKind.Real])
				) {
					lhs = parseStringExpr(p, lhs, rbp);
				}
				break outer;
		}
	}
}

function parseGroupingExpr(p: Parser) {
	const m = p.open();

	p.expect(OTokenKind.Lparen);

	let kind = ONodeKind.ExprGrouping;

	if (p.peek().isTypeSpecifier()) {
		p.bumpAs(ONodeKind.TypeRef);
		kind = ONodeKind.ExprCast;
	}

	expr_bp(p, 0);
	p.expect(OTokenKind.Rparen);

	return p.close(m, kind);
}

function parseCallExpr(p: Parser, lhs: MarkClosed) {
	const m = p.openBefore(lhs);

	if (p.peek().isTypeSpecifier()) {
		p.bumpAs(ONodeKind.TypeRef);
		return p.close(m, ONodeKind.ExprCast);
	}

	const m_arglist = p.open();

	if (p.at(OTokenKind.Lparen)) {
		p.expect(OTokenKind.Lparen);

		while (!p.at(OTokenKind.Rparen) && !p.eof()) {
			const m_arg = p.open();
			parseExpression(p);
			if (!p.at(OTokenKind.Rparen)) {
				p.expect(OTokenKind.Comma);
			}
			p.close(m_arg, ONodeKind.Arg);
		}

		p.expect(OTokenKind.Rparen);
	} else {
		const m_arg = p.open();
		parseExpression(p);
		p.close(m_arg, ONodeKind.Arg);
	}

	p.close(m_arglist, ONodeKind.ArgList);

	return p.close(m, ONodeKind.ExprCall);
}

function parseIndexExpr(p: Parser, lhs: MarkClosed): MarkClosed {
	const m = p.openBefore(lhs);

	p.expect(OTokenKind.Lbracket);
	expr_bp(p, 0);

	if (p.consume(OTokenKind.Colon)) {
		if (!p.at(OTokenKind.Rbracket)) {
			expr_bp(p, 0);
		}

		p.expect(OTokenKind.Rbracket);
		return p.close(m, ONodeKind.ExprIndex);
	}

	p.expect(OTokenKind.Rbracket);

	return p.close(m, ONodeKind.ExprIndex);
}

function parseObjExpr(p: Parser, lhs: MarkClosed, rbp: number): MarkClosed {
	const m = p.openBefore(lhs);
	p.expect(OTokenKind.Period);
	expr_bp(p, rbp);
	return p.close(m, ONodeKind.ExprGet);
}

function parseArrowExpr(p: Parser, lhs: MarkClosed, rbp: number): MarkClosed {
	const m = p.openBefore(lhs);
	p.bump();
	expr_bp(p, rbp);
	return p.close(m, ONodeKind.ExprArrow);
}

function parseStringExpr(p: Parser, lhs: MarkClosed, rbp: number): MarkClosed {
	const m = p.openBefore(lhs);
	expr_bp(p, rbp);
	return p.close(m, ONodeKind.ExprStringConcat);
}

function parseTernaryExpr(p: Parser, lhs: MarkClosed, bp: number): MarkClosed {
	const m = p.openBefore(lhs);

	p.bump();
	expr_bp(p, bp);

	if (p.expect(OTokenKind.Colon)) {
		expr_bp(p, bp);
	}

	return p.close(m, ONodeKind.ExprTernary);
}

function parseRangeExpr(p: Parser, lhs: MarkClosed, bp: number): MarkClosed {
	const m = p.openBefore(lhs);

	p.bump();

	if (!p.at(OTokenKind.Rbracket)) {
		expr_bp(p, bp);
	}

	return p.close(m, ONodeKind.ExprRange);
}

function parseInfixExpr(
	p: Parser,
	lhs: MarkClosed,
	bp: number,
	kind: NodeKind,
): MarkClosed {
	const m = p.openBefore(lhs);
	p.bump();
	expr_bp(p, bp);
	return p.close(m, kind);
}

function parseWriteExpr(p: Parser, lhs: MarkClosed, bp: number): MarkClosed {
	const m = p.openBefore(lhs);
	p.bump();
	expr_bp(p, bp);
	return p.close(m, ONodeKind.ExprWrite);
}

function prefixBindingPower(kind: SyntaxKind): number | undefined {
	switch (kind) {
		case OTokenKind.PlusPlus:
		case OTokenKind.MinusMinus:
		case OTokenKind.Ampr:
		case OTokenKind.Plus:
		case OTokenKind.Minus:
		case OTokenKind.Tilde:
		case OTokenKind.Bang:
		case OTokenKind.KwSizeof:
		case OTokenKind.KwNull:
			return 15;
		default:
			return undefined;
	}
}

function postfixBindingPower(kind: SyntaxKind): number | undefined {
	switch (kind) {
		case OTokenKind.Lbracket:
		case OTokenKind.Lparen:
		case OTokenKind.Period:
		case OTokenKind.MinusGreat:
		case OTokenKind.LessMinus:
		case OTokenKind.PlusPlus:
		case OTokenKind.MinusMinus:
			return 16;
		case OTokenKind.String:
			return 15;
		default:
			return undefined;
	}
}

function infixBindingPower(kind: SyntaxKind): [number, number] {
	switch (kind) {
		case OTokenKind.Star:
		case OTokenKind.Fslash:
		case OTokenKind.Percent:
			return [14, 13];
		case OTokenKind.Plus:
		case OTokenKind.Minus:
			return [13, 12];
		case OTokenKind.Less:
		case OTokenKind.LessEqual:
		case OTokenKind.Great:
		case OTokenKind.GreatEqual:
			return [11, 10];
		case OTokenKind.EqualEqual:
		case OTokenKind.BangEqual:
			return [10, 9];
		case OTokenKind.Ampr:
			return [9, 8];
		case OTokenKind.Caret:
			return [8, 7];
		case OTokenKind.Bar:
			return [7, 6];
		case OTokenKind.AmprAmpr:
		case OTokenKind.KwAnd:
			return [6, 5];
		case OTokenKind.BarBar:
		case OTokenKind.KwOr:
			return [5, 4];
		case OTokenKind.Qmark:
			return [4, 3];
		case OTokenKind.Equal:
		case OTokenKind.StarEqual:
		case OTokenKind.FslashEqual:
		case OTokenKind.PercentEqual:
		case OTokenKind.PlusEqual:
		case OTokenKind.MinusEqual:
		case OTokenKind.LessLessEqual:
		case OTokenKind.GreatGreatEqual:
		case OTokenKind.AmprEqual:
		case OTokenKind.CaretEqual:
		case OTokenKind.BarEqual:
		case OTokenKind.LessLess:
		case OTokenKind.GreatGreat:
			return [3, 2];
		case OTokenKind.Ident:
		case OTokenKind.Colon:
			return [2, 1];
		default: {
			return [-1, 0];
		}
	}
}
