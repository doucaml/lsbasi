const [INTEGER, PLUS, MINUS, MULT, DIV, LPAREN, RPAREN, EOF] = [
  "INTEGER",
  "PLUS",
  "MINUS",
  "MULT",
  "DIV",
  "(",
  ")",
  "EOF",
];

class AST {}

class UnaryOp extends AST {
  constructor(op, expr) {
    super();
    this.token = this.op = op;
    this.expr = expr;
  }

  accept(visitor) {
    return visitor.visitUnaryOp(this);
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

class Token {
  constructor(type, value) {
    this.type = type;
    this.value = value;
  }
}

class Lexer {
  constructor(text) {
    this.text = text;
    this.pos = 0;
    this.currentChar = this.text[this.pos] ?? null;
    this.currentToken = null;
  }

  isDigit(char) {
    return /^\d+$/.test(char);
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

  error() {
    throw Error("Invalid syntax");
  }

  eat(tokenType) {
    if (this.currentToken.type === tokenType)
      this.currentToken = this.lexer.getNextToken();
    else this.error();
  }

  factor() {
    const token = this.currentToken;
    let node = null;

    switch (token.type) {
      case PLUS:
        this.eat(PLUS);
        node = new UnaryOp(token, this.factor());
        break;

      case MINUS:
        this.eat(MINUS);
        node = new UnaryOp(token, this.factor());
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

  parse() {
    return this.expr();
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

  visitUnaryOp(node) {
    switch (node.op.type) {
      case PLUS:
        return +node.expr.accept(this);

      case MINUS:
        return -node.expr.accept(this);
    }
  }
}

class Interpreter {
  constructor(parser) {
    this.parser = parser;
    this.nodeVisitor = new NodeVisitor();
  }

  interpret() {
    const tree = this.parser.parse();
    return tree.accept(this.nodeVisitor);
  }
}

const run = () => {
  while (true) {
    const text = prompt("spi> ");
    const lexer = new Lexer(text);
    const parser = new Parser(lexer);
    const interpreter = new Interpreter(parser);
    const result = interpreter.interpret();

    console.log(result);
  }
};

run();
