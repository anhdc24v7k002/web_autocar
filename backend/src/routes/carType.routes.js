import express from "express";

import {
  getAllCarTypes,
  createCarType,
  updateCarType,
  deleteCarType,
} from "../controllers/carType.controller.js";

const router = express.Router();

router.get("/", getAllCarTypes);
router.post("/", createCarType);
router.put("/:id", updateCarType);
router.delete("/:id", deleteCarType);

export default router;
