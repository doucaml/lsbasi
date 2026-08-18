import { INTEGER, REAL } from "./constants";
import { NodeVisitor } from "./nodeVisitor";

class Symbol {
  constructor(name, type = null) {
    this.name = name;
    this.type = type;
  }
}

class BuiltinTypeSymbol extends Symbol {
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
    this.define(new BuiltinTypeSymbol(INTEGER));
    this.define(new BuiltinTypeSymbol(REAL));
  }

  toString() {
    const s = `Symbols: ${Object.values(this._symbols)}`;
    return s;
  }

  valueOf = this.toString;

  define(symbol) {
    console.log("Define:", symbol);
    this._symbols[symbol.name] = symbol;
  }

  lookup(name) {
    console.log("Lookup:", name);
    const symbol = this._symbols[name];
    return symbol;
  }
}

export class SymbolTableBuilder extends NodeVisitor {
  constructor() {
    super();
    this.symbtab = new SymbolTable();
  }

  visitBlock(node) {
    node.declarations.forEach((declaration) => declaration.accept(this));
    node.compoundStatement.accept(this);
  }

  visitProgram(node) {
    node.block.accept(this);
  }

  visitBinOp(node) {
    node.left.accept(this);
    node.right.accept(this);
  }

  visitNum(node) {}

  visitUnaryPlusOp(node) {
    node.expr.accept(this);
  }

  visitUnaryMinusOp(node) {
    node.expr.accept(this);
  }

  visitCompoundOp(node) {
    node.children.forEach((child) => child.accept(this));
  }

  visitNoOp(node) {}

  visitVarDecla(node) {
    const typeName = node.typeNode.value;
    const typeSymbol = this.symbtab.lookup(typeName);
    const varName = node.varNode.value;
    const varSymbol = new VarSymbol(varName, typeSymbol);
    this.symbtab.define(varSymbol);
  }

  visitAssign(node) {
    const varName = node.left.value;
    const varSymbol = this.symbtab.lookup(varName);

    if (varSymbol === undefined) throw new ReferenceError(varName.valueOf());
    node.right.accept(this);
  }

  visitVar(node) {
    const varName = node.value;
    const varSymbol = this.symbtab.lookup(varName);

    if (varSymbol === undefined) throw new ReferenceError(varName.valueOf());
  }
}
