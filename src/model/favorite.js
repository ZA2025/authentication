import mongoose from "mongoose";

const FavoriteSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },          // NextAuth user id
    productId: { type: String, required: true },                    // Sanity _id
    name: { type: String, default: "" },                            // optional snapshot
    imageUrl: { type: String, default: "" },                        // optional snapshot
    slug: { type: String, default: "" },                            // optional snapshot
  },
  { timestamps: true }
);

FavoriteSchema.index({ userId: 1, productId: 1 }, { unique: true });

const Favorite =
  mongoose.models.Favorite || mongoose.model("Favorite", FavoriteSchema);

export default Favorite;