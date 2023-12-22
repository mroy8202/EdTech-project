const Profile = require("../models/Profile");
const User = require("../models/User");
const { uploadImageToCloudinary } = require("../utils/imageUploader");

// updateProfile -> handler
exports.updateProfile = async (req, res) => {
	try {
        // fetch data
		const { dateOfBirth = "", about = "", contactNumber } = req.body;
		const id = req.user.id;

		// Find the profile by id
		const userDetails = await User.findById(id);
		const profile = await Profile.findById(userDetails.additionalDetails);

		// Update the profile fields
		profile.dateOfBirth = dateOfBirth;
		profile.about = about;
		profile.contactNumber = contactNumber;

		// Save the updated profile
		await profile.save();

		return res.json({
			success: true,
			message: "Profile updated successfully",
			profile,
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			success: false,
			error: error.message,
		});
	}
};

// deleteAccount -> handler
exports.deleteAccount = async (req, res) => {
	try {
        // fetch data
		const id = req.user.id;

		const user = await User.findById({ _id: id });
		if (!user) {
			return res.status(404).json({
				success: false,
				message: "User not found",
			});
		}

		// Delete Assosiated Profile with the User
		await Profile.findByIdAndDelete({ _id: user.userDetails });
		
        // Now Delete User
		await user.findByIdAndDelete({ _id: id });
		
        res.status(200).json({
			success: true,
			message: "User deleted successfully",
		});
	} 
    catch (error) {
		console.log(error);
		return res.status(500).json({ 
            success: false, 
            message: "User Cannot be deleted successfully" 
        });
	}
};

// getAllUserDetails -> handler
exports.getAllUserDetails = async (req, res) => {
	try {
		const id = req.user.id;

		const userDetails = await User.findById(id).populate("additionalDetails").exec();

		console.log("userDetails: ", userDetails);

		res.status(200).json({
			success: true,
			message: "User Data fetched successfully",
			data: userDetails,
		});
	} 
    catch (error) {
		return res.status(500).json({
			success: false,
			message: error.message,
		});
	}
};

// updateDisplayPicture -> handler
exports.updateDisplayPicture = async (req, res) => {
    try {
    	const displayPicture = req.files.displayPicture;
      	const userId = req.user.id;
		
		// upload image to cloudinary
		const image = await uploadImageToCloudinary(
			displayPicture,
			process.env.FOLDER_NAME,
			1000,
			1000
		);
		console.log(image);
		
		// update profile
		const updatedProfile = await User.findByIdAndUpdate(
			{ _id: userId },
			{ image: image.secure_url },
			{ new: true }
		);
		
		// send successfull response
		res.send({
			success: true,
			message: `Image Updated successfully`,
			data: updatedProfile,
		});
    } 
	catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
};

// getEnrolledCourses -> handler
exports.getEnrolledCourses = async (req, res) => {
    try {
		const userId = req.user.id

		const userDetails = await User.findOne({_id: userId})
												.populate("courses")
												.exec();

		if(!userDetails) {
			return res.status(400).json({
			success: false,
			message: `Could not find user with id: ${userDetails}`,
			})
		}

		return res.status(200).json({
			success: true,
			data: userDetails.courses,
		});
    } 
	catch (error) {
		return res.status(500).json({
			success: false,
			message: error.message,
		});
    }
};