import vm from 'vm';

export class VM {
  computeExpression(expr: string, data: any) {
    let res: any;

    try {
      res = vm.runInNewContext(`res = ${expr}`, data);
    } catch (e) {
      throw new Error(`Unexpected expression: ${expr}`);
    }

    return res;
  }

  findDependencyStates = (code: string, data: any) => {
    const stateNames: string[] = [];

    const retryInVM = (params: vm.Context) => {
      try {
        vm.runInNewContext(code, params);
      } catch (e) {
        const matches = /([^\s]+) is not defined/.exec(e.message);

        // rethrow the error if occur an unexpected error
        if (!matches) {
          throw e;
        }

        const stateName = matches[1];
        const stateVal = data[stateName];

        if (stateVal === undefined) {
          throw new Error(`Cannot find the variable ${stateName}`);
        }

        stateNames.push(stateName);

        retryInVM({ ...params, ...{ [stateName]: stateVal } });
      }
    };

    retryInVM({});

    return stateNames;
  };

  get vm() {
    return vm;
  }
}
