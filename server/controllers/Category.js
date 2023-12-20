const Category = require("../models/Category");

// createCategory -> handler
exports.createCategory = async (req, res) => {
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
        const categoryDetails = await Category.create({name: name, description: description});
        console.log("category details: ", categoryDetails);

        // return a response
        res.status(200).json({
            success: true,
            message: "category created successfully"
        });
    }
    catch(error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

// showAllCategories -> handler 
exports.showAllCategories = async (req, res) => {
    try {
        // fetch all the tags, and make sure that every tag has a name & description
        const allCategories = await Category.find({}, {name: true, description: true});

        res.status(200).json({
            success: true,
            allCategories,
            message: "All categories returned successfully"
        });
    }
    catch(error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}