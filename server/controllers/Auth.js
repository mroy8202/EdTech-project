const User = require("../models/User");
const OTP = require("../models/OTP");
const otpGenerator = require("otp-generator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

// send otp
exports.sendOTP = async (req, res) => {
    try {
        // fetch email from req body
        const { email } = req.body;

        // check if user already exists
        const checkUserPresent = await User.findOne({email});

        // if user already exists, return a response
        if(checkUserPresent) {
            return res.status(401).json({
                success: false,
                message: "User already registered"
            });
        }

        // generate OTP
        var otp = otpGenerator.generate(6, {
            upperCaseAlphabets: false,
            lowerCaseAlphabets: false,
            specialChars: false
        });
        console.log("OTP Generated: ", otp);

        // check if otp is unique or not
        // if not unique, regenerate otp
        let result = await OTP.findOne({otp: otp});
        while(result) {
            otp = otpGenerator.generate(6, {
                upperCaseAlphabets: false,
                lowerCaseAlphabets: false,
                specialChars: false
            });
            result = await OTP.findOne({otp: otp});
        }

        const otpPayload = {email, otp};

        // create an entry for OTP in DB
        const otpBody = await OTP.create(otpPayload);
        console.log(otpBody);
        
        // return a successfull response
        res.status(200).json({
            success: true,
            OTP: otp,
            message: "OTP sent successfully"
        });
    }
    catch(error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// signup
exports.signup = async (req, res) => {
    try {
        // fetch data from req body
        const {
            firstName,
            lastName,
            email,
            password, 
            confirmPassword,
            accountType,
            contactNumber,
            otp
        } = req.body;

        // validate data
        if(!firstName || !lastName || !email || !password || !confirmPassword || !otp) {
            return res.status(403).json({
                success: false,
                message: "All fields are required"
            });
        }

        // match both passwords
        if(password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "password & confirm password donot match, try again..."
            });
        }

        // check if user already exists or not
        const existingUser = await User.findOne({email});
        if(existingUser) {
            return res.status(400).json({
                success: false,
                message: "User is already registered"
            });
        }

        // find most recent OTP stored for the user in DB
        const recentOTP = await OTP.find({email}).sort({createdAt: -1}).limit(1);
        console.log("recent OTP: ", recentOTP);

        // validate OTP
        if(recentOTP.length == 0) {
            // OTP not found
            return res.status(400).json({
                success: false,
                message: "OTP not found"
            });
        } else if(otp !== recentOTP.otp) {
            // invalid OTP
            return res.status(400).json({
                success: false,
                message: "Invalid OTP"
            });
        }

        // hash password using bcrypt
        const hashedPassword = await bcrypt.hash(password, 10);

        // create entry in DB
        const profileDetails = await Profile.create({
            gender: null,
            dateOfBirth: null,
            about: null,
            contactNumber: null
        });

        const user = await User.create({
            firstName,
            lastName,
            email,
            contactNumber,
            password: hashedPassword,
            accountType,
            additionalDetails: profileDetails._id,
            image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`
        });

        // return successfull response
        return res.status(200).json({
            success: true,
            user: user,
            message: "User is registered successfully"
        });
    }
    catch(error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "User cannot be registered, please try again"
        });
    }
};

// login
exports.login = async (req, res) => {
    try {
        // fetch data from req body
        const { email, password } = req.body;

        // validate data
        if(!email || !password) {
            return res.status(403).json({
                success: false,
                message: "All fields are required"
            }); 
        };

        // check if user exists or not
        const user = await User.findOne({email});
        if(!user) {
            return res.status(401).json({
                success: false,
                message: "user is not registered, please signup first"
            });
        }

        // match password and generate jwt token
        if(await bcrypt.compare(password, user.password)) {
            const payload = {
                email: user.email,
                id: user._id,
                accountType: user.accountType
            }
            // create jwt token
            const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "2h" });

            user.token = token;
            user.password = undefined;

            // create cookie and send response
            const options = {
                expires: new Date(Date.now() + 3 * 24 * 60 * 60 *1000),
                httpOnly: true
            }
            res.cookie("token", token, options).status(200).json({
                success: true,
                token,
                user,
                message: "Logged in successfully"
            });
        }
        else {
            return res.status(401).json({
                success: false,
                message: "Password is incorrect"
            });
        }
    }
    catch(error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Login failure, please try again"
        });
    }
};

