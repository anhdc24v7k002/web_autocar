import Car from "../models/Car.js";
import Rental from "../models/Rental.js";
import PaymentMethod from "../models/PaymentMethod.js";

const hasDateConflict = async (carId, startDate, endDate) => {
  const conflict = await Rental.findOne({
    car: carId,
    status: {
      $in: ["pending", "approved"],
    },
    startDate: {
      $lte: new Date(endDate),
    },
    endDate: {
      $gte: new Date(startDate),
    },
  });

  return Boolean(conflict);
};

export const createRental = async (req, res) => {
  try {
    const {
      carId,
      customerName,
      phone,
      address,
      startDate,
      endDate,
      paymentMethod,
    } = req.body;

    if (
      !carId ||
      !customerName ||
      !phone ||
      !address ||
      !startDate ||
      !endDate ||
      !paymentMethod
    ) {
      return res.status(400).json({
        message: "Vui lòng nhập đầy đủ thông tin thuê xe.",
      });
    }

    const car = await Car.findById(carId);

    if (!car) {
      return res.status(404).json({
        message: "Không tìm thấy xe.",
      });
    }

    const selectedPaymentMethod = await PaymentMethod.findById(paymentMethod);

    if (!selectedPaymentMethod) {
      return res.status(400).json({
        message: "Phương thức thanh toán không tồn tại.",
      });
    }

    if (!selectedPaymentMethod.active) {
      return res.status(400).json({
        message:
          `Thanh toán ${selectedPaymentMethod.name.toLowerCase()} ` +
          "tạm thời ngưng hoạt động. Xin lỗi vì sự bất tiện này!",
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return res.status(400).json({
        message: "Ngày nhận hoặc ngày trả xe không hợp lệ.",
      });
    }

    if (start >= end) {
      return res.status(400).json({
        message: "Thời gian trả xe phải sau thời gian nhận xe.",
      });
    }

    const conflict = await hasDateConflict(carId, startDate, endDate);

    if (conflict) {
      return res.status(400).json({
        message: "Xe đã được thuê trong khoảng thời gian này.",
      });
    }

    const milliseconds = end - start;

    const days = Math.ceil(milliseconds / (1000 * 60 * 60 * 24));

    const totalPrice = days * car.pricePerDay;

    const rental = await Rental.create({
      user: req.user._id,
      car: carId,
      customerName: customerName.trim(),
      phone: phone.trim(),
      address: address.trim(),
      startDate: start,
      endDate: end,
      paymentMethod,
      totalPrice,
      status: "pending",
    });

    await Car.findByIdAndUpdate(carId, {
      status: "rented",
    });

    const populatedRental = await Rental.findById(rental._id)
      .populate({
        path: "car",
        select: "name brand type transmission seats pricePerDay image status",
        populate: [
          {
            path: "brand",
            select: "name",
          },
          {
            path: "type",
            select: "name",
          },
          {
            path: "transmission",
            select: "name",
          },
        ],
      })
      .populate({
        path: "user",
        select: "fullName email phone",
      })
      .populate({
        path: "paymentMethod",
        select: "code name description qrImage active",
      });

    return res.status(201).json(populatedRental);
  } catch (error) {
    console.error("Lỗi thuê xe:", error);

    return res.status(500).json({
      message: "Lỗi thuê xe.",
      error: error.message,
    });
  }
};

export const getMyRentals = async (req, res) => {
  try {
    const rentals = await Rental.find({
      user: req.user._id,
    })
      .populate({
        path: "car",
        select: "name brand type transmission seats pricePerDay image status",
        populate: [
          {
            path: "brand",
            select: "name",
          },
          {
            path: "type",
            select: "name",
          },
          {
            path: "transmission",
            select: "name",
          },
        ],
      })
      .populate({
        path: "paymentMethod",
        select: "code name description qrImage active",
      })
      .sort({
        createdAt: -1,
      });

    return res.status(200).json(rentals);
  } catch (error) {
    console.error("Lỗi lấy danh sách đơn thuê của người dùng:", error);

    return res.status(500).json({
      message: "Không thể lấy danh sách đơn thuê của bạn.",
      error: error.message,
    });
  }
};

export const getAllRentals = async (req, res) => {
  try {
    const rentals = await Rental.find()
      .populate({
        path: "car",
        select: "name brand type transmission seats pricePerDay image status",
        populate: [
          {
            path: "brand",
            select: "name",
          },
          {
            path: "type",
            select: "name",
          },
          {
            path: "transmission",
            select: "name",
          },
        ],
      })
      .populate({
        path: "user",
        select: "fullName email phone",
      })
      .populate({
        path: "paymentMethod",
        select: "code name description qrImage active",
      })
      .sort({
        createdAt: -1,
      });

    return res.status(200).json(rentals);
  } catch (error) {
    console.error("Lỗi lấy toàn bộ danh sách thuê xe:", error);

    return res.status(500).json({
      message: "Không thể lấy danh sách đơn thuê xe.",
      error: error.message,
    });
  }
};

export const getCarSchedule = async (req, res) => {
  try {
    const rentals = await Rental.find({
      status: {
        $in: ["pending", "approved"],
      },
    })
      .populate({
        path: "car",
        select: "name brand type transmission seats pricePerDay image status",
        populate: [
          {
            path: "brand",
            select: "name",
          },
          {
            path: "type",
            select: "name",
          },
          {
            path: "transmission",
            select: "name",
          },
        ],
      })
      .populate({
        path: "paymentMethod",
        select: "code name description qrImage active",
      })
      .sort({
        startDate: 1,
      });

    return res.status(200).json(rentals);
  } catch (error) {
    console.error("Lỗi lấy lịch thuê xe:", error);

    return res.status(500).json({
      message: "Không thể lấy lịch thuê xe.",
      error: error.message,
    });
  }
};

export const cancelRental = async (req, res) => {
  try {
    const rental = await Rental.findById(req.params.id);

    if (!rental) {
      return res.status(404).json({
        message: "Không tìm thấy đơn thuê.",
      });
    }

    if (rental.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Bạn không có quyền hủy đơn này.",
      });
    }

    if (rental.status !== "pending") {
      return res.status(400).json({
        message: "Chỉ có thể hủy đơn đang chờ duyệt.",
      });
    }

    rental.status = "cancelled";

    await rental.save();

    const activeRentalCount = await Rental.countDocuments({
      car: rental.car,
      status: {
        $in: ["pending", "approved"],
      },
    });

    if (activeRentalCount === 0) {
      await Car.findByIdAndUpdate(rental.car, {
        status: "available",
      });
    }

    return res.status(200).json({
      message: "Đã hủy đơn thuê.",
    });
  } catch (error) {
    console.error("Lỗi hủy đơn:", error);

    return res.status(500).json({
      message: "Lỗi hủy đơn.",
      error: error.message,
    });
  }
};
