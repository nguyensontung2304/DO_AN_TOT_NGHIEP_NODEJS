import express from "express";
import cors from "cors";

import userRoute from "./routes/user.route.js";
import productsRoute from "./routes/products.route.js";
import cartRoute from "./routes/cart.route.js";
import orderRoute from "./routes/order.route.js";

const app = express();

app.use(cors());

app.use(express.json());

// ====================== USERS ======================
app.use("/users", userRoute);

// ====================== PRODUCTS ======================
app.use("/products", productsRoute);

// ====================== CARTS ======================
app.use("/cart", cartRoute);

// ====================== ORDERS ======================
app.use("/orders", orderRoute);

app.listen(5000, () => {
  console.log("Server đang chạy");
});
