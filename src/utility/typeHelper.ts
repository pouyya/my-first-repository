export class TypeHelper {

    static getTypeName(inputClass) {
        var funcNameRegex = /function (.{1,})\(/;
        var results = (funcNameRegex).exec((<any>inputClass).constructor.toString());
        return (results && results.length > 1) ? results[1] : "";
    }

    static getParentTypeNames(inputClas): Array<string> {
        let classNames = [];
        let obj = Object.getPrototypeOf(inputClas);
        let className: string;

        while ((className = TypeHelper.getTypeName(obj)) !== "Object") {
            classNames.push(className);
            obj = Object.getPrototypeOf(obj);
        }

        return classNames;
    }

    static isNullOrWhitespace(input) {

        if (typeof input === 'undefined' || input == null) return true;

        return input.replace(/\s/g, '').length < 1;
    }

    static toCurrency(price: number): string {
        return `$${price.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
    }

    private static htmlEncodeEntityMap = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': '&quot;',
        "'": '&#39;',
        "/": '&#x2F;'
    };

    private static htmlDecodeEntityMap = {
        "&amp;": "&",
        "&lt;": "<",
        "&gt;": ">",
        '&quot;': '"',
        '&#39;': "'",
        '&#x2F;': "/"
    };

    static encodeHtml(source: string) {
        return String(source).replace(/[&<>"'\/]/g, s => TypeHelper.htmlEncodeEntityMap[s]);
    }

    static decodeHtml(source: string) {
        if (source) {
            for (let token in TypeHelper.htmlDecodeEntityMap) {
                source = source.replace(token ,TypeHelper.htmlDecodeEntityMap[token]);
            }

            return source;
        }
    }
}