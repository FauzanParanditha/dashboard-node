export interface ClientInterface {
  _id: string;
  name: string;
  active: boolean;
  clientId: string;
  notifyUrl: string;
}

interface QrisPaymentInfo {
  nmid?: string;
  rrn?: string;
  tid?: string;
  payer?: string;
  phoneNumber?: string;
  issuerId?: string;
}

interface VirtualAccountPaymentInfo {
  vaCode: string;
}

interface RetailPaymentInfo {
  paymentCode: string;
}

type PaymentType =
  | "QRIS"
  | "SinarmasVA"
  | "MaybankVA"
  | "DanamonVA"
  | "BNCVA"
  | "BCAVA"
  | "INAVA"
  | "BNIVA"
  | "PermataVA"
  | "MuamalatVA"
  | "BSIVA"
  | "BRIVA"
  | "MandiriVA"
  | "CIMBVA"
  | "Indomaret"
  | "Alfamart"
  | "POS";

export interface PaymentPaylabsInterface {
  requestId: string;
  errCode: number;
  merchantId: string;
  paymentType: PaymentType;
  amount: number;
  merchantTradeNo: string;
  platformTradeNo: string;
  createTime: string;
  successTime: string;
  status: string;
  productName: string;
  paymentMethodInfo?:
    | QrisPaymentInfo
    | VirtualAccountPaymentInfo
    | RetailPaymentInfo;
  transFeeRate: string;
  transFeeAmount: string;
  totalTransFee: string;
}

export interface OrderInterface {
  _id?: string;
  orderId?: string;
  clientId?: ClientInterface;
  items?: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
    type: string;
  }>;
  totalAmount?: number;
  payer?: string;
  phoneNumber?: string;
  paymentStatus?: string;
  paymentMethod?: string;
  paymentType?: string;
  paymentExpired?: string;
  paymentId?: string;
  createdAt?: string;
  updateAt?: string;
  paymentPaylabs?: PaymentPaylabsInterface;
}
