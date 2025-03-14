response = {
  data: {
    success: true,
    qrCode: "MOCK-QRIS:2025011745400000016",
    qrUrl:
      "https://sit-payer.paylabs.co.id/payer-api/qr?4f945bfd41dace9626fb4586ef30980bMOCK-QRIS%3A2025011745400000016",
    paymentExpired: "20250131093933",
    paymentId: "PL-288adc8f48c7ec45",
    storeId: "010454S00001",
    totalAmount: "20141",
    orderId: "6791a4956140fa6f98ea7acf",
  },
};

response = {
  data: {
    success: true,
    partnerServiceId: "  010454",
    customerNo: "20250120203595732591",
    virtualAccountNo: "8780197401241500",
    totalAmount: "10000",
    paymentExpired: "2025-01-25T18:38:16+07:00",
    paymentId: "PL-891564cc0d471e48",
    storeId: "010454S00001",
    orderId: "678def593ba7120a1fb86995",
  },
};

response = {
  data: {
    merchantId: "010454",
    requestId: "425ca98b-27a4-4560-b583-2c2aa795db39",
    errCode: "0",
    paymentType: "QRIS",
    amount: "20141",
    merchantTradeNo: "PL-049cb4fa7c1ba05d",
    createTime: "20250120150044",
    platformTradeNo: "2025012245400000015",
    expiredTime: "20250121150044",
    status: "06",
    qrCode: "MOCK-QRIS:2025012045400000015",
  },
};

response = {
  data: {
    responseCode: "2003100",
    responseMessage: "Successful",
    virtualAccountData: {
      partnerServiceId: "  010454",
      customerNo: "20250122119247985045",
      virtualAccountNo: "8780185449347579",
      trxId: "PL-fcd2370805436db7",
    },
  },
};

response = {
  data: {
    merchantId: "010454",
    requestId: "5d866450-5ec6-4e16-8aba-c41cf4c32369",
    errCode: "0",
    paymentType: "QRIS",
    amount: "20141",
    merchantTradeNo: "PL-bb4af63444e43081",
    createTime: "20250122094250",
    platformTradeNo: "2025012245400000013",
    successTime: "20250122094351",
    expiredTime: "20250123094250",
    status: "02",
    productName: "sample",
    productInfo: [
      {
        id: "671f3ac",
        name: "sample",
        price: 10000,
        type: "sample",
        quantity: 1,
      },
    ],
    transFeeRate: "0.007000",
    transFeeAmount: "10000.00",
    totalTransFee: "10141.00",
    vatFee: "0",
    qrCode: "MOCK-QRIS:2025012245400000013",
    nmid: "123",
    rrn: "11823675773495565816",
  },
};

response = {
  data: {
    responseCode: "2002600",
    responseMessage: "Successful",
    virtualAccountData: {
      partnerServiceId: "  010454",
      customerNo: "20241204134612303703",
      virtualAccountNo: "8780185958557404",
      inquiryRequestId: "199af7e4-7367-4569-8beb-816a9cef45a5",
      paymentRequestId: "199af7e4-7367-4569-8beb-816a9cef45a5",
      paidAmount: { value: "10000.00", currency: "IDR" },
      totalAmount: { value: "10000.00", currency: "IDR" },
      paymentFlagStatus: "07",
    },
    additionalInfo: { paymentType: "MandiriVA" },
  },
};
