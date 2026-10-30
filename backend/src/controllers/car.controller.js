import Car from "../models/Car.js";

export const getCars = async (req, res) => {
  try {
    const cars = await Car.find()
      .populate("brand", "name")
      .populate("type", "name")
      .populate("transmission", "name")
      .sort({ createdAt: -1 });

    return res.status(200).json(cars);
  } catch (error) {
    console.error("Lỗi lấy danh sách xe:", error);

    return res.status(500).json({
      message: "Không thể lấy danh sách xe",
      error: error.message,
    });
  }
};

export const getCarById = async (req, res) => {
  try {
    const car = await Car.findById(req.params.id)
      .populate("brand", "name")
      .populate("type", "name")
      .populate("transmission", "name");

    if (!car) {
      return res.status(404).json({
        message: "Không tìm thấy xe",
      });
    }

    return res.status(200).json(car);
  } catch (error) {
    console.error("Lỗi lấy chi tiết xe:", error);

    return res.status(500).json({
      message: "Không thể lấy chi tiết xe",
      error: error.message,
    });
  }
};

export const createCar = async (req, res) => {
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

    if (!brand) {
      return res.status(400).json({
        message: "Vui lòng chọn hãng xe",
      });
    }

    const car = await Car.create({
      name,
      brand,
      type,
      seats: Number(seats),
      transmission,
      pricePerDay: Number(pricePerDay),
      image,
      description,
      status: status || "available",
    });

    const populatedCar = await Car.findById(car._id)
      .populate("brand", "name")
      .populate("type", "name")
      .populate("transmission", "name");

    return res.status(201).json(populatedCar);
  } catch (error) {
    console.error("Lỗi thêm xe:", error);

    return res.status(400).json({
      message: "Không thể thêm xe",
      error: error.message,
    });
  }
};
