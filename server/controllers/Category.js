const Category = require("../models/Category");

function getRandomInt(max) {
    return Math.floor(Math.random() * max)
}

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
        return res.status(200).json({
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

        return res.status(200).json({
            success: true,
            data: allCategories,
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

// categoryPageDetails -> handler
exports.categoryPageDetails = async (req, res) => {
	try {
		const { categoryId } = req.body;

		// Get courses for the specified category
		const selectedCategory = await Category.findById(categoryId)
            .populate({
                path: "courses",
                match: {status: "published"},
                populate: "ratingAndReviews"
            })
            .exec();

		console.log("selectedCategory: ", selectedCategory);

		// Handle the case when the category is not found
		if (!selectedCategory) {
			console.log("Category not found.");
			return res.status(404).json({
                success: false, 
                message: "Category not found" 
            });
		}

		// Handle the case when there are no courses
		if (selectedCategory.course.length === 0) {
			console.log("No courses found for the selected category.");
			return res.status(404).json({
				success: false,
				message: "No courses found for the selected category.",
			});
		}

		// const selectedCourses = selectedCategory.course;

		// Get courses for other categories
		const categoriesExceptSelected = await Category.find({
			_id: { $ne: categoryId },
		});
        
        let differentCategory = await Category.findOne(
            categoriesExceptSelected[getRandomInt(categoriesExceptSelected.length)]
              ._id
        )
        .populate({
            path: "courses",
            match: { status: "Published" },
        })
        .exec()

		// Get top-selling courses across all categories
		const allCategories = await Category.find()
            .populate({
                path: "courses",
                match: { status: "Published" },
            })
            .exec();

		const allCourses = allCategories.flatMap((category) => category.courses);
		const mostSellingCourses = allCourses.sort((a, b) => b.sold - a.sold).slice(0, 10);

		return res.status(200).json({
            success: true,
            data: {
                selectedCategory,
                differentCategory,
                mostSellingCourses,
            },
		});
	} 
    catch (error) {
		return res.status(500).json({
			success: false,
			message: "Internal server error",
			error: error.message,
		});
	}
};