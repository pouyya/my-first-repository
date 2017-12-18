export function BarcodeListener(prefix: string, scanDuration: number, length: number) {
  return function (target, key: string, descriptor: PropertyDescriptor): PropertyDescriptor {
    if (descriptor === undefined) {
      descriptor = Object.getOwnPropertyDescriptor(target, key);
    }

    var originalMethod = descriptor.value;

    descriptor.value = function () {
      let inputValue = arguments[0];
      if(typeof inputValue === 'string' && inputValue.length === length) {
        originalMethod.apply(this, [ inputValue ]);
      }
    };

    return descriptor;
  }
}