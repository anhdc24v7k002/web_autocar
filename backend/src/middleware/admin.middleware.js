export const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({
      message: "Bạn không có quyền truy cập chức năng quản trị.",
    });
  }
};
