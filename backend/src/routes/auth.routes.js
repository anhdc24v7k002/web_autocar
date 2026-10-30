import express from "express";

import {
  login,
  me,
  register,
  googleLogin,
  updateProfile,
  changePassword,
} from "../controllers/auth.controller.js";

import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

// Đăng ký
router.post("/register", register);

// Đăng nhập
router.post("/login", login);

// Đăng nhập Google
router.post("/google", googleLogin);

// Xem thông tin tài khoản đang đăng nhập
router.get("/me", protect, me);

// Cập nhật họ tên, email, số điện thoại
router.put("/profile", protect, updateProfile);

// Đổi mật khẩu
router.put("/change-password", protect, changePassword);

export default router;
