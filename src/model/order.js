import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema(
  {
    productId: { type: String, required: true }, // Sanity id or internal id
    name: { type: String, required: true },
    imageUrl: { type: String, default: '' },
    slug: { type: String, default: '' },
    unitPrice: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    lineTotal: { type: Number, required: true },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    email: { type: String },

    // Stripe references
    stripeCheckoutSessionId: { type: String, index: true, unique: true },
    stripePaymentIntentId: { type: String, index: true },
    currency: { type: String, default: 'gbp' },

    // Monetary breakdown (store in major units for readability)
    subtotal: { type: Number, required: true },
    taxTotal: { type: Number, default: 0 },
    shippingTotal: { type: Number, default: 0 },
    discountTotal: { type: Number, default: 0 },
    grandTotal: { type: Number, required: true },

    items: { type: [orderItemSchema], default: [] },

    // Basic status lifecycle
    status: {
      type: String,
      enum: ['pending', 'paid', 'fulfilled', 'cancelled', 'refunded'],
      default: 'pending',
      index: true,
    },
    notes: { type: String, default: '' },

    // Shipping snapshot (optional for now)
    shippingAddress: {
      name: { type: String },
      line1: { type: String },
      line2: { type: String },
      city: { type: String },
      postal_code: { type: String },
      country: { type: String },
      phone: { type: String },
    },
    billingEmail: { type: String },
  },
  { timestamps: true }
);

const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);
export default Order;


