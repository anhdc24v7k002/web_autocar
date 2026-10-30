import mongoose from "mongoose";
import Transmission from "../models/Transmission.js";
import Car from "../models/Car.js";

const escapeRegex = (value) => {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

export const getAllTransmissions = async (req, res) => {
  try {
    const transmissions = await Transmission.find().sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      data: transmissions,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Không thể lấy danh sách hộp số",
      error: error.message,
    });
  }
};

export const createTransmission = async (req, res) => {
  try {
    const name = req.body.name?.trim();
    const description = req.body.description?.trim() || "";

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Tên hộp số không được để trống",
      });
    }

    const existed = await Transmission.findOne({
      name: {
        $regex: `^${escapeRegex(name)}$`,
        $options: "i",
      },
    });

    if (existed) {
      return res.status(409).json({
        success: false,
        message: "Hộp số đã tồn tại",
      });
    }

    const transmission = await Transmission.create({
      name,
      description,
    });

    return res.status(201).json({
      success: true,
      message: "Thêm hộp số thành công",
      data: transmission,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Hộp số đã tồn tại",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Không thể thêm hộp số",
      error: error.message,
    });
  }
};

export const updateTransmission = async (req, res) => {
  try {
    const { id } = req.params;
    const name = req.body.name?.trim();
    const description = req.body.description?.trim() || "";

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Mã hộp số không hợp lệ",
      });
    }

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Tên hộp số không được để trống",
      });
    }

    const duplicated = await Transmission.findOne({
      _id: { $ne: id },
      name: {
        $regex: `^${escapeRegex(name)}$`,
        $options: "i",
      },
    });

    if (duplicated) {
      return res.status(409).json({
        success: false,
        message: "Tên hộp số đã tồn tại",
      });
    }

    const transmission = await Transmission.findByIdAndUpdate(
      id,
      {
        name,
        description,
      },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!transmission) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy hộp số",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Cập nhật hộp số thành công",
      data: transmission,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Không thể cập nhật hộp số",
      error: error.message,
    });
  }
};

export const deleteTransmission = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Mã hộp số không hợp lệ",
      });
    }

    const isUsed = await Car.exists({
      transmission: id,
    });

    if (isUsed) {
      return res.status(400).json({
        success: false,
        message: "Không thể xóa vì hộp số đang được sử dụng trong danh sách xe",
      });
    }

    const transmission = await Transmission.findByIdAndDelete(id);

    if (!transmission) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy hộp số",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Xóa hộp số thành công",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Không thể xóa hộp số",
      error: error.message,
    });
  }
};
