const express = require("express");
const app = express();

const userRoutes = require("./routes/User");
const profileRoutes = require("./routes/Profile");
const paymentRoutes = require("./routes/Payments");
const contactUsRoute = require("./routes/Contact");
const courseRoutes = require("./routes/Course");

const database = require("./config/database");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const { cloudinaryConnect } = require("./config/cloudinary");
const fileUpload = require("express-fileupload");
require("dotenv").config();

const port = process.env.PORT || 4000;

// connect with database
database.connect();

// middlewares
app.use(express.json());
app.use(cookieParser());
app.use(
    cors({
      origin: ["http://localhost:3000", "https://ed-tech-project-pi.vercel.app/"],
      credentials: true,
    })
);

app.use((req, res, next) => {
    console.log("Request received:", req.method, req.url);
    next();
});

app.use(fileUpload({
    useTempFiles : true,
    tempFileDir : '/tmp/'
}));

// connect with cloudinary
cloudinaryConnect();

// mount routes
app.use("/api/v1/auth", userRoutes);
app.use("/api/v1/profile", profileRoutes);
app.use("/api/v1/payment", paymentRoutes);
app.use("/api/v1/course", courseRoutes);
app.use("/api/v1/reach", contactUsRoute);

// default route
app.get("/", (req, res) => {
    return res.json({
        success: true,
        message: "Welcome to default route"
    });
});

// activate server
app.listen(port, () => {
    console.log(`App is running at ${port}`);
});