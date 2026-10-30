import mongoose from "mongoose";

const transmissionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Tên hộp số không được để trống"],
      trim: true,
      unique: true,
      maxlength: [255, "Tên hộp số không được vượt quá 255 ký tự"],
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

const Transmission = mongoose.model("Transmission", transmissionSchema);

export default Transmission;
