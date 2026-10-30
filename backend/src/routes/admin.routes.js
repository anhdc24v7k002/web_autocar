import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { adminOnly } from "../middleware/admin.middleware.js";

import Car from "../models/Car.js";
import Rental from "../models/Rental.js";
import Contact from "../models/Contact.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";

const router = express.Router();

router.use(protect);
router.use(adminOnly);

// Quản lý xe
router.post("/cars", async (req, res) => {
  const car = await Car.create(req.body);
  res.status(201).json(car);
});

router.put("/cars/:id", async (req, res) => {
  try {
    const {
      name,
      brand,
      type,
      seats,
      transmission,
      pricePerDay,
      image,
      description,
      status,
    } = req.body;

    const car = await Car.findByIdAndUpdate(
      req.params.id,
      {
        name,
        brand,
        type,
        seats: Number(seats),
        transmission,
        pricePerDay: Number(pricePerDay),
        image,
        description,
        status,
      },
      {
        new: true,
        runValidators: true,
      },
    )
      .populate("brand", "name")
      .populate("type", "name")
      .populate("transmission", "name");

    if (!car) {
      return res.status(404).json({
        message: "Không tìm thấy xe.",
      });
    }

    return res.status(200).json({
      message: "Cập nhật xe thành công.",
      data: car,
    });
  } catch (error) {
    console.error("Lỗi cập nhật xe:", error);

    return res.status(400).json({
      message: "Không thể cập nhật xe.",
      error: error.message,
    });
  }
});

router.delete("/cars/:id", async (req, res) => {
  await Car.findByIdAndDelete(req.params.id);
  res.json({ message: "Đã xóa xe." });
});

// Quản lý đơn thuê
router.get("/rentals", async (req, res) => {
  try {
    const rentals = await Rental.find()
      .populate({
        path: "car",
        select: "name image pricePerDay status",
      })
      .populate({
        path: "user",
        select: "fullName email phone",
      })
      .populate({
        path: "paymentMethod",
        select: "code name active",
      })
      .sort({ createdAt: -1 });

    return res.status(200).json(rentals);
  } catch (error) {
    console.error("Lỗi lấy danh sách thuê xe:", error);

    return res.status(500).json({
      message: "Lỗi lấy danh sách thuê xe.",
      error: error.message,
    });
  }
});

router.post("/rentals", async (req, res) => {
  try {
    const rental = await Rental.create({
      user: req.user._id,
      car: req.body.car,
      customerName: req.body.customerName,
      phone: req.body.phone,
      address: req.body.address,
      startDate: req.body.startDate,
      endDate: req.body.endDate,
      totalPrice: Number(req.body.totalPrice),
      paymentMethod: req.body.paymentMethod,
      status: req.body.status || "pending",
    });

    return res.status(201).json(rental);
  } catch (error) {
    console.error("Lỗi thêm đơn thuê:", error);

    return res.status(500).json({
      message: "Lỗi thêm đơn thuê.",
      error: error.message,
    });
  }
});

router.put("/rentals/:id", async (req, res) => {
  const rental = await Rental.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  res.json(rental);
});

router.delete("/rentals/:id", async (req, res) => {
  await Rental.findByIdAndDelete(req.params.id);
  res.json({ message: "Đã xóa đơn thuê." });
});

// Xem liên hệ khách hàng
router.get("/contacts", async (req, res) => {
  const contacts = await Contact.find().sort({ createdAt: -1 });
  res.json(contacts);
});

//quản lý tài khoản khách hàng
router.get("/customers", async (req, res) => {
  const customers = await User.find({ role: "user" })
    .select("-password")
    .sort({ createdAt: -1 });

  res.json(customers);
});

//thêm tk khách hàng
router.post("/customers", async (req, res) => {
  const { fullName, email, phone, password } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    fullName,
    email,
    phone,
    password: hashedPassword,
    role: "user",
  });

  res.status(201).json(user);
});

router.put("/customers/:id", async (req, res) => {
  const { fullName, email, phone } = req.body;

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { fullName, email, phone },
    { new: true },
  ).select("-password");

  res.json(user);
});

//xóa tk khách hàng
router.delete("/customers/:id", async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ message: "Đã xóa tài khoản khách hàng." });
});

router.get("/customers/:id/rentals", async (req, res) => {
  try {
    const rentals = await Rental.find({
      user: req.params.id,
    })
      .populate("car")
      .populate("paymentMethod", "code name active")
      .sort({ createdAt: -1 });

    return res.status(200).json(rentals);
  } catch (error) {
    return res.status(500).json({
      message: "Không thể lấy lịch sử thuê xe.",
      error: error.message,
    });
  }
});

//lấy danh sách liên hệ
router.get("/contacts", async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.json(contacts);
  } catch (error) {
    res.status(500).json({ message: "Lỗi lấy danh sách liên hệ." });
  }
});

//xóa liên hệ
router.delete("/contacts/:id", async (req, res) => {
  try {
    await Contact.findByIdAndDelete(req.params.id);

    res.json({
      message: "Xác nhận đã liên hệ thành công",
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi xác nhận đã liên hệ",
    });
  }
});

export default router;
