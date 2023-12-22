const User = require("../models/User");
const OTP = require("../models/OTP");
const otpGenerator = require("otp-generator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const mailSender = require("../utils/mailSender");
const Profile = require("../models/Profile");
const { passwordUpdated } = require("../mail/templates/passwordUpdated");

// send otp
exports.sendOTP = async (req, res) => {
    try {
        // fetch email from req body
        const { email } = req.body;

        // Check if user is already present
		// Find user with provided email
        const checkUserPresent = await User.findOne({email});
        // to be used in case of signup

        // If user found with provided email
        if(checkUserPresent) {
            // Return 401 Unauthorized status code with error message
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
        console.log("Result", result);
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
        console.log("OTP Body", otpBody);
        
        // return a successfull response
        return res.status(200).json({
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
        if(recentOTP.length === 0) {
            // OTP not found
            return res.status(400).json({
                success: false,
                message: "OTP not found"
            });
        } else if(otp !== recentOTP[0].otp) {
            console.log("OTP: ", otp);
            console.log("RECENT OTP: ", recentOTP[0].otp);
            // invalid OTP
            return res.status(400).json({
                success: false,
                message: "Invalid OTP"
            });
        }

        // hash password using bcrypt
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create the user
		let approved = "";
		approved === "Instructor" ? (approved = false) : (approved = true);

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
            accountType: accountType,
            approved: approved,
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

        // Check if email or password is missing
        if(!email || !password) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            }); 
        };

        // check if user exists or not
        const user = await User.findOne({email}).populate("additionalDetails");
        // If user not found with provided email
        if(!user) {
            // Return 401 Unauthorized status code with error message
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
            const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "24h" });

            // Save token to user document in database
            user.token = token;
            user.password = undefined;

            // Set cookie for token and return success response
            const options = {
                expires: new Date(Date.now() + 3 * 24 * 60 * 60 *1000),
                httpOnly: true
            }
            return res.cookie("token", token, options).status(200).json({
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
        // Return 500 Internal Server Error status code with error message
        return res.status(500).json({
            success: false,
            message: "Login failure, please try again"
        });
    }
};

// changePassword -> handler
exports.changePassword = async (req, res) => {
    try {
        // get user data from req.user
        const userDetails = await User.findById(req.user.id);

        // get old password, new password, and confirm new password from req.body
        const { oldPassword, newPassword, confirmNewPassword } = req.body;
        
        // validate old password
        const isPasswordMatch = await bcrypt.compare(
			oldPassword,
			userDetails.password
		);
        if (!isPasswordMatch) {
			// If old password does not match, return a 401 (Unauthorized) error
			return res.status(401).json({
                success: false,
                message: "The password is incorrect"
            });
		}

        // Match new password and confirm new password
        if (newPassword !== confirmNewPassword) {
			// If new password and confirm new password do not match, return a 400 (Bad Request) error
			return res.status(400).json({
				success: false,
				message: "The password and confirm password does not match",
			});
		}

        // update password
        const encryptedPassword = await bcrypt.hash(newPassword, 10);
		const updatedUserDetails = await User.findByIdAndUpdate(
			req.user.id,
			{ password: encryptedPassword },
			{ new: true }
		);

        // send notification email
        try {
			const emailResponse = await mailSender(
				updatedUserDetails.email,
				passwordUpdated(
					updatedUserDetails.email,
					`Password updated successfully for ${updatedUserDetails.firstName} ${updatedUserDetails.lastName}`
				)
			);
			console.log("Email sent successfully:", emailResponse.response);
		} 
        catch (error) {
			// If there's an error sending the email, log the error and return a 500 (Internal Server Error) error
			console.error("Error occurred while sending email:", error);
			return res.status(500).json({
				success: false,
				message: "Error occurred while sending email",
				error: error.message,
			});
		}

        // return successfull response
        return res.status(200).json({
            success: true,
            message: "Password updated successfully"
        });
    }
    catch(error) {
        // If there's an error updating the password, log the error and return a 500 (Internal Server Error) error
		console.error("Error occurred while updating password:", error);
		return res.status(500).json({
			success: false,
			message: "Error occurred while updating password",
			error: error.message,
		});
    }
}

