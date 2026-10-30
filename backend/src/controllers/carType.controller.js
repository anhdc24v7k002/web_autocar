import mongoose from "mongoose";
import CarType from "../models/CarType.js";
import Car from "../models/Car.js";

const escapeRegex = (value) => {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

export const getAllCarTypes = async (req, res) => {
  try {
    const carTypes = await CarType.find().sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      data: carTypes,
    });
  } catch (error) {
    console.error("Lỗi lấy danh sách loại xe:", error);

    return res.status(500).json({
      success: false,
      message: "Không thể lấy danh sách loại xe",
      error: error.message,
    });
  }
};

export const createCarType = async (req, res) => {
  try {
    const name = req.body.name?.trim();
    const description = req.body.description?.trim() || "";

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Tên loại xe không được để trống",
      });
    }

    const existedCarType = await CarType.findOne({
      name: {
        $regex: `^${escapeRegex(name)}$`,
        $options: "i",
      },
    });

    if (existedCarType) {
      return res.status(409).json({
        success: false,
        message: "Loại xe đã tồn tại",
      });
    }

    const carType = await CarType.create({
      name,
      description,
    });

    return res.status(201).json({
      success: true,
      message: "Thêm loại xe thành công",
      data: carType,
    });
  } catch (error) {
    console.error("Lỗi thêm loại xe:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Loại xe đã tồn tại",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Không thể thêm loại xe",
      error: error.message,
    });
  }
};

export const updateCarType = async (req, res) => {
  try {
    const { id } = req.params;
    const name = req.body.name?.trim();
    const description = req.body.description?.trim() || "";

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Mã loại xe không hợp lệ",
      });
    }

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Tên loại xe không được để trống",
      });
    }

    const duplicatedCarType = await CarType.findOne({
      _id: { $ne: id },
      name: {
        $regex: `^${escapeRegex(name)}$`,
        $options: "i",
      },
    });

    if (duplicatedCarType) {
      return res.status(409).json({
        success: false,
        message: "Tên loại xe đã tồn tại",
      });
    }

    const carType = await CarType.findByIdAndUpdate(
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

    if (!carType) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy loại xe",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Cập nhật loại xe thành công",
      data: carType,
    });
  } catch (error) {
    console.error("Lỗi cập nhật loại xe:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Tên loại xe đã tồn tại",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Không thể cập nhật loại xe",
      error: error.message,
    });
  }
};

export const deleteCarType = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "ID loại xe không hợp lệ",
      });
    }

    const carType = await CarType.findById(id);

    if (!carType) {
      return res.status(404).json({
        message: "Không tìm thấy loại xe",
      });
    }

    const used = await Car.exists({
      type: id,
    });

    if (used) {
      return res.status(400).json({
        message: "Không thể xóa vì loại xe đang được sử dụng.",
      });
    }

    await CarType.findByIdAndDelete(id);

    res.json({
      message: "Xóa loại xe thành công",
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: "Không thể xóa loại xe",
      error: err.message,
    });
  }
};
