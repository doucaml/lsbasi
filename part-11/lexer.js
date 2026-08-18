import {
  INTEGER,
  PLUS,
  MINUS,
  MULT,
  LPAREN,
  RPAREN,
  DOT,
  ASSIGN,
  SEMI,
  ID,
  EOF,
  COLON,
  COMMA,
  INTEGER_CONST,
  REAL_CONST,
  REAL,
  FLOAT_DIV,
  INTEGER_DIV,
} from "./constants";
import { BEGIN, END, PROGRAM, VAR } from "./constants";

export class Token {
  constructor(type, value) {
    this.type = type;
    this.value = value;
  }

  toString() {
    return `Token [type: ${this.type}] [value: ${this.value}]`;
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
    PROGRAM: new Token(PROGRAM, "PROGRAM"),
    VAR: new Token(VAR, "VAR"),
    DIV: new Token(INTEGER_DIV, "DIV"),
    INTEGER: new Token(INTEGER, "INTEGER"),
    REAL: new Token(REAL, "REAL"),
    BEGIN: new Token(BEGIN, "BEGIN"),
    END: new Token(END, "END"),
  };

  isDigit(char) {
    return /^\d+$/.test(char);
  }

  isAlpha(char) {
    return /^[a-zA-Z0-9]$/.test(char);
  }

  isAlphaNum(char) {
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

  skipComment() {
    while (this.currentChar !== "}") this.advance();
    this.advance();
  }

  peek() {
    const peekPos = this.pos + 1;
    if (peekPos > this.text.length - 1) return null;
    else return this.text[peekPos];
  }

  #id() {
    let result = "";

    while (this.currentChar !== null && this.isAlphaNum(this.currentChar)) {
      result += this.currentChar;
      this.advance();
    }

    const token =
      this.RESERVED_KEYWORDS[result] !== undefined
        ? this.RESERVED_KEYWORDS[result]
        : new Token(ID, result);

    return token;
  }

  number() {
    let result = "";

    while (this.currentChar !== null && this.isDigit(this.currentChar)) {
      result += this.currentChar;
      this.advance();
    }

    let token;

    if (this.currentChar === ".") {
      result += this.currentChar;
      this.advance();

      while (this.currentChar !== null && this.isDigit(this.currentChar)) {
        result += this.currentChar;
        this.advance();
      }

      token = new Token(REAL_CONST, Number(result));
    } else {
      token = new Token(INTEGER_CONST, Number(result));
    }

    return token;
  }

  getNextToken() {
    while (this.currentChar !== null) {
      if (this.isSpace(this.currentChar)) {
        this.skipWhitespace();
        continue;
      }

      if (this.isDigit(this.currentChar)) {
        return this.number();
      }

      if (this.isAlpha(this.currentChar)) return this.#id();

      if (this.currentChar === ":" && this.peek() === "=") {
        this.advance();
        this.advance();
        return new Token(ASSIGN, ":=");
      }

      if (this.currentChar === "{") {
        this.skipComment();
        continue;
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
          token = new Token(FLOAT_DIV, "/");
          break;

        case "(":
          token = new Token(LPAREN, "(");
          break;

        case ")":
          token = new Token(RPAREN, ")");
          break;

        case ";":
          token = new Token(SEMI, ";");
          break;

        case ".":
          token = new Token(DOT, ".");
          break;

        case ":":
          token = new Token(COLON, ":");
          break;

        case ",":
          token = new Token(COMMA, ",");
          break;

        case "/":
          token = new Token(FLOAT_DIV, "/");
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
