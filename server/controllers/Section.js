const Section = require("../models/Section");
const Course = require("../models/Course");

// createSection -> handler
exports.createSection = async (req, res) => {
    try {
        // fetch data
        const { sectionName, courseId } = req.body;

        // data validation
        if(!sectionName || !courseId) {
            return res.status(400).json({
                success: false,
                message: "All fields are required in section"
            });
        }

        // create section
        const newSection = await Section.create({sectionName});

        // update course with section objectID
        const updatedCourseDetails = await Course.findByIdAndUpdate(
            courseId,
            {
                $push: {
                    courseContent: newSection._id
                }
            },
            {new: true}
        );

        // return successfull response
        res.status(200).json({
            success: true,
            message: "Section created successfully",
            updatedCourseDetails
        });
    }
    catch(error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Unable to create section, please try again",
            error: error.message
        });
    }
}