import { Lexer } from "./lexer";
import { Parser } from "./parser";
import { Interpreter } from "./interpreter";

const run = async () => {
  const text = await getFile();
  const lexer = new Lexer(text);
  const parser = new Parser(lexer);
  const interpreter = new Interpreter(parser);

  interpreter.interpret();
  console.log(interpreter.GLOBAL_SCOPE);
};

const getFile = async () => {
  const file = Bun.file("./part-10/part10.pas");
  const text = await file.text();

  return text;
};

run();
