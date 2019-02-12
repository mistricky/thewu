import { HyperScript, h } from "./h";
import { _Element } from "./element";
import { checkTemplateFirstChildExist, checkTemplateText } from "../robust";

type TemplateCreator = (h: HyperScript, $_h: string[]) => _Element;
type NodeAttributes = NodeAttribute[];

interface NodeAttribute {
  name: string;
  value: string;
}

interface ElementNode extends ChildNode {
  data?: string;
  localName?: string;
  attributes?: NodeAttributes;
}

export const enum Node {
  Element = 1,
  Text = 3
}

const TEMPLATE_VARIABLE_REGEX = /(\$_h\[\d+\])/g;
const CACHE = new Map<string, TemplateCreator>();
const TEMPLATE = document.createElement("template");

export function compile(
  statics: TemplateStringsArray,
  ...interpolations: string[]
): _Element {
  let key = statics.join();
  const tpl = CACHE.get(key) || CACHE.set(key, build(statics)).get(key)!;

  return tpl(h, interpolations);
}

function build(statics: TemplateStringsArray): TemplateCreator {
  let str = defineTemplateVariable(statics);

  TEMPLATE.innerHTML = str;

  // check error
  checkTemplateText(TEMPLATE);

  return Function(
    "h",
    "$_h",
    `return ${walk((TEMPLATE.content || TEMPLATE).firstChild)}`
  ) as TemplateCreator;
}

function walk(node: ElementNode | null): string {
  if (
    (node && node.nodeType !== Node.Element && node.nodeType !== Node.Text) ||
    !node
  ) {
    return "null";
  }

  // process text node
  if (node.nodeType === Node.Text && node.data) {
    return field(node.data, ",");
  }

  let tagName = `"${node.localName}"`;

  // Symbol for concat string
  let start = "{";
  let end = "}";

  processAttributes(node, start);

  // process children
  let returnValue = `h(${tagName},${start}${end}`;
  let child = node.firstChild;

  while (child) {
    returnValue += `,${walk(child)}`;
    child = child.nextSibling as ChildNode;
  }

  return `${returnValue})`;
}

function processAttributes(node: ElementNode, start: string): string {
  let startSymbol = start;
  let sub = "";

  for (let attr of node.attributes!) {
    const { name, value } = attr;

    startSymbol += `${sub}"${name.replace(/:(\w)/g, (_, capture: string) =>
      capture.toUpperCase()
    )}":${value ? field(value, "+") : true}`;

    sub = ",";
  }

  return startSymbol;
}

// convert template variable to string
function defineTemplateVariable(statics: TemplateStringsArray): string {
  let result: string[] = [];

  statics.forEach((tpl, index) => {
    if (index !== 0) {
      result.push(`$_h[${--index}]`);
    }

    result.push(tpl);
  });

  return result.join("");
}

function field(value: string, sep: string): string {
  const matches = value.match(TEMPLATE_VARIABLE_REGEX);
  let fieldValue = JSON.stringify(value);

  if (matches != null) {
    if (matches[0] === value) return value;

    // format children
    fieldValue = fieldValue.replace(
      TEMPLATE_VARIABLE_REGEX,
      `"${sep}$1${sep}"`
    );

    if (sep === ",") fieldValue = `[${fieldValue}]`;
  }

  return fieldValue;
}
