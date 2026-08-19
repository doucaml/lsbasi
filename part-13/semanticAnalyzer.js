import { NodeVisitor } from "./nodeVisitor";
import { BuiltinTypeSymbol, SymbolTable, VarSymbol } from "./symbolTable";

export class SemanticAnalyzer extends NodeVisitor {
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

  visitCompound(node) {
    node.children.forEach((child) => child.accept(this));
  }

  visitNoOp(node) {}

  visitVarDecla(node) {
    const typeName = node.typeNode.value;
    const typeSymbol = this.symbtab.lookup(typeName);

    const varName = node.varNode.value;
    const varSymbol = new VarSymbol(varName, typeSymbol);

    if (this.symbtab.lookup(varName) !== undefined)
      throw new ReferenceError(`Error: Duplicate identifier: ${varName} found`);

    this.symbtab.insert(varSymbol);
  }

  visitVar(node) {
    const varName = node.value;
    const varSymbol = this.symbtab.lookup(varName);

    if (varSymbol === undefined)
      throw new ReferenceError(`Error: Symbol(id) not found: ${varName}`);
  }

  visitAssign(node) {
    node.right.accept(this);
    node.left.accept(this);
  }

  visitBinOp(node) {
    node.left.accept(this);
    node.right.accept(this);
  }
}
