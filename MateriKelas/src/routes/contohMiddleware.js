const express = require("express");
const {
  adminPage,
  managerPage,
  visitorPage,
  tesApiKey,
  topup,
} = require("../controllers/contohMiddleware");
const { verifyJWT, checkRoles } = require("../middlewares");
const {
  checkApiKey,
  rateLimit,
  logAccess,
  cekQuota,
  kurangiQuota,
} = require("../middlewares/apiKey");
const router = express.Router();

router.get("/admin", [verifyJWT, checkRoles("admin")], adminPage);
router.get(
  "/manager",
  [verifyJWT, checkRoles("admin", "manager")],
  managerPage,
);
router.get(
  "/visitor",
  [verifyJWT, checkRoles("admin", "manager", "visitor")],
  visitorPage,
);
// middleware checkApiKey pasti yang paling pertama, karena nanti akan mengisi siapa yang pakai di request nya (request.yangpakai)
router.get(
  "/tesapikey",
  [checkApiKey, rateLimit, logAccess, cekQuota, kurangiQuota],
  tesApiKey,
);
router.get("/topup", topup);

module.exports = router;
