import express from "express";

import {
  getAllPaymentMethods,
  createPaymentMethod,
  updatePaymentMethod,
  deletePaymentMethod,
} from "../controllers/paymentMethod.controller.js";

import { protect } from "../middleware/auth.middleware.js";
import { adminOnly } from "../middleware/admin.middleware.js";
import upload from "../middleware/uploadPayment.middleware.js";

const router = express.Router();

router.get("/", getAllPaymentMethods);

router.post(
  "/",
  protect,
  adminOnly,
  upload.single("qrImage"),
  createPaymentMethod,
);

router.put(
  "/:id",
  protect,
  adminOnly,
  upload.single("qrImage"),
  updatePaymentMethod,
);

router.delete("/:id", protect, adminOnly, deletePaymentMethod);

export default router;
