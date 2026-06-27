import Gallery from "../model/Gallery.js";
import cloudinary from "../config/cloudinary.js";

export const createGallery = async (req, res) => {
  try {
    const {
      title,
      description,
      location,
      featured,
    } = req.body;

    let imageUrl = "";

    if (req.file) {
      const result = await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            { folder: "wq-marble-gallery" },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          )
          .end(req.file.buffer);
      });

      imageUrl = result.secure_url;
    }

    const gallery = await Gallery.create({
      title,
      description,
      location,
      images: imageUrl ? [imageUrl] : [],
      featured,
    });

    res.status(201).json({
      success: true,
      message: "Gallery item created successfully",
      gallery,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAllGallery = async (req, res) => {
  try {
    const galleries = await Gallery.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: galleries.length,
      galleries,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Additional function to get a single gallery item by ID

export const getGalleryById = async (req, res) => {
  try {
    const gallery = await Gallery.findById(req.params.id);

    if (!gallery) {
      return res.status(404).json({
        success: false,
        message: "Gallery not found",
      });
    }

    res.status(200).json({
      success: true,
      gallery,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateGallery = async (req, res) => {
  try {
    const { title, description, location, featured } = req.body;

    const gallery = await Gallery.findById(req.params.id);

    if (!gallery) {
      return res.status(404).json({
        success: false,
        message: "Gallery not found",
      });
    }

    let images = gallery.images;

    // Agar nayi image upload hui ho
    if (req.file) {
      const result = await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            { folder: "wq-marble-gallery" },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          )
          .end(req.file.buffer);
      });

      images = [result.secure_url];
    }

    gallery.title = title;
    gallery.description = description;
    gallery.location = location;
    gallery.featured = featured;
    gallery.images = images;

    await gallery.save();

    res.status(200).json({
      success: true,
      message: "Gallery updated successfully",
      gallery,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


export const deleteGallery = async (req, res) => {
  try {
    const gallery = await Gallery.findByIdAndDelete(req.params.id);

    if (!gallery) {
      return res.status(404).json({
        success: false,
        message: "Gallery not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Gallery deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};