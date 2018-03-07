import 'reflect-metadata';

export enum FilterType {
  Text = "Text",
  Boolean = "Boolean",
  Date = "Date"
}

export class Item {
  public entityTypeName: string;
  public variableName: string;
  public type: FilterType;
  public placeholderText: string;
}

export class ListingInfo{
  public static filterList: Array<Item> = new Array<Item> ();
  public static displayList: Array<Item> = new Array<Item> ();

  public static getDisplayList(entityTypeName){
    return ListingInfo.displayList.filter(item => item.entityTypeName === entityTypeName);
  }

  public static getFilterList(entityTypeName){
    return ListingInfo.filterList.filter(item => item.entityTypeName === entityTypeName);
  }
}

// Decorators
export function DisplayColumn(target: any, propertyKey: string) {
  let displayItem = new Item();
  let propertyType = Reflect.getMetadata("design:type", target, propertyKey);
  console.log(propertyType.name); //name of the type
  displayItem.entityTypeName = target.constructor.name;
  displayItem.variableName = propertyKey;
  ListingInfo.displayList.push(displayItem);
};

export function SearchFilter(type, placeholderText?: string) {
  return function SearchFilter(target: any, propertyKey: string){
    let filterItem = new Item();
    let propertyType = Reflect.getMetadata("design:type", target, propertyKey);
    console.log(propertyType.name); //name of the type
    filterItem.entityTypeName = target.constructor.name;
    filterItem.variableName = propertyKey;
    filterItem.type = type;
    placeholderText && (filterItem.placeholderText = placeholderText);

    ListingInfo.filterList.push(filterItem);
  }
};