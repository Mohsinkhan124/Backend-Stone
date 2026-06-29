import mongoose from "mongoose";

const inquirySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      default: "",
      trim: true,
    },

    phone: {
      type: String,
      required: true,
    },

    subject: {
      type: String,
      default: "",
      trim: true,
    },

    message: {
      type: String,
      required: true,
    },

    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Stone_Product",
      default: null,
    },
    status: {
      type: String,
      enum: ["new", "contacted", "completed"],
      default: "new",
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

const Inquiry = mongoose.model("Stone_Inquiry", inquirySchema);

export default Inquiry;