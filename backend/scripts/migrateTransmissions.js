import dotenv from "dotenv";
import mongoose from "mongoose";

import connectDB from "../src/config/db.js";
import Car from "../src/models/Car.js";
import Transmission from "../src/models/Transmission.js";

dotenv.config();

const escapeRegex = (value) => {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

const migrateTransmissions = async () => {
  try {
    await connectDB();

    const cars = await Car.collection.find({}).toArray();

    let createdCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;

    for (const car of cars) {
      if (!car.transmission) {
        skippedCount++;
        continue;
      }

      if (car.transmission instanceof mongoose.Types.ObjectId) {
        skippedCount++;
        continue;
      }

      const transmissionName = String(car.transmission).trim();

      let transmission = await Transmission.findOne({
        name: {
          $regex: `^${escapeRegex(transmissionName)}$`,
          $options: "i",
        },
      });

      if (!transmission) {
        transmission = await Transmission.create({
          name: transmissionName,
          description: "",
        });

        createdCount++;
      }

      await Car.collection.updateOne(
        { _id: car._id },
        {
          $set: {
            transmission: transmission._id,
          },
        },
      );

      updatedCount++;

      console.log(`Đã cập nhật "${car.name}" -> "${transmission.name}"`);
    }

    console.log("----------------------------");
    console.log(`Hộp số mới tạo: ${createdCount}`);
    console.log(`Xe đã cập nhật: ${updatedCount}`);
    console.log(`Xe bỏ qua: ${skippedCount}`);
    console.log("Migration hộp số hoàn tất.");

    await mongoose.connection.close();
  } catch (error) {
    console.error("Lỗi migration hộp số:", error);
    await mongoose.connection.close();
    process.exitCode = 1;
  }
};

migrateTransmissions();
