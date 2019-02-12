import { HyperScript, h } from "./h";
import { _Element } from "./element";
import { checkTemplateText } from "../robust";
import { typeOf } from "../utils";

type TemplateCreator = (h: HyperScript, $_h: string[]) => _Element;
type NodeAttributes = NodeAttribute[];

interface NodeAttribute {
  name: string;
  value: string;
}

interface ProcessStaticsResult {
  strStatics: string[];
  flatInterpolations: string[];
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
  ...interpolations: (string | string[])[]
): _Element {
  let { strStatics, flatInterpolations } = processStatics(
    statics,
    interpolations
  );

  let key = statics.join();
  const tpl = CACHE.get(key) || CACHE.set(key, build(strStatics)).get(key)!;

  return tpl(h, flatInterpolations);
}

function build(statics: string[]): TemplateCreator {
  let str = defineTemplateVariable(statics);

  TEMPLATE.innerHTML = str.trim();

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

function processStatics(
  statics: TemplateStringsArray,
  interpolations: (string | string[])[]
): ProcessStaticsResult {
  let params = statics.slice();
  let flatInterpolations = interpolations.slice();

  for (let i of Object.keys(statics)) {
    if (typeOf(flatInterpolations[+i]) === "[object Array]") {
      params = params
        .slice(0, +i)
        .concat(
          params
            .slice(+i, +i + 2)
            .join((flatInterpolations[+i] as string[]).join("").trim()),
          params.slice(+i + 2)
        );

      flatInterpolations.splice(+i, 1);
    }
  }

  return {
    strStatics: params,
    flatInterpolations: flatInterpolations as string[]
  };
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
function defineTemplateVariable(statics: string[]): string {
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
  }

  return fieldValue;
}
