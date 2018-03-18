import { PurchasableItem } from './purchasableItem';
import {DisplayColumn, FilterType, SearchFilter} from "../metadata/listingModule";

export class Service extends PurchasableItem {
    @DisplayColumn(1) @SearchFilter(FilterType.Text, 1, 'Search by name')
    public name: string;
    constructor() {
        super();
        this.name = "";
        this.color = "";
        this.image = "";
        this.order = 0;
    }
}
