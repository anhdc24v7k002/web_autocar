import mongoose from "mongoose";

const paymentMethodSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, "Mã phương thức thanh toán không được để trống"],
      trim: true,
      unique: true,
      uppercase: true,
      maxlength: [50, "Mã không được vượt quá 50 ký tự"],
    },

    name: {
      type: String,
      required: [true, "Tên phương thức thanh toán không được để trống"],
      trim: true,
      unique: true,
      maxlength: [255, "Tên không được vượt quá 255 ký tự"],
    },

    description: {
      type: String,
      trim: true,
      maxlength: [255, "Mô tả không được vượt quá 255 ký tự"],
      default: "",
    },

    qrImage: {
      type: String,
      trim: true,
      default: "",
    },

    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

const PaymentMethod = mongoose.model("PaymentMethod", paymentMethodSchema);

export default PaymentMethod;
