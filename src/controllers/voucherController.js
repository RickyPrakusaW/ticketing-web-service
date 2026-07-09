exports.createVoucher = async (req, res) => {
  return res.status(501).json({
    success: false,
    message: "Endpoint POST /vouchers (Create Voucher) belum diimplementasikan",
    data: null,
  });
};

exports.getVouchers = async (req, res) => {
  return res.status(501).json({
    success: false,
    message: "Endpoint GET /vouchers (Get Vouchers) belum diimplementasikan",
    data: null,
  });
};

exports.getVoucherByCode = async (req, res) => {
  return res.status(501).json({
    success: false,
    message:
      "Endpoint GET /vouchers/:code (Check Voucher Code) belum diimplementasikan",
    data: null,
  });
};

exports.updateVoucher = async (req, res) => {
  return res.status(501).json({
    success: false,
    message:
      "Endpoint PUT /vouchers/:id (Update Voucher) belum diimplementasikan",
    data: null,
  });
};

exports.deleteVoucher = async (req, res) => {
  return res.status(501).json({
    success: false,
    message:
      "Endpoint DELETE /vouchers/:id (Delete Voucher) belum diimplementasikan",
    data: null,
  });
};
