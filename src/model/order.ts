import { BaseOrder, OrderStatus } from "./baseOrder";
import {DisplayColumn, FilterType, SearchFilter} from "../metadata/listingModule";

export class Order extends BaseOrder<OrderStatus> {

  @DisplayColumn(1) @SearchFilter(FilterType.Text, 1, 'Search by order number')
  orderNumber: string;
  public cancelledAt?: string;
  public receivedAt?: string;
}