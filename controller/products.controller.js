import pool from "../config/db.js";

// =====================
// LẤY TẤT CẢ SẢN PHẨM
// =====================

export const products = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT *
      FROM products
      ORDER BY id ASC
    `);

    return res.status(200).json(result.rows);
  } catch (error) {
    console.error("Lỗi lấy danh sách sản phẩm:", error);

    return res.status(500).json({
      message: "Lỗi server",
    });
  }
};

// =====================
// LẤY CHI TIẾT SẢN PHẨM
// =====================

export const getProductDetail = async (req, res) => {
  try {
    const { id } = req.params;

    // =====================
    // 1. LẤY SẢN PHẨM
    // =====================

    const productResult = await pool.query(
      `
        SELECT *
        FROM products
        WHERE id = $1
      `,
      [id],
    );

    if (productResult.rows.length === 0) {
      return res.status(404).json({
        message: "Không tìm thấy sản phẩm",
      });
    }

    const product = productResult.rows[0];

    // =====================
    // 2. LẤY THÔNG SỐ
    // =====================

    const specsResult = await pool.query(
      `
        SELECT
        id,
        product_id,
        spec_name,
        spec_value
        FROM product_specs
        WHERE product_id = $1
      `,
      [id],
    );

    product.specs = specsResult.rows;

    // =====================
    // 3. LẤY NGUYÊN VẬT LIỆU
    // =====================

    const recipeResult = await pool.query(
      `
        SELECT
        id,
        product_id,
        material_name,
        unit,
        qty
        FROM product_recipes
        WHERE product_id = $1
      `,
      [id],
    );

    product.recipe = recipeResult.rows;

    // =====================
    // 4. TRẢ VỀ FRONTEND
    // =====================

    return res.status(200).json(product);
  } catch (error) {
    console.error("Lỗi lấy chi tiết sản phẩm:", error);

    return res.status(500).json({
      message: "Lỗi server",
    });
  }
};
