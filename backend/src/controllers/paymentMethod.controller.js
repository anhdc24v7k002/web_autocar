import mongoose from "mongoose";
import PaymentMethod from "../models/PaymentMethod.js";
import Rental from "../models/Rental.js";

const escapeRegex = (value) => {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

export const getAllPaymentMethods = async (req, res) => {
  try {
    const paymentMethods = await PaymentMethod.find().sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      data: paymentMethods,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Không thể lấy danh sách phương thức thanh toán",
      error: error.message,
    });
  }
};

export const createPaymentMethod = async (req, res) => {
  try {
    const { code, name, description, active } = req.body;

    if (!code?.trim() || !name?.trim()) {
      return res.status(400).json({
        message: "Mã và tên phương thức không được để trống",
      });
    }

    const existed = await PaymentMethod.findOne({
      code: code.trim().toUpperCase(),
    });

    if (existed) {
      return res.status(400).json({
        message: "Mã phương thức thanh toán đã tồn tại",
      });
    }

    const qrImage = req.file
      ? `/uploads/payment-methods/${req.file.filename}`
      : "";

    const paymentMethod = await PaymentMethod.create({
      code: code.trim().toUpperCase(),
      name: name.trim(),
      description: description?.trim() || "",
      qrImage,
      active: active === "true" || active === true,
    });

    return res.status(201).json({
      message: "Thêm phương thức thanh toán thành công",
      data: paymentMethod,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Không thể thêm phương thức thanh toán",
      error: error.message,
    });
  }
};

export const updatePaymentMethod = async (req, res) => {
  try {
    console.log("BODY:", req.body);
    console.log("FILE:", req.file);

    const { code, name, description, active } = req.body;

    if (!code?.trim() || !name?.trim()) {
      return res.status(400).json({
        message: "Mã và tên phương thức không được để trống",
      });
    }

    const paymentMethod = await PaymentMethod.findById(req.params.id);

    if (!paymentMethod) {
      return res.status(404).json({
        message: "Không tìm thấy phương thức thanh toán",
      });
    }

    const duplicatedCode = await PaymentMethod.findOne({
      code: code.trim().toUpperCase(),
      _id: { $ne: req.params.id },
    });

    if (duplicatedCode) {
      return res.status(400).json({
        message: "Mã phương thức thanh toán đã tồn tại",
      });
    }

    paymentMethod.code = code.trim().toUpperCase();
    paymentMethod.name = name.trim();
    paymentMethod.description = description?.trim() || "";
    paymentMethod.active = active === "true" || active === true;

    if (req.file) {
      paymentMethod.qrImage = `/uploads/payment-methods/${req.file.filename}`;
    }

    await paymentMethod.save();

    return res.json({
      message: "Cập nhật phương thức thanh toán thành công",
      data: paymentMethod,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Không thể cập nhật phương thức thanh toán",
      error: error.message,
    });
  }
};

export const deletePaymentMethod = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Mã phương thức thanh toán không hợp lệ",
      });
    }

    const isUsed = await Rental.exists({
      paymentMethod: id,
    });

    if (isUsed) {
      return res.status(400).json({
        success: false,
        message: "Không thể xóa vì phương thức thanh toán đang được sử dụng",
      });
    }

    const paymentMethod = await PaymentMethod.findByIdAndDelete(id);

    if (!paymentMethod) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy phương thức thanh toán",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Xóa phương thức thanh toán thành công",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Không thể xóa phương thức thanh toán",
      error: error.message,
    });
  }
};
