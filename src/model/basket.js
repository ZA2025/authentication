import mongoose from 'mongoose';

const basketSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    productId: { type: String, required: true },    // Sanity _id
    name: { type: String, required: true },
    price: { type: Number, required: true },
    imageUrl: { type: String, default: '' },
    slug: { type: String, default: '' },
    quantity: { type: Number, default: 1, min: 1 },
  },
  { timestamps: true }
);

basketSchema.index({ userId: 1, productId: 1 }, { unique: true });

const Basket = mongoose.models.Basket || mongoose.model('Basket', basketSchema);
export default Basket;