export function SecurityGuard(roles: string[]): Function {

  return function (target: Function): any {

    Object.defineProperty(target.prototype, "Roles", {
      get: function () {
        return roles;
      },
      enumerable: false,
      configurable: false
    });

    return target;
  };
}