const Tag = require("../models/Tag");

// createTag -> handler
exports.createTag = async (req, res) => {
    try {
        // fetch data 
        const { name, description } = req.body;

        // validation
        if(!name || !description) {
            return res.status(400).json({
                success: false,
                message: "All fields are neccassary"
            });
        }

        // create enrty in db
        const tagDetails = await Tag.create({name: name, description: description});
        console.log("tag details: ", tagDetails);

        // return a response
        res.status(200).json({
            success: true,
            message: "tag created successfully"
        });
    }
    catch(error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

// showAllTags -> handler 
exports.showAllTags = async (req, res) => {
    try {
        // fetch all the tags, and make sure that every tag has a name & description
        const allTags = await Tag.find({}, {name: true, description: true});

        res.status(200).json({
            success: true,
            allTags,
            message: "All tags returned successfully"
        });
    }
    catch(error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}