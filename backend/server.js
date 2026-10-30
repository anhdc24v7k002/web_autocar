import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./src/config/db.js";
import authRoutes from "./src/routes/auth.routes.js";
import carRoutes from "./src/routes/car.routes.js";
import rentalRoutes from "./src/routes/rental.routes.js";
import contactRoutes from "./src/routes/contact.routes.js";
import adminRoutes from "./src/routes/admin.routes.js";
import carBrandRoutes from "./src/routes/carBrand.routes.js";
import carTypeRoutes from "./src/routes/carType.routes.js";
import transmissionRoutes from "./src/routes/transmission.routes.js";
import paymentMethodRoutes from "./src/routes/paymentMethod.routes.js";
import path from "path";

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
app.use("/api/admin", adminRoutes);

app.get("/", (req, res) => {
  res.json({ message: "Welcome to Auto Car API" });
});

app.use("/api/auth", authRoutes);
app.use("/api/cars", carRoutes);
app.use("/api/car-brands", carBrandRoutes);
app.use("/api/car-types", carTypeRoutes);
app.use("/api/transmissions", transmissionRoutes);
app.use("/api/payment-methods", paymentMethodRoutes);
app.use("/api/rentals", rentalRoutes);
app.use("/api/contacts", contactRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`Auto Car backend is running on port ${PORT}`),
);
