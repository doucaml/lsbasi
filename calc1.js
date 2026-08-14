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
    this.currentToken = null;
  }

  isDigit(char) {
    return /[0-9]/.test(char);
  }

  error() {
    throw Error("invalid input");
  }

  get_next_token() {
    if (this.pos > this.text.length - 1) {
      return new Token(EOF, null);
    }

    if (this.isDigit(this.text[this.pos])) {
      const token = new Token(INTEGER, Number(this.text[this.pos]));
      this.pos += 1;
      return token;
    } else if (this.text[this.pos] === "+") {
      const token = new Token(PLUS, "+");
      this.pos += 1;
      return token;
    }

    this.error();
  }

  eat(type) {
    if (this.currentToken?.type === type)
      this.currentToken = this.get_next_token();
  }

  expr() {
    this.currentToken = this.get_next_token();

    const left = this.currentToken;
    this.eat(INTEGER);

    const op = this.currentToken;
    this.eat(PLUS);

    const right = this.currentToken;
    this.eat(INTEGER);

    return left.value + right.value;
  }
}
while (true) {
  const text = prompt("calc >");
  const interpreter = new Interpreter(text);
  const result = interpreter.expr();
  console.log(result);
}
