import dotenv from "dotenv";
import mongoose from "mongoose";

import connectDB from "../src/config/db.js";
import Rental from "../src/models/Rental.js";
import PaymentMethod from "../src/models/PaymentMethod.js";

dotenv.config();

const codeMap = {
  cash: "CASH",
  "tiền mặt": "CASH",

  bank_transfer: "BANK_TRANSFER",
  "chuyển khoản": "BANK_TRANSFER",
  "chuyển khoản ngân hàng": "BANK_TRANSFER",

  momo: "MOMO",
  "ví momo": "MOMO",

  zalopay: "ZALOPAY",
};

const migratePaymentMethods = async () => {
  try {
    await connectDB();

    const rentals = await Rental.collection.find({}).toArray();

    let updatedCount = 0;
    let skippedCount = 0;

    for (const rental of rentals) {
      if (rental.paymentMethod instanceof mongoose.Types.ObjectId) {
        skippedCount++;
        continue;
      }

      let methodCode = "CASH";

      if (rental.paymentMethod) {
        const oldValue = String(rental.paymentMethod).trim().toLowerCase();

        methodCode = codeMap[oldValue] || "CASH";
      }

      const paymentMethod = await PaymentMethod.findOne({
        code: methodCode,
      });

      if (!paymentMethod) {
        console.log(
          `Không tìm thấy phương thức ${methodCode} cho đơn ${rental._id}`,
        );
        skippedCount++;
        continue;
      }

      await Rental.collection.updateOne(
        { _id: rental._id },
        {
          $set: {
            paymentMethod: paymentMethod._id,
          },
        },
      );

      updatedCount++;

      console.log(`Đã cập nhật đơn ${rental._id} -> ${paymentMethod.name}`);
    }

    console.log("----------------------------");
    console.log(`Đơn đã cập nhật: ${updatedCount}`);
    console.log(`Đơn bỏ qua: ${skippedCount}`);
    console.log("Migration phương thức thanh toán hoàn tất.");

    await mongoose.connection.close();
  } catch (error) {
    console.error("Lỗi migration:", error);
    await mongoose.connection.close();
    process.exitCode = 1;
  }
};

migratePaymentMethods();
