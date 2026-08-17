const [
  INTEGER,
  PLUS,
  MINUS,
  MULT,
  DIV,
  LPAREN,
  RPAREN,
  BEGIN,
  END,
  DOT,
  ASSIGN,
  SEMI,
  ID,
  EOF,
] = [
  "INTEGER",
  "PLUS",
  "MINUS",
  "MULT",
  "DIV",
  "(",
  ")",
  "BEGIN",
  "END",
  "DOT",
  "ASSIGN",
  "SEMI",
  "ID",
  "EOF",
];

class AST {}

class UnaryPlusOp extends AST {
  constructor(op, expr) {
    super();
    this.token = this.op = op;
    this.expr = expr;
  }

  accept(visitor) {
    return visitor.visitUnaryPlusOp(this);
  }
}

class UnaryMinusOp extends AST {
  constructor(op, expr) {
    super();
    this.token = this.op = op;
    this.expr = expr;
  }

  accept(visitor) {
    return visitor.visitUnaryMinusOp(this);
  }
}

class BinOp extends AST {
  constructor(left, op, right) {
    super();
    this.left = left;
    this.token = this.op = op;
    this.right = right;
  }

  accept(visitor) {
    return visitor.visitBinOp(this);
  }
}

class Num extends AST {
  constructor(token) {
    super();
    this.token = token;
    this.value = token.value;
  }

  accept(visitor) {
    return visitor.visitNum(this);
  }
}

class Compound extends AST {
  constructor() {
    super();
    this.children = [];
  }

  accept(visitor) {
    return visitor.visitCompoundOp(this);
  }
}

class Assign extends AST {
  constructor(left, op, right) {
    super();
    this.left = left;
    this.op = op;
    this.right = right;
  }

  accept(visitor) {
    return visitor.visitAssign(this);
  }
}

class Var extends AST {
  constructor(token) {
    super();
    this.token = token;
    this.value = token.value;
  }

  accept(visitor) {
    return visitor.visitVar(this);
  }
}

class NoOp extends AST {
  accept(visitor) {
    return visitor.visitNoOp(this);
  }
}

class Token {
  constructor(type, value) {
    this.type = type;
    this.value = value;
  }
}

export class Lexer {
  constructor(text) {
    this.text = text;
    this.pos = 0;
    this.currentChar = this.text[this.pos] ?? null;
    this.currentToken = null;
  }

  RESERVED_KEYWORDS = {
    BEGIN: new Token(BEGIN, "BEGIN"),
    END: new Token(END, "END"),
  };

  isDigit(char) {
    return /^\d+$/.test(char);
  }

  isAlpha(char) {
    return /^[a-zA-Z0-9]$/.test(char);
  }

  isAlNum(char) {
    return /^[a-zA-Z0-9]$/.test(char);
  }

  isSpace(char) {
    return char.trim() === "";
  }

  error() {
    throw Error("invalid character");
  }

  advance() {
    this.pos += 1;

    if (this.pos > this.text.length - 1) this.currentChar = null;
    else this.currentChar = this.text[this.pos];
  }

  skipWhitespace() {
    while (this.currentChar !== null && this.isSpace(this.currentChar))
      this.advance();
  }

  peek() {
    const peekPos = this.pos + 1;
    if (peekPos > this.text.length - 1) return null;
    else return this.text[peekPos];
  }

  #id() {
    let result = "";

    while (this.currentChar !== null && this.isAlNum(this.currentChar)) {
      result += this.currentChar;
      this.advance();
    }

    const token =
      this.RESERVED_KEYWORDS[result] !== undefined
        ? this.RESERVED_KEYWORDS[result]
        : new Token(ID, result);

