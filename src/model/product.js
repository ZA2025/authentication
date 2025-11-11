import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema(
    {
        name: {
          type: String,
          required: true,
        },
        description: {
          type: String,
        },
        price: {
          type: Number,
          required: true,
        },
        image: {
          type: String, // URL or path to image
        },
        stock: {
          type: Number,
          default: 0,
        },
        category: {
          type: String,
        },
      },
      { timestamps: true }
)

const Product =
  mongoose.models.Product || mongoose.model("Product", ProductSchema);

export default Product;