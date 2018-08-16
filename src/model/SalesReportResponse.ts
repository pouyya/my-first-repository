
export interface SalesSummaryList {
    reportGenerateDate: string;
    salesCountTotal:    number;
    salesAverage:       number;
    totalExcTax:        number;
    salesSummary:       SalesSummary[];
}

export interface SalesSummary {
    date:          string;
    noOfSales:     number;
    noOfItemsSold: number;
    netAmount:     number;
    taxAmount:     number;
    total:         number;
}

export namespace Convert {
    export function toSalesSummaryList(json: string): SalesSummaryList {
        return cast(json, r("SalesSummaryList"));
    }

    export function salesSummaryListToJson(value: SalesSummaryList): string {
        return JSON.stringify(uncast(value, r("SalesSummaryList")), null, 2);
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
        "SalesSummaryList": o([
            { json: "reportGenerateDate", js: "reportGenerateDate", typ: "" },
            { json: "salesCountTotal", js: "salesCountTotal", typ: 0 },
            { json: "salesAverage", js: "salesAverage", typ: 0 },
            { json: "totalExcTax", js: "totalExcTax", typ: 3.14 },
            { json: "salesSummary", js: "salesSummary", typ: a(r("SalesSummary")) },
        ], false),
        "SalesSummary": o([
            { json: "date", js: "date", typ: "" },
            { json: "noOfSales", js: "noOfSales", typ: 0 },
            { json: "noOfItemsSold", js: "noOfItemsSold", typ: 0 },
            { json: "netAmount", js: "netAmount", typ: 3.14 },
            { json: "taxAmount", js: "taxAmount", typ: 3.14 },
            { json: "total", js: "total", typ: 3.14 },
        ], false),
    };
}
