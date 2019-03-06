type CharMatrix = Array<Array<MatrixItem>>;

interface MatrixItem {
  value: number;
  operation?: 'replace' | 'add' | 'remove' | null;
  operateValue?: string;
  preItem?: MatrixItem;
}

interface Operation {
  item: MatrixItem;
  value: number;
  type: 'replace' | 'add' | 'remove';
}

let operations = (
  targetStr: string,
  j: number
): { [index: string]: string } => {
  let value = targetStr[j - 1];

  return {
    replace: value,
    add: value,
    remove: value
  };
};

function printOperation(matrix: CharMatrix) {
  // for (let i of matrix) {
  //   for (let o of i) {
  //     process.stdout.write((o.operation || "null") + "  ");
  //   }
  //   console.info();
  // }

  let node = matrix.pop()!.pop()!;
  let preItem = node;

  while (preItem) {
    preItem = preItem.preItem!;
  }
}

export function ReckonEditDistance(originStr: string, targetStr: string): any {
  let originLen = originStr.length;
  let targetLen = targetStr.length;

  let matrix: CharMatrix = new Array(originLen + 1).fill(0).map(() =>
    new Array<MatrixItem>(targetLen + 1).fill({
      value: 0
    })
  );
  let step = 0;

  for (let index of Object.keys(originStr)) {
    matrix[+index + 1][0] = { value: +index + 1 };
  }

  for (let index in Object.keys(targetStr)) {
    matrix[0][+index + 1] = { value: +index + 1 };
  }

  for (let i = 1; i <= originLen; i++) {
    for (let j = 1; j <= targetLen; j++) {
      originStr[i - 1] === targetStr[j - 1] ? (step = 0) : (step = 1);

      let operation = [
        {
          item: matrix[i - 1][j - 1],
          value: matrix[i - 1][j - 1].value + step,
          type: 'replace'
        },
        {
          item: matrix[i - 1][j],
          value: matrix[i - 1][j].value + 1,
          type: 'remove'
        },
        {
          item: matrix[i][j - 1],
          value: matrix[i][j - 1].value + 1,
          type: 'add'
        }
      ]
        .sort((a, b) => a.item.value - b.item.value)
        .shift() as Operation;

      matrix[i][j] = {
        value: operation.value,
        operation:
          operation.type === 'replace'
            ? step === 0
              ? null
              : operation.type
            : operation.type,
        operateValue: operations(targetStr, j)[operation.type],
        preItem: operation.item
      };
    }
  }

  // for (let i of matrix) {
  //   for (let o of i) {
  //     process.stdout.write(o.value.toString());
  //   }
  //   console.info();
  // }

  printOperation(matrix);
}

ReckonEditDistance('abcd', 'dabc');