    return token;
  }

  integer() {
    let value = "";

    while (this.currentChar !== null && this.isDigit(this.currentChar)) {
      value += this.currentChar;
      this.advance();
    }

    return Number(value);
  }

  getNextToken() {
    while (this.currentChar !== null) {
      if (this.isSpace(this.currentChar)) {
        this.skipWhitespace();
        continue;
      }

      if (this.isDigit(this.currentChar)) {
        return new Token(INTEGER, this.integer());
      }

      if (this.isAlpha(this.currentChar)) return this.#id();

      if (this.currentChar === ":" && this.peek() === "=") {
        this.advance();
        this.advance();
        return new Token(ASSIGN, ":=");
      }

      if (this.currentChar === ";") {
        this.advance();
        return new Token(SEMI, ";");
      }

      if (this.currentChar === ".") {
        this.advance();
        return new Token(DOT, ".");
      }

      let token = null;

      switch (this.currentChar) {
        case "+":
          token = new Token(PLUS, "+");
          break;

        case "-":
          token = new Token(MINUS, "-");
          break;

        case "*":
          token = new Token(MULT, "*");
          break;

        case "/":
          token = new Token(DIV, "/");
          break;

        case "(":
          token = new Token(LPAREN, "(");
          break;

        case ")":
          token = new Token(RPAREN, ")");
          break;
      }

      if (token !== null) {
        this.advance();
        return token;
      }

      this.error();
    }

    return new Token(EOF, null);
  }
}

class Parser {
  constructor(lexer) {
    this.lexer = lexer;
    this.currentToken = this.lexer.getNextToken();
  }

  GLOBAL_SCOPE = {};

  error() {
    throw Error("Invalid syntax");
  }

  eat(tokenType) {
    if (this.currentToken.type === tokenType)
      this.currentToken = this.lexer.getNextToken();
    else this.error();
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

      case INTEGER:
        this.eat(INTEGER);
        node = new Num(token);
        break;

      case LPAREN:
        this.eat(LPAREN);
        node = this.expr();
        this.eat(RPAREN);
        break;

      default:
        node = this.variable();
        break;
    }

    if (node !== null) return node;
  }

  term() {
    let node = this.factor();

    while ([MULT, DIV].includes(this.currentToken.type)) {
      let token = this.currentToken;

      if (token.type === MULT) this.eat(MULT);
      else if (token.type === DIV) this.eat(DIV);

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

  program() {
    const node = this.compoundStatement();
    this.eat(DOT);
    return node;
  }

  parse() {
    const node = this.program();
    if (this.currentToken.type !== EOF) this.error();
    return node;
  }
}

class NodeVisitor {
  visitNum(node) {
    return node.value;
  }

  visitBinOp(node) {
    switch (node.op.type) {
      case PLUS:
        return node.left.accept(this) + node.right.accept(this);

      case MINUS:
        return node.left.accept(this) - node.right.accept(this);

      case MULT:
        return node.left.accept(this) * node.right.accept(this);

      case DIV:
        return node.left.accept(this) / node.right.accept(this);
    }
  }

  visitUnaryPlusOp(node) {
    return +node.expr.accept(this);
  }

  visitUnaryMinusOp(node) {
    return -node.expr.accept(this);
  }

  visitCompoundOp(node) {
    node.children.forEach((child) => {
      child.accept(this);
    });
  }

  visitAssign(node) {
    const varName = node.left.value;
    this.GLOBAL_SCOPE[varName] = node.right.accept(this);
  }

  visitVar(node) {
    const varName = node.value;
    const val = this.GLOBAL_SCOPE[varName];

    if (val === undefined) throw ReferenceError(varName);
    else return val;
  }

  visitNoOp(node) {}
}

class Interpreter extends NodeVisitor {
  constructor(parser) {
    super();
    this.parser = parser;
  }

  GLOBAL_SCOPE = {};

  interpret() {
    const tree = this.parser.parse();
    // console.log(tree);
    return tree.accept(this);
  }
}

const run = () => {
  const text = `
    BEGIN
      BEGIN
        number := 2;
        a := number;
        b := 10 * a + 10 * number / 4;
        c := a - - b
      END;

      x := 11;
    END.
  `;

  const lexer = new Lexer(text);
  const parser = new Parser(lexer);
  const interpreter = new Interpreter(parser);

  const result = interpreter.interpret();
  console.log(interpreter.GLOBAL_SCOPE);
};

run();
