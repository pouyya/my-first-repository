export enum DBModeEnum {
    Critical,
    Current
}

export function DBMode(dbMode: DBModeEnum) {
    return function (target: Function): any {

        Object.defineProperty(target.prototype, "DBMode", {
            get: function () {
                return dbMode;
            },
            enumerable: false,
            configurable: false
        });

        return target;
    };
}    