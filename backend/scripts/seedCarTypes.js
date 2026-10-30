import dotenv from "dotenv";
import mongoose from "mongoose";

import connectDB from "../src/config/db.js";
import CarType from "../src/models/CarType.js";

dotenv.config();

const carTypes = [
  {
    name: "Sedan",
    description: "Xe du lịch có khoang hành khách và khoang hành lý riêng.",
  },
  {
    name: "SUV",
    description: "Xe thể thao đa dụng, gầm cao và không gian rộng.",
  },
  {
    name: "Luxury",
    description: "Xe hạng sang có trang bị và tiện nghi cao cấp.",
  },
  {
    name: "Electric",
    description: "Xe sử dụng động cơ điện.",
  },
];

const seedCarTypes = async () => {
  try {
    await connectDB();

    for (const carType of carTypes) {
      await CarType.findOneAndUpdate({ name: carType.name }, carType, {
        upsert: true,
        new: true,
        runValidators: true,
      });

      console.log(`Đã đồng bộ: ${carType.name}`);
    }

    console.log("Seed loại xe hoàn tất.");

    await mongoose.connection.close();
  } catch (error) {
    console.error("Lỗi seed loại xe:", error);

    await mongoose.connection.close();
    process.exitCode = 1;
  }
};

seedCarTypes();
