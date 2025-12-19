// server.js
require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const app = express();

// Middleware parse JSON
app.use(express.json());

// =====================
// KẾT NỐI MONGODB
// =====================
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Kết nối MongoDB thành công"))
  .catch((err) => {
    console.error("❌ Lỗi kết nối MongoDB:", err);
    process.exit(1);
  });

// =====================
// API POST - Tạo người dùng
// =====================
app.post("/api/users", async (req, res) => {
  try {
    const { name, age, email, address } = req.body;

    // Kiểm tra tuổi là số nguyên
    if (age !== undefined && !Number.isInteger(Number(age))) {
      return res.status(400).json({ error: "Tuổi phải là số nguyên" });
    }

    // Kiểm tra email duy nhất
    if (email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: "Email đã tồn tại trong hệ thống" });
      }
    }

    const newUser = await User.create({ name, age, email, address });

    res.status(201).json({
      message: "Tạo người dùng thành công",
      data: newUser,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// =====================
// API PUT - Cập nhật người dùng
// =====================
app.put("/api/users/:id", async (req, res) => {
  try {
    const { age, email } = req.body;

    // Kiểm tra tuổi là số nguyên
    if (age !== undefined && !Number.isInteger(Number(age))) {
      return res.status(400).json({ error: "Tuổi phải là số nguyên" });
    }

    // Kiểm tra email duy nhất (trừ chính bản ghi đang cập nhật)
    if (email) {
      const existingUser = await User.findOne({
        email,
        _id: { $ne: req.params.id },
      });
      if (existingUser) {
        return res.status(400).json({ error: "Email đã tồn tại trong hệ thống" });
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ error: "Không tìm thấy người dùng" });
    }

    res.json({
      message: "Cập nhật thành công",
      data: updatedUser,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// =====================
// KHỞI ĐỘNG SERVER
// =====================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
});
