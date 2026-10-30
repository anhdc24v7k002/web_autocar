import dotenv from "dotenv";
import mongoose from "mongoose";

import connectDB from "../src/config/db.js";
import Car from "../src/models/Car.js";
import CarType from "../src/models/CarType.js";

dotenv.config();

const escapeRegex = (value) => {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

const migrateCarTypes = async () => {
  try {
    await connectDB();

    const cars = await Car.collection.find({}).toArray();

    let createdTypes = 0;
    let updatedCars = 0;
    let skippedCars = 0;

    for (const car of cars) {
      if (!car.type) {
        console.log(`Bỏ qua xe không có loại: ${car.name}`);
        skippedCars++;
        continue;
      }

      if (car.type instanceof mongoose.Types.ObjectId) {
        console.log(`Xe đã có type ObjectId: ${car.name}`);
        skippedCars++;
        continue;
      }

      const typeName = String(car.type).trim();

      if (!typeName) {
        skippedCars++;
        continue;
      }

      let carType = await CarType.findOne({
        name: {
          $regex: `^${escapeRegex(typeName)}$`,
          $options: "i",
        },
      });

      if (!carType) {
        carType = await CarType.create({
          name: typeName,
          description: "",
        });

        createdTypes++;
        console.log(`Đã tạo loại xe: ${carType.name}`);
      }

      await Car.collection.updateOne(
        { _id: car._id },
        {
          $set: {
            type: carType._id,
          },
        },
      );

      updatedCars++;

      console.log(`Đã cập nhật xe "${car.name}" -> loại "${carType.name}"`);
    }

    console.log("--------------------------------");
    console.log(`Loại xe mới tạo: ${createdTypes}`);
    console.log(`Xe đã cập nhật: ${updatedCars}`);
    console.log(`Xe bỏ qua: ${skippedCars}`);
    console.log("Migration loại xe hoàn tất.");

    await mongoose.connection.close();
  } catch (error) {
    console.error("Lỗi migration loại xe:", error);

    await mongoose.connection.close();
    process.exitCode = 1;
  }
};

migrateCarTypes();
