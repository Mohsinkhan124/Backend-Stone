import Product from "../model/Product.js";
import Category from "../model/Category.js";
import slugify from "slugify";
import cloudinary from "../config/cloudinary.js";


// Create a new product - Admin only
export const createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      images,
      price,
      featured,
      inStock,
      specifications,
    } = req.body;

    // Check category exists
    const categoryExists = await Category.findById(category);

    if (!categoryExists) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    let imageUrl = "";

if (req.file) {
  const result = await new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        { folder: "wq-marble-products" },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      )
      .end(req.file.buffer);
  });

  imageUrl = result.secure_url;
}

    const product = await Product.create({
  name,
  slug: slugify(name, {
    lower: true,
    strict: true,
  }),
  description,
  category,
  images: imageUrl ? [imageUrl] : [],
  price,
  featured,
  inStock,

  specifications: {
    color: req.body.color,
    finish: req.body.finish,
    origin: req.body.origin,
    application: req.body.application,
  },
});

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get all products 

export const getProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .populate("category")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get single product by ID

export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("category");

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update product by ID - Admin only

export const updateProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      images,
      price,
      featured,
      inStock,
      specifications,
    } = req.body;

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      {
        name,
        slug: slugify(name, {
          lower: true,
          strict: true,
        }),
        description,
        category,
        images,
        price,
        featured,
        inStock,
        specifications,
      },
      {
        new: true,
      }
    ).populate("category");

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete product by ID - Admin only

export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};