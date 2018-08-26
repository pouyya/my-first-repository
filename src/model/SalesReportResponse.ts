
export interface SalesSummaryList {
    reportGenerateDate: string;
    salesCountTotal: number;
    salesAverage: number;
    totalExcTax: number;
    salesSummary: SalesSummary[];
}

export interface SalesSummary {
    date: string;
    noOfSales: number;
    noOfItemsSold: number;
    netAmount: number;
    taxAmount: number;
    total: number;
}
