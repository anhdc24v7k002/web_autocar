import express from "express";
import {
  createRental,
  getAllRentals,
  getCarSchedule,
  getMyRentals,
  cancelRental,
} from "../controllers/rental.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();
router.post("/", protect, createRental);
router.get("/my-rentals", protect, getMyRentals);
router.get("/all", getAllRentals);
router.get("/schedule", getCarSchedule);
router.put("/:id/cancel", protect, cancelRental);
export default router;
