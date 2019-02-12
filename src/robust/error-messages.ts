export interface Usage {
  error: string;
  right: string;
}

export interface ErrorMessage {
  msg: string;
  code: number;
  usage?: Usage;
}

export interface ErrorMessageMap {
  [index: string]: ErrorMessage;
}

interface ErrorTypes {
  [index: number]: (msg: string) => string;
}

const TYPE_ERROR_PREFIX = "[Flat:Type Error]: ";
const USAGE_ERROR_PREFIX = "[Flat:Usage Error]: ";

const enum ERROR_TYPE {
  TYPE_ERROR = 0,
  USE_ERROR = 1
}

const typeErr = (msg: string) => TYPE_ERROR_PREFIX.concat(msg);
const useErr = (msg: string) => USAGE_ERROR_PREFIX.concat(msg);
const usageMsg = (usage: Usage) =>
  `\n\nUsage:\nError -> ${usage.error}\n\nRight -> ${usage.right}\n\n`;

let errorTypes: ErrorTypes = {
  0: typeErr,
  1: useErr
};

export function getErrorMsg(errorCode: number) {
  let { msg, code, usage }: ErrorMessage = Messages[errorCode];

  return `${errorTypes[code](msg)}\n${usage ? usageMsg(usage) : ""}`;
}

/**
 * Convention：
 * 1xx type error
 * 2xx usage error
 */
export const Messages: ErrorMessageMap = {
  101: {
    msg: "template cannot be a text element.",
    code: ERROR_TYPE.TYPE_ERROR,
    usage: {
      error: `compile\`hello\``,
      right: `compile\`<div>hello</div>\``
    }
  },
  201: {
    msg: "The firstChild of template cannot be undefined",
    code: ERROR_TYPE.USE_ERROR
  }
};
