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

export interface Admin {
  _id: string;
  email: string;
}

export interface PaymentMethod {
  _id: string;
  name: string;
  active: boolean;
  image: string;
  category: string;
  adminId: Admin;
  __v: number;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentMethodsResponse {
  success: boolean;
  message: string;
  data: PaymentMethod[];
  pagination: {
    totalRecords: number;
    totalPages: number;
    currentPage: number;
    perPage: number;
    recordsOnPage: number;
  };
}

export interface OrderItem {
  id: string;
  name: string;
  price: string; // Consider changing this to number if you will always handle it as a number
  type: string;
  quantity: number;
}

export interface OrderDetails {
  items: OrderItem[];
  totalAmount: string; // Consider changing this to number for calculations
  phoneNumber: string;
  payer: string;
  paymentMethod: PaymentMethod;
  clientId: string;
  expired: number;
}
export interface PaymentData {
  success: boolean;
  virtualAccountNo?: string;
  partnerServiceId?: string;
  customerNo?: string;
  qrCode?: string;
  qrUrl?: string;
  paymentExpired: string;
  paymentId: string;
  storeId?: string;
  totalAmount: string;
  orderId: string;
}

export interface PaymentDetails {
  isPaymentProcessing: boolean;
  selectedPaymentMethod: string;
  paymentMethods: PaymentMethodsResponse[];
  orderDetails: OrderDetails;
  isnewLink: boolean;
  paymentData: PaymentData;
}

// Define the interface for the first data object
export interface QRISData {
  merchantId: string;
  requestId: string;
  errCode: string;
  paymentType: string;
  amount: string;
  merchantTradeNo: string;
  createTime: string;
  platformTradeNo: string;
  successTime: string;
  expiredTime: string;
  status: string;
  productName: string;
  productInfo: {
    id: string;
    name: string;
    price: number;
    type: string;
    quantity: number;
  }[];
  transFeeRate: string;
  transFeeAmount: string;
  totalTransFee: string;
  vatFee: string;
  qrCode: string;
  nmid: string;
  rrn: string;
}

// Define the interface for the second data object
export interface VirtualAccountData {
  responseCode: string;
  responseMessage: string;
  virtualAccountData: {
    partnerServiceId: string;
    customerNo: string;
    virtualAccountNo: string;
    inquiryRequestId: string;
    paymentRequestId: string;
    paidAmount: {
      value: string;
      currency: string;
    };
    totalAmount: {
      value: string;
      currency: string;
    };
    paymentFlagStatus: string;
  };
  additionalInfo: {
    paymentType: string;
  };
}
