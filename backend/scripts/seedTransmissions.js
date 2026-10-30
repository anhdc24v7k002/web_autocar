import dotenv from "dotenv";
import mongoose from "mongoose";

import connectDB from "../src/config/db.js";
import Transmission from "../src/models/Transmission.js";

dotenv.config();

const transmissions = [
  {
    name: "Số tự động",
    description: "Hộp số tự động, thuận tiện khi vận hành.",
  },
  {
    name: "Số sàn",
    description: "Hộp số điều khiển thủ công bằng cần số và chân côn.",
  },
  {
    name: "Xe điện",
    description: "Hệ truyền động dành cho xe sử dụng động cơ điện.",
  },
];

const seedTransmissions = async () => {
  try {
    await connectDB();

    for (const transmission of transmissions) {
      await Transmission.findOneAndUpdate(
        { name: transmission.name },
        transmission,
        {
          upsert: true,
          new: true,
          runValidators: true,
        },
      );

      console.log(`Đã đồng bộ: ${transmission.name}`);
    }

    console.log("Seed hộp số hoàn tất.");

    await mongoose.connection.close();
  } catch (error) {
    console.error("Lỗi seed hộp số:", error);
    await mongoose.connection.close();
    process.exitCode = 1;
  }
};

seedTransmissions();
