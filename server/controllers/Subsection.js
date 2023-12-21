const SubSection = require("../models/SubSection");
const Section = require("../models/Section");
const { uploadImageToCloudinary } = require("../utils/imageUploader");
require("dotenv").config();

// createSubSection -> handler
exports.createSubSection = async (req, res) => {
    try {
        // fetch data from req body
        const { sectionId, title, timeDuration, description } = req.body;
        // extract video/file
        const video = req.files.videoFile;

        // validation
        if(!sectionId || !title || !timeDuration || !description || !video) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        // upload video to cloudinary, in response secureUrl will be received
        const uploadDetails = await uploadImageToCloudinary(video, process.env.FOLER_NAME); 

        // create a subSection
        const subSectionDetails = await SubSection.create({
            title: title,
            timeDuration: timeDuration,
            description: description,
            videoUrl: uploadDetails.secure_url
        });

        // update section with this sub section objectId
        const updatedSection = await Section.findByIdAndUpdate(
            {_id: sectionId},
            {
                $push: {
                    subSection: subSectionDetails._id,
                }
            },
            {new: true}
        );

        // return response
        res.status(200).json({
            success: true,
            message: "Sub-section created successfully",
            updatedSection
        });


    }
    catch(error) {
        return res.status(500).json({
            success: false,
            message: "unable to create sub section",
            error: error.message
        });
    }
}

// updateSubSection
exports.updateSubSection = async (req, res) => {
    try {
        
    }
    catch(error) {
        return res.status(500).json({
            success: false,
            message: "Error in updating sub-section"
        });
    }
}

// deleteSubSection
exports.deleteSubSection = async (req, res) => {
    try {

    }
    catch(error) {
        return res.status(500).json({
            success: false,
            message: "Error in deleting sub-section"
        });
    }
}