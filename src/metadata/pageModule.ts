export function PageModule(moduleType: any) {
  return function (target: Function) : any {

        Object.defineProperty(target.prototype, "Module", {
        get: function () {
          if(moduleType) {
            return new moduleType();
          }
          return null;
        },
        enumerable: false,
        configurable: false
    });

    return target;
  };
};