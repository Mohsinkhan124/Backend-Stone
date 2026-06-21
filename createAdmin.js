import dns from "dns";
dns.setServers(["1.1.1.1", "8.8.8.8"]);

import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import Admin from "./model/Admin.js";

dotenv.config();

await mongoose.connect(process.env.MONGODB_URI);

const createAdmin = async () => {
  try {
    const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);

    const admin = await Admin.create({
      name: "Super Admin",
      email: "mohsinkhantwy@gmail.com",
      password: hashedPassword,
      role: "admin",
    });

    console.log("Admin created:", admin.email);
    process.exit();
  } catch (error) {
    console.log(error.message);
    process.exit(1);
  }
};

createAdmin();