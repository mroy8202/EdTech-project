const Course = require("../models/Course");
const Category = require("../models/Category");
const User = require("../models/User");
const { uploadImageToCloudinary } = require("../utils/imageUploader");
require("dotenv").config();

// createCourse -> handler
exports.createCourse = async (req, res) => {
    try {
        // Get user ID from request object
		const userId = req.user.id;

		// Get all required fields from request body
		let {
			courseName,
			courseDescription,
			whatYouWillLearn,
			price,
			tag,
			category,
			status,
			instructions,
		} = req.body;

        // fetch thumbnail
        const thumbnail = req.files.thumbnailImage;

        // validation
        if(!courseName || !courseDescription || !whatYouWillLearn || !price || !tag || !category || !thumbnail) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }
        if (!status || status === undefined) {
			status = "Draft";
		}

        // check for instructor
        const instructorDetails = await User.findById(userId, { accountType: "Instructor" });
        console.log("Instructor Details: ",  instructorDetails);

        if(!instructorDetails) {
            return res.status(404).json({
                success: false,
                message: "Instructor details not found"
            });
        }

        // check given category is valid or not
        const categoryDetails = await Category.findById(category);
        if(!categoryDetails) {
            return res.status(404).json({
                success: false,
                message: "Category details not found"
            });
        }

        // upload image to cloudinary
        const thumbnailImage = await uploadImageToCloudinary(thumbnail, process.env.FOLDER_NAME);
        console.log("Thumbnail image: ", thumbnailImage);

        // create an entry for new course
        const newCourse = await Course.create({
			courseName,
			courseDescription,
			instructor: instructorDetails._id,
			whatYouWillLearn: whatYouWillLearn,
			price,
			tag: tag,
			category: categoryDetails._id,
			thumbnail: thumbnailImage.secure_url,
			status: status,
			instructions: instructions,
		});

        // add the new course to the user schema of instructor
        await User.findByIdAndUpdate(
            {_id: instructorDetails._id},
            {$push: 
                {courses: newCourse._id}
            },
            {new: true}
        );

        // update the Category schema
        await Category.findByIdAndUpdate(
            {_id: category},
            {
                $push: {
					course: newCourse._id,
				},
            },
            {new: true}
        );

        // Return the new course and a success message
        return res.status(200).json({
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

// getAllCourses -> handler
exports.getAllCourses = async (req, res) => {
    try {
        // fetch al courses 
        const allCourses = await Course.find({}, {
            courseName: true,
            price: true,
            thumbnail: true,
            instructor: true,
            ratingAndReviews: true,
            studentsEnroled: true,
        }).populate("instructor").exec();

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

// getCourseDetails -> handler
exports.getCourseDetails = async (req, res) => {
    try {
        // fetch course id from req body
        const { courseId } = req.body;

        // find course details
        const courseDetails = await Course.find({ _id: courseId })
                                                .populate(
                                                    {
                                                        path: "instructor",
                                                        populate: {
                                                            path: "additionalDetails",
                                                        }
                                                    }
                                                )
                                                .populate("category")
                                                // .populate("ratingAndReviews")
                                                .populate(
                                                    {
                                                        path: "courseContent",
                                                        populate: {
                                                            path: "subSection"
                                                        }
                                                    }
                                                )
                                                .exec();   
                
        console.log("COURSE DETAILS -> ", courseDetails);
        // validation
        if(!courseDetails) {
            return res.status(400).json({
                success: false,
                message: `Could not find the course with ${courseId}`,
            });
        }

        // return successfull response
        return res.status(200).json({
            success: true,
            message: "Course details fetched successfully",
            data: courseDetails
        });
    }
    catch(error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Error in fetching Course detail",
            error: error.message
        });
    }
}

