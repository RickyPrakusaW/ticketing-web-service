// Booking Actions
exports.createBooking = async (req, res) => {
  return res.status(501).json({
    success: false,
    message: "Endpoint POST /bookings (Create Booking) belum diimplementasikan",
    data: null,
  });
};

exports.getBookings = async (req, res) => {
  return res.status(501).json({
    success: false,
    message:
      "Endpoint GET /bookings (Get Bookings List) belum diimplementasikan",
    data: null,
  });
};

exports.getBookingById = async (req, res) => {
  return res.status(501).json({
    success: false,
    message:
      "Endpoint GET /bookings/:id (Get Booking Detail) belum diimplementasikan",
    data: null,
  });
};

exports.cancelBooking = async (req, res) => {
  return res.status(501).json({
    success: false,
    message:
      "Endpoint PUT /bookings/:id/cancel (Cancel Booking) belum diimplementasikan",
    data: null,
  });
};

exports.refundBooking = async (req, res) => {
  return res.status(501).json({
    success: false,
    message:
      "Endpoint PUT /bookings/:id/refund (Admin Process Refund) belum diimplementasikan",
    data: null,
  });
};

// Check-in / Check-out (Nilai Tambahan)
exports.checkIn = async (req, res) => {
  return res.status(501).json({
    success: false,
    message:
      "Endpoint PUT /bookings/:id/checkin (Check-In User) belum diimplementasikan",
    data: null,
  });
};

exports.checkOut = async (req, res) => {
  return res.status(501).json({
    success: false,
    message:
      "Endpoint PUT /bookings/:id/checkout (Check-Out User) belum diimplementasikan",
    data: null,
  });
};

// Reviews (Nilai Tambahan)
exports.createReview = async (req, res) => {
  return res.status(501).json({
    success: false,
    message:
      "Endpoint POST /bookings/:bookingId/reviews (Create Review) belum diimplementasikan",
    data: null,
  });
};

exports.getHotelReviews = async (req, res) => {
  return res.status(501).json({
    success: false,
    message:
      "Endpoint GET /hotels/:hotelId/reviews (Get Hotel Reviews) belum diimplementasikan",
    data: null,
  });
};

// Health Check
exports.healthCheck = async (req, res) => {
  return res.status(200).json({
    success: true,
    message: "System is healthy (Health Check)",
    data: {
      uptime: process.uptime(),
      timestamp: new Date(),
    },
  });
};
