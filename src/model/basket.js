import mongoose from "mongoose";

const BasketSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    quantity: { type: Number, default: 1 },
  },
  { timestamps: true }
);

const Basket = mongoose.models.Basket || mongoose.model("Basket", BasketSchema);
export default Basket;