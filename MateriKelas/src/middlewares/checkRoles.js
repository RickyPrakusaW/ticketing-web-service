// ketika kalian butuh manggil middleware dilengkapi dengan parameter
// cara mainnya
// 1. bikin dulu function yang menerima parameter
// 2. di dalamnya baru buat middlewarenya (function (req,res,next))

// panggil middlewarenya dengan cara checkRoles(['admin'])
// variadic parameter
// checkRoles()
// checkRoles('admin')
// checkRoles('admin','manager')
// checkRoles('admin','manager','kaprodi','rektor','dekan','adminbaa')
const checkRoles = (...allowedRoles) => {
  return (req, res, next) => {
    // karena data roles usernya seperti ini admin,manager,visitor
    const roleUsernya = req.yanglogin.roles.split(",");

    // apakah ada salah satu role dari role user (admin,manager,visitor), yang juga ada di dalam allowedRoles
    const bolehMasuk = roleUsernya.some((role) => {
      return allowedRoles.includes(role);
    });

    console.log(bolehMasuk);

    // kalau tidak boleh masuk
    if (!bolehMasuk) {
      return res.status(403).json("Forbidden Role");
    }

    next();
  };
};

module.exports = checkRoles;
