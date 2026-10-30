import mongoose from "mongoose";

const carSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    brand: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CarBrand",
      required: true,
    },
    type: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CarType",
      required: true,
    },
    seats: { type: Number, required: true },
    transmission: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Transmission",
      required: true,
    },
    pricePerDay: { type: Number, required: true },
    image: { type: String, required: true },
    description: { type: String, required: true },
    status: {
      type: String,
      enum: ["available", "rented", "maintenance"],
      default: "available",
    },
  },
  { timestamps: true },
);

export default mongoose.model("Car", carSchema);
