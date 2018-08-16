
export interface StaffAttendance {
    days:    Day[];
    warning: null;
}

export interface Day {
    hide:     string;
    dateTime: string;
    date:     string;
    dateMMM:  string;
    dateDMMM: string;
    Employee: Employee[];
}

export interface Employee {
    name:              string;
    storeName:         StoreName;
    attendance:        Attendance;
    attendanceDetails: AttendanceDetail[];
}

export interface Attendance {
    working: string;
    break:   Break;
}

export enum Break {
    Error = "error",
    The0M = "0m",
    The4M = "4m",
}

export interface AttendanceDetail {
    key:   Key;
    value: string;
}

export enum Key {
    BreakEnd = "BreakEnd",
    BreakStart = "BreakStart",
    ClockIn = "ClockIn",
    ClockOut = "ClockOut",
}

export enum StoreName {
    Forestvill = "Forestvill",
    WarringahMall = "Warringah Mall ",
}

// Converts JSON strings to/from your types
// and asserts the results of JSON.parse at runtime
export namespace Convert {
    export function toStaffAttendance(json: string): StaffAttendance {
        return cast(json, r("StaffAttendance"));
    }

    export function staffAttendanceToJson(value: StaffAttendance): string {
        return JSON.stringify(uncast(value, r("StaffAttendance")), null, 2);
    }

    function invalidValue(typ: any, val: any): never {
        throw Error(`Invalid value ${JSON.stringify(val)} for type ${JSON.stringify(typ)}`);
    }

    function jsonToJSProps(typ: any): any {
        if (typ.jsonToJS === undefined) {
            var map: any = {};
            typ.props.forEach((p: any) => map[p.json] = { key: p.js, typ: p.typ });
            typ.jsonToJS = map;
        }
        return typ.jsonToJS;
    }

    function jsToJSONProps(typ: any): any {
        if (typ.jsToJSON === undefined) {
            var map: any = {};
            typ.props.forEach((p: any) => map[p.js] = { key: p.json, typ: p.typ });
            typ.jsToJSON = map;
        }
        return typ.jsToJSON;
    }

    function transform(val: any, typ: any, getProps: any): any {
        function transformPrimitive(typ: string, val: any): any {
            if (typeof typ === typeof val) return val;
            return invalidValue(typ, val);
        }

        function transformUnion(typs: any[], val: any): any {
            // val must validate against one typ in typs
            var l = typs.length;
            for (var i = 0; i < l; i++) {
                var typ = typs[i];
                try {
                    return transform(val, typ, getProps);
                } catch (_) {}
            }
            return invalidValue(typs, val);
        }

        function transformEnum(cases: string[], val: any): any {
            if (cases.indexOf(val) !== -1) return val;
            return invalidValue(cases, val);
        }

        function transformArray(typ: any, val: any): any {
            // val must be an array with no invalid elements
            if (!Array.isArray(val)) return invalidValue("array", val);
            return val.map(el => transform(el, typ, getProps));
        }

        function transformObject(props: { [k: string]: any }, additional: any, val: any): any {
            if (val === null || typeof val !== "object" || Array.isArray(val)) {
                return invalidValue("object", val);
            }
            var result: any = {};
            Object.getOwnPropertyNames(props).forEach(key => {
                const prop = props[key];
                const v = Object.prototype.hasOwnProperty.call(val, key) ? val[key] : undefined;
                result[prop.key] = transform(v, prop.typ, getProps);
            });
            Object.getOwnPropertyNames(val).forEach(key => {
                if (!Object.prototype.hasOwnProperty.call(props, key)) {
                    result[key] = transform(val[key], additional, getProps);
                }
            });
            return result;
        }

        if (typ === "any") return val;
        if (typ === null) {
            if (val === null) return val;
            return invalidValue(typ, val);
        }
        if (typ === false) return invalidValue(typ, val);
        while (typeof typ === "object" && typ.ref !== undefined) {
            typ = typeMap[typ.ref];
        }
        if (Array.isArray(typ)) return transformEnum(typ, val);
        if (typeof typ === "object") {
            return typ.hasOwnProperty("unionMembers") ? transformUnion(typ.unionMembers, val)
                : typ.hasOwnProperty("arrayItems")    ? transformArray(typ.arrayItems, val)
                : typ.hasOwnProperty("props")         ? transformObject(getProps(typ), typ.additional, val)
                : invalidValue(typ, val);
        }
        return transformPrimitive(typ, val);
    }

    function cast<T>(val: any, typ: any): T {
        return transform(val, typ, jsonToJSProps);
    }

    function uncast<T>(val: T, typ: any): any {
        return transform(val, typ, jsToJSONProps);
    }

    function a(typ: any) {
        return { arrayItems: typ };
    }

    function u(...typs: any[]) {
        return { unionMembers: typs };
    }

    function o(props: any[], additional: any) {
        return { props, additional };
    }

    function m(additional: any) {
        return { props: [], additional };
    }

    function r(name: string) {
        return { ref: name };
    }

    const typeMap: any = {
        "StaffAttendance": o([
            { json: "days", js: "days", typ: a(r("Day")) },
            { json: "warning", js: "warning", typ: null },
        ], false),
        "Day": o([
            { json: "hide", js: "hide", typ: "" },
            { json: "dateTime", js: "dateTime", typ: "" },
            { json: "date", js: "date", typ: "" },
            { json: "dateMMM", js: "dateMMM", typ: "" },
            { json: "dateDMMM", js: "dateDMMM", typ: "" },
            { json: "Employee", js: "Employee", typ: a(r("Employee")) },
        ], false),
        "Employee": o([
            { json: "name", js: "name", typ: "" },
            { json: "storeName", js: "storeName", typ: r("StoreName") },
            { json: "attendance", js: "attendance", typ: r("Attendance") },
            { json: "attendanceDetails", js: "attendanceDetails", typ: a(r("AttendanceDetail")) },
        ], false),
        "Attendance": o([
            { json: "working", js: "working", typ: "" },
            { json: "break", js: "break", typ: r("Break") },
        ], false),
        "AttendanceDetail": o([
            { json: "key", js: "key", typ: r("Key") },
            { json: "value", js: "value", typ: "" },
        ], false),
        "Break": [
            "error",
            "0m",
            "4m",
        ],
        "Key": [
            "BreakEnd",
            "BreakStart",
            "ClockIn",
            "ClockOut",
        ],
        "StoreName": [
            "Forestvill",
            "Warringah Mall ",
        ],
    };
}
