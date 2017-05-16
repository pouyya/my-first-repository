export class TypeHelper 
{
    static getTypeName(inputClass) 
    {
        var funcNameRegex = /function (.{1,})\(/;
        var results = (funcNameRegex).exec((<any> inputClass).constructor.toString());
        return (results && results.length > 1) ? results[1] : "";
    }

    static getParentTypeNames(inputClas) : Array<string>
    {
        let classNames = [];
        let obj = Object.getPrototypeOf(inputClas);
        let className: string;

        while ((className = TypeHelper.getTypeName(obj)) !== "Object") {
            classNames.push(className);
            obj = Object.getPrototypeOf(obj);
        }        

        return classNames;
    }
}