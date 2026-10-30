import dotenv from "dotenv";
import mongoose from "mongoose";

import connectDB from "../src/config/db.js";
import PaymentMethod from "../src/models/PaymentMethod.js";

dotenv.config();

const paymentMethods = [
  {
    code: "CASH",
    name: "Tiền mặt",
    description: "Thanh toán trực tiếp bằng tiền mặt khi nhận xe.",
    qrImage: "",
    active: true,
  },
  {
    code: "BANK_TRANSFER",
    name: "Chuyển khoản ngân hàng",
    description: "Thanh toán bằng hình thức chuyển khoản ngân hàng.",
    qrImage: "",
    active: true,
  },
  {
    code: "MOMO",
    name: "Ví MoMo",
    description: "Thanh toán thông qua ví điện tử MoMo.",
    qrImage: "",
    active: true,
  },
  {
    code: "ZALOPAY",
    name: "ZaloPay",
    description: "Thanh toán thông qua ví điện tử ZaloPay.",
    qrImage: "",
    active: true,
  },
];

const seedPaymentMethods = async () => {
  try {
    await connectDB();

    for (const item of paymentMethods) {
      await PaymentMethod.findOneAndUpdate({ code: item.code }, item, {
        upsert: true,
        new: true,
        runValidators: true,
      });

      console.log(`Đã đồng bộ: ${item.name}`);
    }

    console.log("Seed phương thức thanh toán hoàn tất.");

    await mongoose.connection.close();
  } catch (error) {
    console.error("Lỗi seed phương thức thanh toán:", error);

    await mongoose.connection.close();
    process.exitCode = 1;
  }
};

seedPaymentMethods();
