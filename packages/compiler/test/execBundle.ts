import vm from 'vm';

export function execBundle(code: string, context: any = {}) {
  if (vm.isContext(context)) {
    return vm.runInContext(code, context);
  }
  return vm.runInNewContext(code, context);
};
