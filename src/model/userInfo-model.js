import mongoose from "mongoose";

const UserInfoSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    name: {
      type: String,
    },
    email: {
      type: String,
    },
    phone: {
      type: String,
    },
    addressLine1: {
      type: String,
      required: true, // you can make optional if needed
    },
    addressLine2: {
      type: String,
    },
    city: {
      type: String,
      required: true,
    },
    postcode: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const UserInfo =
  mongoose.models.UserInfo || mongoose.model("UserInfo", UserInfoSchema);

export default UserInfo;
