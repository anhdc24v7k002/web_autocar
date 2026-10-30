import dotenv from "dotenv";
import mongoose from "mongoose";

import connectDB from "../src/config/db.js";
import Car from "../src/models/Car.js";
import CarBrand from "../src/models/CarBrand.js";

dotenv.config();

const escapeRegex = (value) => {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

const migrateCarBrands = async () => {
  try {
    await connectDB();

    const cars = await Car.collection.find({}).toArray();

    let createdBrands = 0;
    let updatedCars = 0;
    let skippedCars = 0;

    for (const car of cars) {
      if (!car.brand) {
        console.log(`Bỏ qua xe không có hãng: ${car.name}`);
        skippedCars++;
        continue;
      }

      if (car.brand instanceof mongoose.Types.ObjectId) {
        console.log(`Xe đã có ObjectId: ${car.name}`);
        skippedCars++;
        continue;
      }

      const brandName = String(car.brand).trim();

      if (!brandName) {
        skippedCars++;
        continue;
      }

      let brand = await CarBrand.findOne({
        name: {
          $regex: `^${escapeRegex(brandName)}$`,
          $options: "i",
        },
      });

      if (!brand) {
        brand = await CarBrand.create({
          name: brandName,
          description: "",
        });

        createdBrands++;
        console.log(`Đã tạo hãng: ${brand.name}`);
      }

      await Car.collection.updateOne(
        { _id: car._id },
        {
          $set: {
            brand: brand._id,
          },
        },
      );

      updatedCars++;

      console.log(`Đã cập nhật xe "${car.name}" -> "${brand.name}"`);
    }

    console.log("-----------------------------");
    console.log(`Hãng mới tạo: ${createdBrands}`);
    console.log(`Xe đã cập nhật: ${updatedCars}`);
    console.log(`Xe bỏ qua: ${skippedCars}`);
    console.log("Đồng bộ hoàn tất");

    await mongoose.connection.close();
  } catch (error) {
    console.error("Lỗi migration:", error);
    await mongoose.connection.close();
    process.exitCode = 1;
  }
};

migrateCarBrands();
