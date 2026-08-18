import {
  INTEGER,
  PLUS,
  MINUS,
  MULT,
  DIV,
  LPAREN,
  RPAREN,
  DOT,
  ASSIGN,
  SEMI,
  ID,
  EOF,
  COLON,
  COMMA,
  REAL,
  FLOAT_DIV,
  INTEGER_DIV,
  INTEGER_CONST,
  REAL_CONST,
  PROCEDURE,
} from "./constants";
import { BEGIN, END, PROGRAM, VAR } from "./constants";

import {
  Var,
  Assign,
  BinOp,
  Compound,
  NoOp,
  Num,
  UnaryMinusOp,
  UnaryPlusOp,
  VarDecla,
  Block,
  Type,
  Program,
  ProcedureDecla,
} from "./ASTNodes";

export class Parser {
  constructor(lexer) {
    this.lexer = lexer;
    this.currentToken = this.lexer.getNextToken();
  }

  error(param = null) {
    if (param)
      throw Error(
        `Invalid syntax: ${this.currentToken}, expected type: ${param}`,
      );
    else throw Error(`Invalid syntax: ${this.currentToken}`);
  }

  eat(tokenType) {
    if (this.currentToken.type === tokenType)
      this.currentToken = this.lexer.getNextToken();
    else this.error(tokenType);
  }

  empty() {
    return new NoOp();
  }

  variable() {
    const node = new Var(this.currentToken);
    this.eat(ID);
    return node;
  }

  factor() {
    const token = this.currentToken;
    let node = null;

    switch (token.type) {
      case PLUS:
        this.eat(PLUS);
        node = new UnaryPlusOp(token, this.factor());
        break;

      case MINUS:
        this.eat(MINUS);
        node = new UnaryMinusOp(token, this.factor());
        break;

      case LPAREN:
        this.eat(LPAREN);
        node = this.expr();
        this.eat(RPAREN);
        break;

      case INTEGER_CONST:
        this.eat(INTEGER_CONST);
        node = new Num(token);
        break;

      case REAL_CONST:
        this.eat(REAL_CONST);
        node = new Num(token);
        break;

      default:
        node = this.variable();
        break;
    }

    if (node !== null) return node;
  }

  term() {
    let node = this.factor();

    while (
      [MULT, DIV, INTEGER_DIV, FLOAT_DIV].includes(this.currentToken.type)
    ) {
      let token = this.currentToken;

      switch (token.type) {
        case MULT:
          this.eat(MULT);
          break;

        case INTEGER_DIV:
          this.eat(INTEGER_DIV);
          break;

        case FLOAT_DIV:
          this.eat(FLOAT_DIV);
          break;
      }

      node = new BinOp(node, token, this.factor());
    }

    return node;
  }

  expr() {
    let node = this.term();

    while ([PLUS, MINUS].includes(this.currentToken.type)) {
      const token = this.currentToken;

      if (token.type === PLUS) this.eat(PLUS);
      else if (token.type === MINUS) this.eat(MINUS);

      node = new BinOp(node, token, this.term());
    }

    return node;
  }

  assignmentStatement() {
    const left = this.variable();
    const token = this.currentToken;
    this.eat(ASSIGN);
    const right = this.expr();

    const node = new Assign(left, token, right);
    return node;
  }

  statement() {
    let node = null;

    if (this.currentToken.type === BEGIN) node = this.compoundStatement();
    else if (this.currentToken.type === ID) node = this.assignmentStatement();
    else node = this.empty();

    return node;
  }

  statementList() {
    const node = this.statement();
    const results = [node];

    while (this.currentToken.type === SEMI) {
      this.eat(SEMI);
      results.push(this.statement());
    }

    if (this.currentToken.type === ID) this.error();

    return results;
  }

  compoundStatement() {
    this.eat(BEGIN);
    const nodes = this.statementList();
    this.eat(END);

    const root = new Compound();
    nodes.forEach((node) => root.children.push(node));

    return root;
  }

  variableDeclaration() {
    const varNodes = [new Var(this.currentToken)];
    this.eat(ID);

    while (this.currentToken.type === COMMA) {
      this.eat(COMMA);
      varNodes.push(new Var(this.currentToken));
      this.eat(ID);
    }

    this.eat(COLON);

    const typeNode = this.typeSpec();
    const varDeclarations = varNodes.map(
      (varNode) => new VarDecla(varNode, typeNode),
    );

    return varDeclarations;
  }

  typeSpec() {
    const token = this.currentToken;

    if (this.currentToken.type === INTEGER) this.eat(INTEGER);
    else this.eat(REAL);

    const node = new Type(token);
    return node;
  }

  declarations() {
    let declarations = [];

    if (this.currentToken.type === VAR) {
      this.eat(VAR);

      while (this.currentToken.type === ID) {
        const varDecla = this.variableDeclaration();
        declarations = declarations.concat(varDecla);
        this.eat(SEMI);
      }
    }

    while (this.currentToken.type === PROCEDURE) {
      this.eat(PROCEDURE);

      const procName = this.currentToken.value;
      this.eat(ID);
      this.eat(SEMI);

      const blockNode = this.block();
      const procDecla = new ProcedureDecla(procName, blockNode);

      declarations.push(procDecla);
      this.eat(SEMI);
    }

    return declarations;
  }

  block() {
    const declarationsNodes = this.declarations();

    const compoundStatementNode = this.compoundStatement();
    const node = new Block(declarationsNodes, compoundStatementNode);

    return node;
  }

  program() {
    this.eat(PROGRAM);

    const varNode = this.variable();
    const progName = varNode.value;
    this.eat(SEMI);

    const blockNode = this.block();
    const programNode = new Program(progName, blockNode);
    this.eat(DOT);

    return programNode;
  }

  parse() {
    const node = this.program();
    if (this.currentToken.type !== EOF) this.error();
    return node;
  }
}
