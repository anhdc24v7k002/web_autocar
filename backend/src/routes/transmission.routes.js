import express from "express";

import {
  getAllTransmissions,
  createTransmission,
  updateTransmission,
  deleteTransmission,
} from "../controllers/transmission.controller.js";

const router = express.Router();

router.get("/", getAllTransmissions);
router.post("/", createTransmission);
router.put("/:id", updateTransmission);
router.delete("/:id", deleteTransmission);

export default router;
