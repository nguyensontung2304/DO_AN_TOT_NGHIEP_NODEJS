import pool from "../config/db.js";

// ====================== REGISTER ======================
export const registerUser = async (req, res) => {
  try {
    const { name, phone, address, email, password } = req.body;

    // Kiểm tra dữ liệu
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Vui lòng nhập đầy đủ thông tin",
      });
    }

    // Kiểm tra email đã tồn tại
    const checkUser = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    if (checkUser.rows.length > 0) {
      return res.status(400).json({
        message: "Email đã tồn tại",
      });
    }

    // Thêm user vào database
    const result = await pool.query(
      `
        INSERT INTO users (name, phone, address, email, password)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, name, phone, address, email
      `,

      [name, phone, address, email, password],
    );

    const newUser = result.rows[0];

    return res.status(201).json({
      message: "Đăng ký thành công",
      user: newUser,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Lỗi server",
    });
  }
};

// ====================== LOGIN ======================
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Tìm user trong database
    const result = await pool.query(
      "SELECT id, name, phone, address, email, password FROM users WHERE email = $1",
      [email],
    );

    // Không tìm thấy email
    if (result.rows.length === 0) {
      return res.status(401).json({
        message: "Email hoặc mật khẩu không đúng",
      });
    }

    const user = result.rows[0];

    // Kiểm tra password
    if (user.password !== password) {
      return res.status(401).json({
        message: "Email hoặc mật khẩu không đúng",
      });
    }

    // Không trả password về frontend
    const userLogin = {
      id: user.id,
      name: user.name,
      phone: user.phone,
      address: user.address,
      email: user.email,
    };

    return res.status(200).json({
      message: "Đăng nhập thành công",
      user: userLogin,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Lỗi server",
    });
  }
};
