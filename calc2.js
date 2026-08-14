const [INTEGER, PLUS, MINUS, EOF] = ["INTEGER", "PLUS", "MINUS", "EOF"];

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
    this.currentChar = this.text[this.pos];
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

  skipWhitespace() {
    while (this.currentChar !== null && this.isSpace(this.currentChar))
      this.advance();
  }

  advance() {
    this.pos += 1;

    if (this.pos > this.text.length - 1) this.currentChar = null;
    else this.currentChar = this.text[this.pos];
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
        const token = new Token(INTEGER, this.integer());
        return token;
      } else if (this.text[this.pos] === "+") {
        const token = new Token(PLUS, "+");
        this.advance();
        return token;
      } else if (this.text[this.pos] === "-") {
        const token = new Token(MINUS, "-");
        this.advance();
        return token;
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

  expr() {
    this.currentToken = this.getNextToken();

    const left = this.currentToken;
    this.eat(INTEGER);

    const op = this.currentToken;

    if (op.type === PLUS) this.eat(PLUS);
    else this.eat(MINUS);

    const right = this.currentToken;
    this.eat(INTEGER);

    if (op.type === PLUS) return left.value + right.value;
    else return left.value - right.value;
  }
}

while (true) {
  const text = prompt("calc >");
  const interpreter = new Interpreter(text);
  const result = interpreter.expr();
  console.log(result);
}
