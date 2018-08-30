import { Store } from './../../model/store';

export interface InteractableStoreStock {
    storeId: string;
    store: Store; /** Store */
    value: number; /** sum of all stock values */
    supplierId?: string; /** from supplier */
    reorderPoint?: any;
    reorderQty?: any;
}