import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import errorMiddleware from "./middlewares/error.middleware";
import apiRoutes from "./routes";
import rateLimiter from "./middlewares/rate-limit.middleware";
import cron from "node-cron";
import axios from "axios";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import session from "express-session";
import path from "path";
import config from "./config";
import { gracefulShutdown } from "./database/dbConnection";
import { User } from "./models/user.model";
import MongoStore from "connect-mongo";

process.on("uncaughtException", (err: Error) => {
  return gracefulShutdown(err, "uncaughtException");
});

process.on("unhandledRejection", (reason) => {
  const errorMessage =
    reason instanceof Error ? reason : new Error(JSON.stringify(reason));
  gracefulShutdown(errorMessage, "unhandledRejection");
});

const app = express();

app.disable("x-powered-by");
app.use(
  cors({
    origin: ["http://localhost:5173"],
    credentials: true,
    optionsSuccessStatus: 200,
  })
);
app.use(morgan("dev"));
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  session({
    secret: config.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // 1 day
      secure: config.NODE_ENV === "production",
      httpOnly: true,
      sameSite: "lax",
    },
    store: MongoStore.create({
      mongoUrl: config.MONGO_URI,
      collectionName: "sessions",
      ttl: 60 * 60 * 24, // 1 day in seconds
    }),
  })
);

app.use(passport.initialize());
app.use(passport.session());
passport.use(
  new GoogleStrategy(
    {
      clientID: config.GOOGLE_OAUTH_CLIENT_ID,
      clientSecret: config.GOOGLE_OAUTH_CLIENT_SECRET,
      callbackURL: "/auth/google/callback",
    },
    // This is the missing 'verify' callback function:
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        // 1. Check if the user already exists in your database
        let user = await User.findOne({ googleId: profile.id });

        if (user) {
          // User found, complete the authentication
          const userData = {
            id: user?._id.toString(),
            userId: user?._id.toString(),
            email: user?.email,
            role: user?.role as string,
          };
          done(null, userData);
        } else {
          if (!profile.emails || profile.emails.length === 0) {
            return done(new Error("No email found in Google profile"), false);
          }
          user = await User.create({
            googleId: profile.id,
            email: profile.emails[0].value,
            firstName: profile.displayName,
          });

          const userData: Express.User = {
            id: user._id.toString() as string,
            userId: user._id.toString() as string,
            email: user.email,
            role: user.role as string,
          };

          done(null, userData);
        }
      } catch (err) {
        done(err, false);
      }
    }
  )
);

passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    async (email, password, done) => {
      try {
        const existingUser = await User.findOne({ email });

        if (!existingUser) {
          return done(null, false, { message: "User not found" });
        }

        const isValidPassword = existingUser.comparePassword(password);

        if (!isValidPassword) {
          return done(null, false, { message: "Invalid credentials" });
        }

        const userData: Express.User = {
          id: existingUser._id.toString(),
          userId: existingUser._id.toString(),
          email: existingUser.email,
          role: existingUser.role as string,
        };

        return done(null, userData);
      } catch (error) {
        console.error("Strategy error:", error);
        done(error);
      }
    }
  )
);

app.use(
  "/auth/google",
  passport.authenticate("google", { scope: ["email", "profile"] })
);
app.use(
  "/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/auth-failure",
    session: true,
  }),
  (_req, res) => {
    // Successful authentication, redirect
    res.redirect("/api/v1/users/profile");
  }
);

passport.serializeUser((user: Express.User, done) => {
  done(null, user);
});

passport.deserializeUser(async (user: Express.User, done) => {
  const existingUser = await User.findById(user?.userId).select("-password");

  if (!existingUser) {
    return done(null, false);
  }

  const userData: Express.User = {
    id: existingUser._id.toString(),
    userId: existingUser._id.toString(),
    email: existingUser.email,
    role: existingUser.role as string,
  };

  done(null, userData);
});

app.use("/login", (_req, res) => {
  console.log("Serving login page");
  res.sendFile(path.join(__dirname, "views", "login.html"));
});

app.use(express.static(path.join(__dirname, "views")));

app.get("/health", (_req, res) => {
  return res.json({ ok: true });
});

app.use(rateLimiter.globalLimiter);
app.use("/api", apiRoutes);

// 404 handler for undefined API routes
app.use((_req, res) => {
  res.status(404).json({
    status: "error",
    message: "Route not found",
  });
});

// Global error handler
app.use(errorMiddleware);

// CRON JOB — runs every 4 minutes
// This cron job is setup in other to bypass the idle time when deployed on render free hosting
cron.schedule("*/4 * * * *", async () => {
  try {
    const response = await axios.get(`${config.APP_URL}/health`);
    console.log(
      `[CRON] Health check successful at ${new Date().toISOString()}`,
      response.data
    );
    //eslint-disable-next-line
  } catch (error: any) {
    console.error(
      `[CRON] Health check failed at ${new Date().toISOString()}:`,
      error.message
    );
  }
});

export default app;
