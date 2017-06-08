import { ModuleBase } from "../modules/moduelBase";

export function PageModule<T extends ModuleBase>(getModule: Function) {
  return function (target: Function) : any {

        Object.defineProperty(target.prototype, "Module", {
        get: function () {
            var moduleType =  getModule();
            return new moduleType();
        },
        enumerable: false,
        configurable: false
    });

    return target;
  };
};