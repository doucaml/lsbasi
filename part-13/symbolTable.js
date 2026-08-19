import { INTEGER, REAL } from "./constants";
import { NodeVisitor } from "./nodeVisitor";

class Symbol {
  constructor(name, type = null) {
    this.name = name;
    this.type = type;
  }
}

export class BuiltinTypeSymbol extends Symbol {
  constructor(name) {
    super(name);
  }

  toString() {
    return this.name;
  }

  valueOf = this.toString;
}

export class VarSymbol extends Symbol {
  constructor(name, type) {
    super(name, type);
  }

  toString() {
    return `${this.name}:${this.type}`;
  }

  valueOf = this.toString;
}

export class SymbolTable {
  constructor() {
    this._symbols = {};
    this.#initBuiltins();
  }

  #initBuiltins() {
    this.insert(new BuiltinTypeSymbol(INTEGER));
    this.insert(new BuiltinTypeSymbol(REAL));
  }

  toString() {
    const symbtabHeader = "Symbol table contents";
    let lines = ["\n", symbtabHeader, "_____________________"];
    const listSymbols = [];

    for (const [key, value] of Object.entries(this._symbols))
      listSymbols.push(`${key}: ${value}`);

    lines = lines.concat(listSymbols);
    lines.push("\n");

    const symb = lines.join("\n");
    return symb;
  }

  valueOf = this.toString;

  insert(symbol) {
    console.log("Insert:", symbol);
    this._symbols[symbol.name] = symbol;
  }

  lookup(name) {
    console.log("Lookup:", name);
    const symbol = this._symbols[name];
    return symbol;
  }
}
