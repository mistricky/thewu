import { Node } from "../core/html-compiler";
import { getErrorMsg } from "./error-messages";
import {
  TEMPLATE_CANNOT_BE_TEXT,
  TEMPLATE_FIRST_CHILD_NOT_EXIST
} from "./error-code";

export function checkTemplateText(template: HTMLTemplateElement) {
  let firstChild = template.content.firstChild;

  if ((firstChild && firstChild.nodeType === Node.Text) || !firstChild) {
    throw new Error(getErrorMsg(TEMPLATE_CANNOT_BE_TEXT));
  }
}

export function checkTemplateFirstChildExist(template: HTMLTemplateElement) {
  if (!template.firstChild) {
    throw new Error(getErrorMsg(TEMPLATE_FIRST_CHILD_NOT_EXIST));
  }
}
