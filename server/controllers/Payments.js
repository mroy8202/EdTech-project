const { instance } = require("../config/razorpay");
const Course = require("../models/Course");
const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const { courseEnrollmentEmail } = require("../mail/templates/courseEnrollmentEmail");
const { default: mongoose } = require("mongoose");

// capture the payment and initiate the razorpay order
exports.capturePayment = async (req, res) => {
    try {
        // fetch courseId and userId
        const {course_id} = req.body;
        const userId = req.User.id;

        // valid courseId
        if(!course_id) {
            return res.status(400).json({
                success: false,
                message: "Please provide vaid course id",
            }); 
        }

        // valid courseDetails
        let course;
        try {
            course = await Course.findById(course_id);
            if(!course) {
                return res.status(400).json({
                    success: false,
                    message: "Couldnot find the course",
                }); 
            }

            // user already paid for the same course
            // user_id type is string, convert it to objectId
            const uid = new mongoose.Types.ObjectId(userId); 
            if(course.studentsEnrolled.includes(uid)) {
                return res.status(400).json({
                    success: false,
                    message: "Student is already enrolled",
                }); 
            }
        }
        catch(error) {
            console.log(error);
            return res.status(500).json({
                success: false,
                message: error.message,
            }); 
        }

        // create order
        const amount = course.price;
        const currency = "INR";

        const options = {
            amount: amount * 100,
            currency,
            receipt: Math.random(Date.now()).toString(),
            notes: {
                courseId: course_id,
                userId,
            }
        };

        try {
            // initiate the payment using razorpay
            const paymentResponse = await instance.orders.create(options);
            console.log(paymentResponse);
        }
        catch(error) {
            return res.status(500).json({
                success: false,
                message: "Couldnot initiate order"
            });
        }

        // return response
        return res.status(200).json({
            success: true,
            courseName: course.courseName,
            courseDescription: course.courseDescription,
            thumbnail: course.thumbnail,
            orderId: paymentResponse.id,
            currency: paymentResponse.currency,
            amount: paymentResponse.amount,
            message: "Capture payment successfully"
        });
    }
    catch(error) {
        return res.status(500).json({
            success: false,
            message: "unable to create capture payment api",
            error: error.message,
        }); 
    }
};
