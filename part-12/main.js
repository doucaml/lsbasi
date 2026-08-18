import { Lexer } from "./lexer";
import { Parser } from "./parser";
import { Interpreter } from "./interpreter";
import { SymbolTableBuilder } from "./symbolTable";

const run = async () => {
  const text = await getFile();
  const lexer = new Lexer(text);
  const parser = new Parser(lexer);
  const tree = parser.parse();

  const symbtabBuilder = new SymbolTableBuilder();
  tree.accept(symbtabBuilder);
  console.log(symbtabBuilder.symbtab);

  const interpreter = new Interpreter(tree);
  interpreter.interpret();
  console.log(interpreter.GLOBAL_MEMORY);
};

const getFile = async () => {
  const file = Bun.file("./part-12/pascal-scripts/part12.pas");
  const text = await file.text();

  return text;
};

run();
