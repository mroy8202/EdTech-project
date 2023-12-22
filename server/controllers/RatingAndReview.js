const RatingAndReview = require("../models/RatingAndReview");
const Course = require("../models/Course");
const { default: mongoose } = require("mongoose");

// createRating -> handler
exports.createRating = async (req, res) => {
    try {
        // get user id
        const userId = req.user.id;

        // fetch data from req body
        const { rating, review, courseId } = req.body;

        // check if user is enrolled or not
        const courseDetails = await Course.findOne({
            _id: courseId,
            studentsEnrolled: {$elemMatch: {$eq: userId} }
        });

        if(!courseDetails) {
            return res.status(404).json({
                success: false,
                message: "Student is not enrolled in the course"
            });
        }

        // check if user has already reviewed the course
        const alreadyReviewed = await RatingAndReview.findOne({user: userId, course: courseId});
        if(alreadyReviewed) {
            return res.status(403).json({
                success: false,
                message: "Course is already reviewed by the user"
            });
        } 

        // create rating and review
        const ratingReview = await RatingAndReview.create({
            rating,
            review,
            course: courseId,
            user: userId
        });

        // update course with rating and review
        const updatedCourseDetails = await Course.findByIdAndUpdate(
            {_id: courseId},
            {
                $push: {
                    ratingAndReviews: ratingReview._id,
                }
            },
            {new: true}
        );
        console.log("updatedCourseDetails: ", updatedCourseDetails);

        // return successfull response
        return res.status(200).json({
            success: true,
            message: "Rating and review created successfully",
            ratingReview
        });
    }
    catch(error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}; 

// getAverageRating -> handler
exports.getAverageRating = async (req, res) => {
    try {
        // get course id
        const courseId = req.body.courseId;

        // calculate average rating
        const result = await RatingAndReview.aggregate([
            {
                $match: {
                    // courseId is of String type, convert it into ObjectId
                    course: new mongoose.Types.ObjectId(courseId),
                },
            },
            {
                $group: {
                    _id: null,
                    averageRating: { $avg: "$rating" },
                }
            }
        ]);

        // return result
        if(result.length > 0) {
            return res.status(200).json({
                success: true,
                averageRating: result[0].averageRating,
            });
        }

        // if no rating/review exists
        return res.status(200).json({
            success: true,
            message: "Average rating is 0, no ratings given till now",
            averageRating: 0
        });
    }
    catch(error) {
        return res.status(500).json({
            success: false,
            message: "cannot get average retings",
            error: error.message
        });
    }
}