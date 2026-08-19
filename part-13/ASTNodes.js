class AST {}

export class UnaryPlusOp extends AST {
  constructor(op, expr) {
    super();
    this.token = this.op = op;
    this.expr = expr;
  }

  accept(visitor) {
    return visitor.visitUnaryPlusOp(this);
  }
}

export class UnaryMinusOp extends AST {
  constructor(op, expr) {
    super();
    this.token = this.op = op;
    this.expr = expr;
  }

  accept(visitor) {
    return visitor.visitUnaryMinusOp(this);
  }
}

export class BinOp extends AST {
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

export class Num extends AST {
  constructor(token) {
    super();
    this.token = token;
    this.value = token.value;
  }

  accept(visitor) {
    return visitor.visitNum(this);
  }
}

export class Compound extends AST {
  constructor() {
    super();
    this.children = [];
  }

  accept(visitor) {
    return visitor.visitCompound(this);
  }
}

export class Assign extends AST {
  constructor(left, op, right) {
    super();
    this.left = left;
    this.op = op;
    this.right = right;
  }

  accept(visitor) {
    return visitor.visitAssign(this);
  }
}

export class Var extends AST {
  constructor(token) {
    super();
    this.token = token;
    this.value = token.value;
  }

  accept(visitor) {
    return visitor.visitVar(this);
  }
}

export class NoOp extends AST {
  accept(visitor) {
    return visitor.visitNoOp(this);
  }
}

export class Program extends AST {
  constructor(name, block) {
    super();
    this.name = name;
    this.block = block;
  }

  accept(visitor) {
    return visitor.visitProgram(this);
  }
}

export class Block extends AST {
  constructor(declarations, compoundStatement) {
    super();
    this.declarations = declarations;
    this.compoundStatement = compoundStatement;
  }

  accept(visitor) {
    return visitor.visitBlock(this);
  }
}

export class VarDecla extends AST {
  constructor(varNode, typeNode) {
    super();
    this.varNode = varNode;
    this.typeNode = typeNode;
  }

  accept(visitor) {
    return visitor.visitVarDecla(this);
  }
}

export class Type extends AST {
  constructor(token) {
    super();
    this.token = token;
    this.value = token.value;
  }

  accept(visitor) {
    return visitor.visitType(this);
  }
}

export class ProcedureDecla extends AST {
  constructor(procName, blockNode) {
    super();
    this.procName = procName;
    this.blockNode = blockNode;
  }

  accept(visitor) {
    return visitor.visitProcedureDecla(this);
  }
}
