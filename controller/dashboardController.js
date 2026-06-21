import Product from "../model/Product.js";
import Category from "../model/Category.js";
import Inquiry from "../model/Inquiry.js";

export const getDashboardStats = async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments();
    const totalCategories = await Category.countDocuments();
    const totalInquiries = await Inquiry.countDocuments();

    const newInquiries = await Inquiry.countDocuments({
      status: "new",
    });

    const contactedInquiries = await Inquiry.countDocuments({
      status: "contacted",
    });

    const completedInquiries = await Inquiry.countDocuments({
      status: "completed",
    });

    const recentInquiries = await Inquiry.find()
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      stats: {
        totalProducts,
        totalCategories,
        totalInquiries,
        newInquiries,
        contactedInquiries,
        completedInquiries,
      },
      recentInquiries,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};