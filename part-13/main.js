import { Lexer } from "./lexer";
import { Parser } from "./parser";
import { SemanticAnalyzer } from "./semanticAnalyzer";

const run = async () => {
  const text = await getFile();
  const lexer = new Lexer(text);
  const parser = new Parser(lexer);
  const tree = parser.parse();

  const semanticAnalyzer = new SemanticAnalyzer();
  tree.accept(semanticAnalyzer);

  console.log(semanticAnalyzer.symbtab.valueOf());
};

const getFile = async () => {
  const file = Bun.file("./part-13/pascal-scripts/SymbTab6.pas");
  const text = await file.text();

  return text;
};

run();
