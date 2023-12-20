const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const bcrypt = require("bcrypt");

// resetPasswordToken
exports.resetPasswordToken = async (req, res) => {
    try {
        // fetch email from req body
        const { email } = req.body.email;

        // check user for this email, email validation
        const user = await User.findOne({email: email});
        if(!user) {
            return res.status(401).json({
                success: false,
                message: "Your email is not registered with us"
            });
        }

        // generate token
        const token = crypto.randomUUID();

        // update user by adding token and expiration time
        const updatedDetails = await User.findOneAndUpdate(
            {email: email},
            {
                token: token,
                resetPasswordExpires: Date.now() + 5 * 60 * 1000
            },
            {new: true}
        );

        // create url
        const url = `http://localhost:3000/update-password/${token}`;

        // send mail containing the url
        await mailSender(email, "Password reset link", `password reset link: ${url}`);

        // return response
        res.status(200).json({
            success: true,
            message: "Email sent successfully, please check email and change password"
        }); 

    }
    catch(error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Something went wrong while reset password"
        });
    }
}

// resetPassword
exports.resetPassword = async (req, res) => {
    try {
        // fetch data
        const { password, confirmPassword, token } = req.body;

        // validation
        if(password !== confirmPassword) {
            return res.status(401).json({
                success: false,
                message: "Password is not matching"
            });
        }
        
        // get user details from db using token
        const userDetails = await User.findOne({token: token});

        // if user is not found -> invalid token
        if(!userDetails) {
            return res.status(401).json({
                success: false,
                message: "Token is invalid"
            });
        }

        // token time check
        if(userDetails.resetPasswordExpires < Date.now()) {
            return res.status(401).json({
                success: false,
                message: "Token time is expired, please regenerate your token"
            });
        }

        // hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // update password
        await User.findOneAndUpdate(
            {token: token},
            {password: hashedPassword},
            {new: true}
        );

        // return respnose
        res.status(200).json({
            success: true,
            message: "Password reset successfull"
        });
    }
    catch(error) {
        return res.status(401).json({
            success: false,
            message: "Something went wrong while changing password"
        });
    }
}