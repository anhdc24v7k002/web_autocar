import express from "express";

import {
  getAllCarBrands,
  createCarBrand,
  updateCarBrand,
  deleteCarBrand,
} from "../controllers/carBrand.controller.js";

const router = express.Router();

router.get("/", getAllCarBrands);
router.post("/", createCarBrand);
router.put("/:id", updateCarBrand);
router.delete("/:id", deleteCarBrand);

export default router;
