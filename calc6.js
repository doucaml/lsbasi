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
    return /[0-9]/.test(char);
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

class Interpreter {
  constructor(lexer) {
    this.lexer = lexer;
    this.currentToken = this.lexer.getNextToken();
  }

  error() {
    throw Error("invalid syntax");
  }

  eat(type) {
    if (this.currentToken?.type === type)
      this.currentToken = this.lexer.getNextToken();
    else this.error();
  }

  term() {
    let result = this.factor();

    while ([MULT, DIV].includes(this.currentToken.type)) {
      const token = this.currentToken;

      if (token.type === MULT) {
        this.eat(MULT);
        result *= this.factor();
      } else if (token.type === DIV) {
        this.eat(DIV);
        result /= this.factor();
      }
    }

    return result;
  }

  factor() {
    const token = this.currentToken;

    switch (token.type) {
      case INTEGER:
        this.eat(INTEGER);
        return token.value;

      case LPAREN:
        this.eat(LPAREN);
        const result = this.expr();
        this.eat(RPAREN);
        return result;
    }

    return token.value;
  }

  expr() {
    let result = this.term();

    while ([PLUS, MINUS].includes(this.currentToken.type)) {
      const token = this.currentToken;

      if (token.type === PLUS) {
        this.eat(PLUS);
        result += this.term();
      } else if (token.type === MINUS) {
        this.eat(MINUS);
        result -= this.term();
      }
    }

    return result;
  }
}

while (true) {
  const text = prompt("calc >");

  const lexer = new Lexer(text);
  const interpreter = new Interpreter(lexer);
  const result = interpreter.expr();
  console.log(result);
}
