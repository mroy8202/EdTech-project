const Profile = require("../models/Profile");
const User = require("../models/User");

// updateProfile -> handler
exports.updateProfile = async (req, res) => {
    try {
        // fetch data
        // if data is found, take that data otherwise, take empty data
        const { dateOfBirth="", about="", contactNumber, gender } = req.body;

        // fetch userId
        const id = req.user.id;

        // validation
        if(!contactNumber || !gender) {
            return res.status(400).json({
                success: false,
                message: "All fields are required",
            });
        }

        // find profile from db
        const userDetails = await User.findById(id);
        const profileId = userDetails.additionalDetails;
        const profileDetails = await Profile.findById(profileId);

        // update profile in db
        // used save method instead of findByIdAndUpdate, so entered the data of profileDetails manually
        profileDetails.dateOfBirth = dateOfBirth;
        profileDetails.about = about;
        profileDetails.gender = gender;
        profileDetails.contactNumber = contactNumber;
        await profileDetails.save();

        // return response
        res.status(200).json({
            success: true,
            message: "profile updated successfully",
            profileDetails,
        });
    }
    catch(error) {
        return res.status(500).json({
            success: false,
            message: "unbale to update profile",
            error: error.message,
        });
    }
}