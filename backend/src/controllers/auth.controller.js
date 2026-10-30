import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { OAuth2Client } from "google-auth-library";

const createToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

export const register = async (req, res) => {
  try {
    const { name, fullName, email, phone, password } = req.body;

    const userFullName = fullName || name;

    if (!userFullName || !email || !password) {
      return res.status(400).json({
        message: "Vui lòng nhập đầy đủ thông tin.",
      });
    }

    const existedUser = await User.findOne({ email });
    if (existedUser) {
      return res.status(400).json({
        message: "Email này đã được đăng ký.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      fullName: userFullName,
      email,
      phone,
      password: hashedPassword,
    });

    res.status(201).json({
      token: createToken(user._id),
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi đăng ký tài khoản.",
    });
  }
};

export const getBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("car")
      .populate("user")
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (error) {
    res.status(500).json({
      message: "Lỗi lấy danh sách thuê xe.",
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(400)
        .json({ message: "Email hoặc mật khẩu không đúng." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ message: "Email hoặc mật khẩu không đúng." });
    }

    res.json({
      token: createToken(user._id),
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi đăng nhập." });
  }
};

export const me = async (req, res) => {
  res.json(req.user);
};

//đăng nhập bằng GG
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const googleLogin = async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({
        message: "Không nhận được Google credential.",
      });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    let user = await User.findOne({ email: payload.email });

    if (!user) {
      user = await User.create({
        fullName: payload.name,
        email: payload.email,
        phone: "",
        password: "google-login",
        role: "user",
      });
    }

    res.json({
      token: createToken(user._id),
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    console.log("Google login backend error:", error.message);

    res.status(500).json({
      message: error.message || "Đăng nhập Google thất bại.",
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { fullName, email, phone } = req.body;

    if (!fullName?.trim() || !email?.trim()) {
      return res.status(400).json({
        message: "Họ tên và email không được để trống.",
      });
    }

    const duplicatedEmail = await User.findOne({
      email: email.trim().toLowerCase(),
      _id: { $ne: req.user._id },
    });

    if (duplicatedEmail) {
      return res.status(400).json({
        message: "Email này đã được sử dụng bởi tài khoản khác.",
      });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        message: "Không tìm thấy tài khoản.",
      });
    }

    user.fullName = fullName.trim();
    user.email = email.trim().toLowerCase();
    user.phone = phone?.trim() || "";

    await user.save();

    return res.status(200).json({
      message: "Cập nhật thông tin tài khoản thành công.",
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: "Không thể cập nhật thông tin tài khoản.",
      error: error.message,
    });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        message: "Vui lòng nhập đầy đủ thông tin mật khẩu.",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        message: "Mật khẩu mới phải có ít nhất 6 ký tự.",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        message: "Xác nhận mật khẩu mới không khớp.",
      });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        message: "Không tìm thấy tài khoản.",
      });
    }

    if (user.password === "google-login") {
      return res.status(400).json({
        message: "Tài khoản Google chưa có mật khẩu để thay đổi.",
      });
    }

    const passwordMatched = await bcrypt.compare(
      currentPassword,
      user.password,
    );

    if (!passwordMatched) {
      return res.status(400).json({
        message: "Mật khẩu hiện tại không đúng.",
      });
    }

    const samePassword = await bcrypt.compare(newPassword, user.password);

    if (samePassword) {
      return res.status(400).json({
        message: "Mật khẩu mới phải khác mật khẩu hiện tại.",
      });
    }

    user.password = await bcrypt.hash(newPassword, 10);

    await user.save();

    return res.status(200).json({
      message: "Đổi mật khẩu thành công.",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Không thể đổi mật khẩu.",
      error: error.message,
    });
  }
};
