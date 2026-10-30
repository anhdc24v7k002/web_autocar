import mongoose from "mongoose";

const carTypeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Tên loại xe không được để trống"],
      trim: true,
      unique: true,
      maxlength: [255, "Tên loại xe không được vượt quá 255 ký tự"],
    },

    description: {
      type: String,
      trim: true,
      maxlength: [255, "Mô tả không được vượt quá 255 ký tự"],
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

const CarType = mongoose.model("CarType", carTypeSchema);

export default CarType;
