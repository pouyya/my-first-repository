export class GlobalConstants {

  static readonly PAY_BTN: string = 'Pay';
  static readonly RETURN_BTN: string = 'Return';
  static readonly DONE_BTN: string = 'Done';

  static readonly NO_TAX_ID: string = 'no_sales_tax';
  static readonly DEFAULT_TAX_ENTITY = 'SalesTax';

  static readonly NOT_FOUND: string = 'not_found'

  static readonly POS_SESSION_PROPS: string[] = [ '_id', 'name' ];
  static readonly STORE_SESSION_PROPS: string[] = [ '_id', 'name', 'country', 'saleNumberPrefix', 'saleLastNumber' ];

  static readonly DEFAULT_ICON: any =  { name: "icon-barbc-barber-shop-1", type: "svg", noOfPaths: 17 };

  static readonly TIME_LOG_ACTION: any = {
    'clock_in': 'CLOCK IN',
    'clock_out': 'CLOCK_OUT',
    'break_start': 'BREAK START',
    'break_end': 'BREAK END'
  }
}
