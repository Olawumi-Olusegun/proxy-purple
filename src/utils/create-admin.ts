import { User } from "../models/user.model";

const admins = [
  {
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    phoneNumber: "",
    isVerified: true,
    role: "admin",
  },
  {
    email: "",
    password: "",
    firstName: "Admin",
    lastName: "Admin",
    phoneNumber: "",
    isVerified: true,
    role: "admin",
  },
];

export const createAdmin = async () => {
  try {
    await User.create([]);
    for (const admin of admins) {
      if (!admin.email || !admin.password) continue;

      const exists = await User.findOne({ email: admin.email });
      if (exists) {
        console.log(`Admin already exists: ${admin.email}`);
        continue;
      }

      await User.create(admin);

      console.log(`✅ Admin created: ${admin.email}`);
    }
  } catch (error) {
    console.log(error);
  }
};
