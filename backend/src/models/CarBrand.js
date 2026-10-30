import mongoose from "mongoose";

const carBrandSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Tên hãng xe không được để trống"],
      trim: true,
      unique: true,
      maxlength: [255, "Tên hãng xe không được vượt quá 255 ký tự"],
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

const CarBrand = mongoose.model("CarBrand", carBrandSchema);

export default CarBrand;
