const [INTEGER, PLUS, MINUS, MULT, DIV, EOF] = [
  "INTEGER",
  "PLUS",
  "MINUS",
  "MULT",
  "DIV",
  "EOF",
];

class Token {
  constructor(type, value) {
    this.type = type;
    this.value = value;
  }
}

class Interpreter {
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
    throw Error("invalid input");
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

      if (this.currentChar === "+") {
        this.advance();
        return new Token(PLUS, "+");
      }

      if (this.currentChar === "-") {
        this.advance();
        return new Token(MINUS, "-");
      }

      if (this.currentChar === "*") {
        this.advance();
        return new Token(MULT, "*");
      }

      if (this.currentChar === "/") {
        this.advance();
        return new Token(DIV, "/");
      }

      this.error();
    }

    return new Token(EOF, null);
  }

  eat(type) {
    if (this.currentToken?.type === type)
      this.currentToken = this.getNextToken();
    else this.error();
  }

  term() {
    const token = this.currentToken;
    this.eat(INTEGER);

    return token.value;
  }

  expr() {
    this.currentToken = this.getNextToken();
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

  if (!text) continue;

  const interpreter = new Interpreter(text);
  const result = interpreter.expr();
  console.log(result);
}
