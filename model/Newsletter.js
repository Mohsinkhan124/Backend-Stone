import mongoose from "mongoose";

const newsletterSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    isRead: {
      type: Boolean,
      default: false,
   }
  },
  {
    timestamps: true,
  }
);

const Newsletter = mongoose.model("Stone_Newsletter", newsletterSchema);

export default Newsletter;