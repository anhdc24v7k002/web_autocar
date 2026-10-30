import dotenv from "dotenv";
import mongoose from "mongoose";

import connectDB from "../src/config/db.js";
import CarBrand from "../src/models/CarBrand.js";

dotenv.config();
const carBrands = [
  {
    name: "Toyota",
    description: "Hãng xe Nhật Bản.",
  },
  {
    name: "Honda",
    description: "Hãng xe Nhật Bản.",
  },
  {
    name: "Ford",
    description: "Hãng xe Mỹ.",
  },
  {
    name: "Hyundai",
    description: "Hãng xe Hàn Quốc.",
  },
  {
    name: "Kia",
    description: "Hãng xe Hàn Quốc.",
  },
  {
    name: "Mazda",
    description: "Hãng xe Nhật Bản.",
  },
  {
    name: "Mercedes-Benz",
    description: "Hãng xe Đức.",
  },
  {
    name: "BMW",
    description: "Hãng xe Đức.",
  },
  {
    name: "Audi",
    description: "Hãng xe Đức.",
  },
  {
    name: "Mitsubishi",
    description: "Hãng xe Nhật Bản.",
  },
  {
    name: "VinFast",
    description: "Hãng xe Việt Nam.",
  },
];

const seedCarBrands = async () => {
  try {
    await connectDB();

    let createdCount = 0;
    let updatedCount = 0;

    for (const brand of carBrands) {
      const existedBrand = await CarBrand.findOne({
        name: {
          $regex: `^${brand.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
          $options: "i",
        },
      });

      if (existedBrand) {
        existedBrand.name = brand.name;
        existedBrand.description = brand.description;

        await existedBrand.save();

        updatedCount++;

        console.log(`Đã cập nhật: ${brand.name}`);
      } else {
        await CarBrand.create(brand);

        createdCount++;

        console.log(`Đã thêm: ${brand.name}`);
      }
    }

    console.log("--------------------------------");
    console.log(`Số hãng mới đã thêm: ${createdCount}`);
    console.log(`Số hãng đã cập nhật: ${updatedCount}`);
    console.log(`Tổng danh sách chuẩn: ${carBrands.length}`);
    console.log("Seed hãng xe hoàn tất.");

    await mongoose.connection.close();
  } catch (error) {
    console.error("Lỗi seed hãng xe:", error);

    await mongoose.connection.close();
    process.exitCode = 1;
  }
};

seedCarBrands();
