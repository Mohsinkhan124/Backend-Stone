import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    description: {
      type: String,
      required: true,
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Stone_Category",
      required: true,
    },

    images: [
      {
        type: String,
      },
    ],

    price: {
      type: String,
      default: "On Request",
    },

    featured: {
      type: Boolean,
      default: false,
    },

    inStock: {
      type: Boolean,
      default: true,
    },

    specifications: {
      color: {
        type: String,
        default: "",
      },

      finish: {
        type: String,
        default: "",
      },

      origin: {
        type: String,
        default: "",
      },

      application: {
        type: String,
        default: "",
      },
    },
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model("Stone_Product", productSchema);

export default Product;