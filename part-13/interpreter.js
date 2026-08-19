import { NodeVisitor } from "./nodeVisitor";

export class Interpreter extends NodeVisitor {
  constructor(tree) {
    super();
    this.tree = tree;
  }

  GLOBAL_MEMORY = {};

  interpret() {
    const tree = this.tree;
    if (tree !== undefined) return tree.accept(this);
  }
}
