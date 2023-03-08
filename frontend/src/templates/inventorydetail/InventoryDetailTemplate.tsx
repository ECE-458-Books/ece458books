interface InventoryOperation {
    id: string;
    date: Date;
    lineItems: LineItem[];
    numUniqueBooks: number;
    numTotalBooks: number;
    totalDollars: number;
    isDeletable: boolean;
    vendorId?: string;
    vendorName?: string;
  }