exports.createCategory = async (req, res) => {
  return res.status(501).json({
    success: false,
    message:
      "Endpoint POST /categories (Create Category) belum diimplementasikan",
    data: null,
  });
};

exports.getCategories = async (req, res) => {
  return res.status(501).json({
    success: false,
    message:
      "Endpoint GET /categories (Get Categories) belum diimplementasikan",
    data: null,
  });
};

exports.updateCategory = async (req, res) => {
  return res.status(501).json({
    success: false,
    message:
      "Endpoint PUT /categories/:id (Update Category) belum diimplementasikan",
    data: null,
  });
};

exports.deleteCategory = async (req, res) => {
  return res.status(501).json({
    success: false,
    message:
      "Endpoint DELETE /categories/:id (Delete Category) belum diimplementasikan",
    data: null,
  });
};
