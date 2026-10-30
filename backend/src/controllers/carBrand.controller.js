import mongoose from "mongoose";
import CarBrand from "../models/CarBrand.js";
import Car from "../models/Car.js";

export const getAllCarBrands = async (req, res) => {
  try {
    const brands = await CarBrand.find().sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      data: brands,
    });
  } catch (error) {
    console.error("Lỗi lấy danh sách hãng xe:", error);

    return res.status(500).json({
      success: false,
      message: "Không thể lấy danh sách hãng xe",
      error: error.message,
    });
  }
};

export const createCarBrand = async (req, res) => {
  try {
    const name = req.body.name?.trim();
    const description = req.body.description?.trim() || "";

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Tên hãng xe không được để trống",
      });
    }

    const existedBrand = await CarBrand.findOne({
      name: {
        $regex: `^${escapeRegex(name)}$`,
        $options: "i",
      },
    });

    if (existedBrand) {
      return res.status(409).json({
        success: false,
        message: "Hãng xe đã tồn tại",
      });
    }

    const brand = await CarBrand.create({
      name,
      description,
    });

    return res.status(201).json({
      success: true,
      message: "Thêm hãng xe thành công",
      data: brand,
    });
  } catch (error) {
    console.error("Lỗi thêm hãng xe:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Hãng xe đã tồn tại",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Không thể thêm hãng xe",
      error: error.message,
    });
  }
};

export const updateCarBrand = async (req, res) => {
  try {
    const { id } = req.params;
    const name = req.body.name?.trim();
    const description = req.body.description?.trim() || "";

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Mã hãng xe không hợp lệ",
      });
    }

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Tên hãng xe không được để trống",
      });
    }

    const duplicatedBrand = await CarBrand.findOne({
      _id: { $ne: id },
      name: {
        $regex: `^${escapeRegex(name)}$`,
        $options: "i",
      },
    });

    if (duplicatedBrand) {
      return res.status(409).json({
        success: false,
        message: "Tên hãng xe đã tồn tại",
      });
    }

    const brand = await CarBrand.findByIdAndUpdate(
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

    if (!brand) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy hãng xe",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Cập nhật hãng xe thành công",
      data: brand,
    });
  } catch (error) {
    console.error("Lỗi cập nhật hãng xe:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Tên hãng xe đã tồn tại",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Không thể cập nhật hãng xe",
      error: error.message,
    });
  }
};

export const deleteCarBrand = async (req, res) => {
  try {
    const { id } = req.params;

    console.log("ID hãng xe cần xóa:", id);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Mã hãng xe không hợp lệ",
      });
    }

    const brand = await CarBrand.findById(id);

    if (!brand) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy hãng xe",
      });
    }

    const isUsed = await Car.exists({
      brand: id,
    });

    if (isUsed) {
      return res.status(400).json({
        success: false,
        message:
          "Không thể xóa vì hãng xe đang được sử dụng trong danh sách xe",
      });
    }

    await CarBrand.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Xóa hãng xe thành công",
    });
  } catch (error) {
    console.error("Lỗi xóa hãng xe:", error);

    return res.status(500).json({
      success: false,
      message: "Không thể xóa hãng xe",
      error: error.message,
    });
  }
};

const escapeRegex = (value) => {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};
