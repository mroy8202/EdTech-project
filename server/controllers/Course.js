const Course = require("../models/Course");
const Category = require("../models/Category");
const User = require("../models/User");
const { uploadImageToCloudinary } = require("../utils/imageUploader");
require("dotenv").config();

// createCourse -> handler
exports.createCourse = async (req, res) => {
    try {
        // fetch data
        const { courseName, courseDescription, whatYouWillLearn, price, category } = req.body;

        // fetch thumbnail
        const thumbnail = req.files.thumbnailImage;

        // validation
        if(!courseName || !courseDescription || !whatYouWillLearn || !price || !category) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        // check for instructor
        const userId = req.user.id;
        const instructorDetails = await User.findById(userId);
        console.log("Instructor Details: ",  instructorDetails);

        if(!instructorDetails) {
            return res.status(404).json({
                success: false,
                message: "Instructor details not found"
            });
        }

        // check given tag is valid or not
        const categoryDetails = await Category.findById(tag);
        if(!categoryDetails) {
            return res.status(404).json({
                success: false,
                message: "Category details not found"
            });
        }

        // upload image to cloudinary
        const thumbnailImage = await uploadImageToCloudinary(thumbnail, process.env.FOLDER_NAME);

        // create an entry for new course
        const newCourse = await Course.create({
            courseName,
            courseDescription,
            instructor: instructorDetails._id,
            whatYouWillLearn,
            price,
            category: categoryDetails._id,
            thumbnail: thumbnailImage.secure_url
        });

        // add the new course to the user schema of instructor
        await User.findByIdAndUpdate(
            {_id: instructorDetails._id},
            {$push: 
                {courses: newCourse._id}
            },
            {new: true}
        );

        // update the tag schema
        await Course.findByIdAndUpdate(
            {_id: newCourse._id},
            {category: category},
            {new: true}
        );

        // return successfull response
        res.status(200).json({
            success: true,
            message: "Course created successfully",
            data: newCourse
        });
    }
    catch(error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Failed to create course",
            error: error.message
        });
    }
};

// showAllCourses -> handler
exports.showAllCourses = async (req, res) => {
    try {
        // fetch al courses 
        const allCourses = await Course.find({});

        // return successfull response
        return res.status(200).json({
            success: true,
            message: "Data for all courses fetched successfully",
            data: allCourses
        });
    }
    catch(error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Error in fetching all courses data",
            error: error.message
        });
    }
};

