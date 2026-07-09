// Hotel CRUD
exports.createHotel = async (req, res) => {
  return res.status(501).json({
    success: false,
    message: "Endpoint POST /hotels (Create Hotel) belum diimplementasikan",
    data: null,
  });
};

exports.getHotels = async (req, res) => {
  return res.status(501).json({
    success: false,
    message: "Endpoint GET /hotels (Get Hotels) belum diimplementasikan",
    data: null,
  });
};

exports.getHotelById = async (req, res) => {
  return res.status(501).json({
    success: false,
    message:
      "Endpoint GET /hotels/:id (Get Hotel Detail) belum diimplementasikan",
    data: null,
  });
};

exports.updateHotel = async (req, res) => {
  return res.status(501).json({
    success: false,
    message: "Endpoint PUT /hotels/:id (Update Hotel) belum diimplementasikan",
    data: null,
  });
};

exports.deleteHotel = async (req, res) => {
  return res.status(501).json({
    success: false,
    message:
      "Endpoint DELETE /hotels/:id (Delete Hotel) belum diimplementasikan",
    data: null,
  });
};

// Room Type CRUD (Master #4)
exports.createRoomType = async (req, res) => {
  return res.status(501).json({
    success: false,
    message:
      "Endpoint POST /hotels/:hotelId/rooms (Create Room Type) belum diimplementasikan",
    data: null,
  });
};

exports.getRoomTypes = async (req, res) => {
  return res.status(501).json({
    success: false,
    message:
      "Endpoint GET /hotels/:hotelId/rooms (Get Room Types) belum diimplementasikan",
    data: null,
  });
};

exports.updateRoomType = async (req, res) => {
  return res.status(501).json({
    success: false,
    message:
      "Endpoint PUT /hotels/:hotelId/rooms/:roomId (Update Room Type) belum diimplementasikan",
    data: null,
  });
};

exports.deleteRoomType = async (req, res) => {
  return res.status(501).json({
    success: false,
    message:
      "Endpoint DELETE /hotels/:hotelId/rooms/:roomId (Delete Room Type) belum diimplementasikan",
    data: null,
  });
};
