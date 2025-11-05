import passport from "passport";
import { User } from "../models/user.model";

passport.serializeUser((user: Express.User, done) => {
  done(null, user);
});

passport.deserializeUser(async (user: Express.User, done) => {
  try {
    const existingUser = await User.findById(user.userId);

    if (!existingUser) {
      return done(new Error("User not found"), null);
    }

    const userObject = {
      userId: existingUser._id.toString(),
      email: existingUser.email,
      role: existingUser.role as string,
    };
    done(null, userObject);
  } catch (error) {
    done(error);
  }
});
