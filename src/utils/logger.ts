const enum Tags {
  INPUT = "input",
  OUTPUT = "output"
}

function printLine(tag: string) {
  console.info(`---------${tag}---------`);
}

function printBlock(tag: string, content: unknown[]) {
  printLine(tag);
  console.info(content);
  printLine(tag);
}

export function ipt(...content: unknown[]) {
  printBlock(Tags.INPUT, content);
}

export function out(...content: unknown[]) {
  printBlock(Tags.OUTPUT, content);
}

// curry for print
export function p(tag: string) {
  return (...content: unknown[]) => {
    printBlock(tag, content);
  };
}
