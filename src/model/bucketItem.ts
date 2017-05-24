export class BucketItem {
  _id: string;
  _rev?: string;
  name: string;
  quantity: number;
  discount: number;
  actualPrice: number;
  reducedPrice: number;
  totalPrice: number;
  notes: string;
  inStock: number | boolean;
}