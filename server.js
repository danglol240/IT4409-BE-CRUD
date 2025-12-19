const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const app = express();
// Middleware
app.use(cors());
app.use(express.json());
app.listen(3001, () => console.log("Server chạy tại http://localhost:3001"));

// Kết nối MongoDB với username là MSSV, password là MSSV, dbname là it4409
mongoose
.connect("mongodb+srv://20225174:20225174@cluster0.fnvmunw.mongodb.net/it4409")
.then(() => console.log("Connected to MongoDB"))
.catch((err) => console.error("MongoDB Error:", err));

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Tên không được để trống"],
    minlength: [2, "Tên phải >= 2 ký tự"]
  },
  age: {
    type: Number,
    required: [true, "Tuổi không được để trống"],
    min: [0, "Tuổi phải >= 0"]
  },
  email: {
    type: String,
    required: [true, "Email không được để trống"],
    match: [/^\S+@\S+\.\S+$/, "Email không hợp lệ"]
  },
  address: {
    type: String
  }
});

const User = mongoose.model("User", UserSchema);

// API GET
app.get("/api/users", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const search = req.query.search || "";

    const filter = search
      ? {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
            { address: { $regex: search, $options: "i" } }
          ]
        }
      : {};

    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find(filter).skip(skip).limit(limit),
      User.countDocuments(filter)
    ]);

    res.json({
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      data: users
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//API POST
app.post("/api/users", async (req, res) => {
  try {
    const newUser = await User.create(req.body);

    res.status(201).json({
      message: "Tạo người dùng thành công",
      data: newUser
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

//API PUT
app.put("/api/users/:id", async (req, res) => {
  try {
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
      data: updatedUser
    });

  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

//API DELETE
app.delete("/api/users/:id", async (req, res) => {
  try {
    const deleted = await User.findByIdAndDelete(req.params.id);

    if (!deleted) return res.status(404).json({ error: "Không tìm thấy người dùng" });

    res.json({ message: "Xóa thành công" });

  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
