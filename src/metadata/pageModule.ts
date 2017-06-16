export function PageModule(moduleTypeFunc: Function) {
  return function (target: Function) : any {

        Object.defineProperty(target.prototype, "Module", {
        get: function () {
          if(moduleTypeFunc) {
            return new (moduleTypeFunc())();
          }
          return null;
        },
        enumerable: false,
        configurable: false
    });

    return target;
  };
};