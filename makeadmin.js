import dns from "dns";
dns.setServers(["1.1.1.1", "8.8.8.8"]);

import mongoose from "mongoose";
import "dotenv/config";
import AdminModel from "./model/Admin.js";
mongoose.connect(process.env.MONGODB_URI);

const makeAdmin = async () => {
  try {
    const result = await AdminModel.updateOne(
      { email: "mohsinkhantwy@gmail.com" },
      { $set: { role: "admin" } }
    );
    console.log("Admin updated:", result);
    process.exit();
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

makeAdmin();

// node makeAdmin.js => terminal mein run karna hai, aur admin banane ke liye email address ko update karna hai. upper sa aur command chalana hai"
// 