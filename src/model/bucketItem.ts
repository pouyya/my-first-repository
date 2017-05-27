export class BucketItem {
  _id: string;
  _rev?: string;
  name: string;
  quantity: number;
  discount: number;
  actualPrice: number;
  finalPrice: number;
  notes: string;
}