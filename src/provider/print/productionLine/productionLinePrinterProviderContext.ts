import { Sale } from "../../../model/sale";

export class DeviceReceiptProviderContext {

    public sale: Sale;
    public invoiceTitle: string;
    public shopName: string;
    public phoneNumber: string;
    public taxFileNumber: string;
    public footerMessage: string;
}