export class Business {

    static Barber = { id: "barber", name: "Barber", templateName: "barber" };
    static Coffeeshop = { id: "coffeeshop", name: "Coffee Shop", templateName: "coffeeshop" };
    static General = { id: "", name: "Other", templateName: "other" };

    public id: string;
    public name: string;
    public templateName: string;
}