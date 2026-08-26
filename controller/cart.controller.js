import pool from "../config/db.js";

// ======================
// LẤY GIỎ HÀNG THEO USER
// ======================
export const getCart = async (req, res) => {
  try {
    const { userId } = req.params;

    const result = await pool.query(
      `
      SELECT
        cart_items.id,
        cart_items.product_id AS "productId",
        cart_items.qty,

        products.name,
        products.price,
        products.emoji

      FROM cart_items

      JOIN products
        ON cart_items.product_id = products.id

      WHERE cart_items.user_id = $1

      ORDER BY cart_items.id DESC
      `,
      [userId],
    );

    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Lỗi lấy giỏ hàng:", error);

    res.status(500).json({
      message: "Không thể lấy giỏ hàng",
    });
  }
};

// ======================
// THÊM SẢN PHẨM VÀO GIỎ
// ======================
export const addToCart = async (req, res) => {
  try {
    const { userId, productId } = req.body;

    if (!userId || !productId) {
      return res.status(400).json({
        message: "Thiếu userId hoặc productId",
      });
    }

    const result = await pool.query(
      `
      INSERT INTO cart_items (
        user_id,
        product_id,
        qty
      )

      VALUES ($1, $2, 1)

      ON CONFLICT (user_id, product_id)

      DO UPDATE SET
        qty = cart_items.qty + 1

      RETURNING *
      `,
      [userId, productId],
    );

    res.status(201).json({
      message: "Thêm sản phẩm vào giỏ hàng thành công",
      cartItem: result.rows[0],
    });
  } catch (error) {
    console.error("Lỗi thêm giỏ hàng:", error);

    res.status(500).json({
      message: "Không thể thêm sản phẩm vào giỏ hàng",
    });
  }
};

// ======================
// CẬP NHẬT SỐ LƯỢNG
// ======================
export const updateCartQty = async (req, res) => {
  try {
    const { userId, productId, qty } = req.body;

    if (!userId || !productId || qty === undefined) {
      return res.status(400).json({
        message: "Thiếu dữ liệu cập nhật",
      });
    }

    if (qty <= 0) {
      await pool.query(
        `
        DELETE FROM cart_items
        WHERE user_id = $1
        AND product_id = $2
        `,
        [userId, productId],
      );

      return res.status(200).json({
        message: "Đã xóa sản phẩm vì số lượng bằng 0",
      });
    }

    const result = await pool.query(
      `
      UPDATE cart_items

      SET qty = $1

      WHERE user_id = $2
      AND product_id = $3

      RETURNING *
      `,
      [qty, userId, productId],
    );

    res.status(200).json({
      message: "Cập nhật số lượng thành công",
      cartItem: result.rows[0],
    });
  } catch (error) {
    console.error("Lỗi cập nhật giỏ hàng:", error);

    res.status(500).json({
      message: "Không thể cập nhật giỏ hàng",
    });
  }
};

// ======================
// XÓA SẢN PHẨM
// ======================
export const removeFromCart = async (req, res) => {
  try {
    const { userId, productId } = req.params;

    await pool.query(
      `
      DELETE FROM cart_items

      WHERE user_id = $1
      AND product_id = $2
      `,
      [userId, productId],
    );

    res.status(200).json({
      message: "Đã xóa sản phẩm khỏi giỏ hàng",
    });
  } catch (error) {
    console.error("Lỗi xóa sản phẩm:", error);

    res.status(500).json({
      message: "Không thể xóa sản phẩm",
    });
  }
};
