type TransactionLimit = {
  min: number;
  max: number;
};

const TRANSACTION_LIMITS: Record<string, TransactionLimit> = {
  POS: { min: 50000, max: 1000000 },
  DANABALANCE: { min: 10000, max: 20000000 },
  OVOBALANCE: { min: 10000, max: 20000000 },
  LINKAJABALANCE: { min: 10000, max: 20000000 },
  SHOPEEBALANCE: { min: 10000, max: 20000000 },
  GOPAYBALANCE: { min: 10000, max: 20000000 },
  Indomaret: { min: 10000, max: 5000000 },
  CreditCard: { min: 10000, max: 100000000 },
  CreditCard_2DSecure: { min: 10000, max: 100000000 },
  CreditCard_6Mos: { min: 10000, max: 100000000 },
  CreditCard_12Mos: { min: 10000, max: 100000000 },
  Indodana: { min: 10000, max: 50000000 },
  Atome: { min: 10000, max: 50000000 },
  Kredivo: { min: 10000, max: 50000000 },
  Alfamart: { min: 10000, max: 2000000 },
  BNIVA: { min: 10000, max: 100000000 },
  BNCVA: { min: 10000, max: 100000000 },
  BTNVA: { min: 10000, max: 100000000 },
  OCBCVA: { min: 10000, max: 100000000 },
  SinarmasVA: { min: 10000, max: 100000000 },
  MandiriVA: { min: 10000, max: 1000000000 },
  INAVA: { min: 10000, max: 100000000 },
  PermataVA: { min: 10000, max: 1000000000 },
  MaybankVA: { min: 10000, max: 100000000 },
  DanamonVA: { min: 10000, max: 100000000 },
  BRIVA: { min: 10000, max: 1000000000 },
  BCAVA: { min: 10000, max: 100000000 },
  MuamalatVA: { min: 10000, max: 100000000 },
  BSIVA: { min: 10000, max: 100000000 },
  CIMBVA: { min: 15000, max: 100000000 },
  QRIS: { min: 1000, max: 10000000 },
  DEFAULT: { min: 10000, max: 1000000000 },
};

export const getTransactionLimit = (paymentType: string) => {
  return TRANSACTION_LIMITS[paymentType] || TRANSACTION_LIMITS.DEFAULT;
};

export const formatRupiah = (amount: number) => {
  return `Rp ${amount.toLocaleString("id-ID")}`;
};

