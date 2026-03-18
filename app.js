// import express from "express";
// import { engine } from "express-handlebars";
// import dotenv from "dotenv";
// import session from "express-session";
// import flash from "connect-flash";
// import cookieParser from "cookie-parser";
// import path from "path";
// import { fileURLToPath } from "url";
 
// import connectDB from "./config/db.js";
// import authRoutes from "./routes/authRoutes.js";
// import taskRoutes from "./routes/taskRoutes.js";
// import pageRoutes from "./routes/pageRoutes.js";
 
// dotenv.config();
 
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);
 
// const app = express();
// connectDB();
 
// app.use(express.urlencoded({ extended: true }));
// app.use(cookieParser());
// app.use(
//   session({
//     secret: "secret",
//     resave: false,
//     saveUninitialized: false,
//   })
// );

// app.use(flash());

// // Make messages available in all views
// app.use((req, res, next) => {
//   res.locals.success = req.flash("success");
//   res.locals.error = req.flash("error");
//   next();
// });
 
// // Handlebars configuration
// app.engine(
//   "hbs",
//   engine({
//     extname: ".hbs",
//     defaultLayout: "main",
//     layoutsDir: path.join(__dirname, "views/layouts"),
//     partialsDir: path.join(__dirname, "views/partials"),
//     helpers: {
//       json: (context) => JSON.stringify(context, null, 2),
//     },
//   }),
// );
// app.set("view engine", "hbs");
// app.set("views", path.join(__dirname, "views"));


 
// // Routes
// app.use("/", authRoutes);
// app.use("/", taskRoutes);
// app.use("/", pageRoutes);
 
// app.listen(3000, () => console.log("Server running on port 3000"));

import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import session from "express-session";
import flash from "connect-flash";
import path from "path";
import { fileURLToPath } from "url";

import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import pageRoutes from "./routes/pageRoutes.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
connectDB();

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static("public"));

// ✅ Session (use env secret in production)
app.use(
  session({
    secret: process.env.SESSION_SECRET || "secret",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(flash());

// Flash messages available in all views
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

// EJS setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Root route
app.get("/", (req, res) => {
  res.redirect("/login");
});

// Routes
app.use(authRoutes);
app.use(taskRoutes);
app.use(pageRoutes);

// Fallback (must be last)
app.use((req, res) => {
  res.redirect("/login");
});

// ✅ ONLY ONE listen (FIXED)
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));