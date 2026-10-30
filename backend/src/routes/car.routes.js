import express from "express";
import {
  createCar,
  getCarById,
  getCars,
} from "../controllers/car.controller.js";

const router = express.Router();

router.get("/", getCars);
router.get("/:id", getCarById);
router.post("/", createCar);

export default router;
