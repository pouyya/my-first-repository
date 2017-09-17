export function PageModule(moduleTypeFunc: Function) {
  let moduleTypeFuncConstructed = null;
  return function (target: Function): any {

    Object.defineProperty(target.prototype, "Module", {
      get: function () {
        if (!moduleTypeFuncConstructed) {
          moduleTypeFuncConstructed = new (moduleTypeFunc())()
        }
        return moduleTypeFuncConstructed;
      },
      enumerable: false,
      configurable: false
    });

    return target;
  };
};