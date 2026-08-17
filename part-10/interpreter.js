import { PLUS, MINUS, MULT, DIV, INTEGER_DIV, FLOAT_DIV } from "./constants";

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

      case FLOAT_DIV:
        return node.left.accept(this) / node.right.accept(this);

      case INTEGER_DIV:
        return Math.floor(node.left.accept(this) / node.right.accept(this));
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

  visitProgram(node) {
    node.block.accept(this);
  }

  visitBlock(node) {
    node.declarations.forEach((declaration) => declaration.accept(this));
    node.compoundStatement.accept(this);
  }

  visitVarDecla(node) {}

  visitType(node) {}
}

export class Interpreter extends NodeVisitor {
  constructor(parser) {
    super();
    this.parser = parser;
  }

  GLOBAL_SCOPE = {};

  interpret() {
    const tree = this.parser.parse();
    return tree.accept(this);
  }
}
