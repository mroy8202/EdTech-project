import React, { useEffect, useState } from "react"
// Icons
import { Link } from "react-router-dom"

import GetAvgRating from "../../../utils/avgRating"
import RatingStars from "../../common/RatingStars"

function CourseCard({ course, Height }) {
  
  const [avgReviewCount, setAvgReviewCount] = useState(0)
  useEffect(() => {
    if (course?.ratingAndReviews) {
      const count = GetAvgRating(course.ratingAndReviews);
      setAvgReviewCount(count);
    }
  }, [course])
  // console.log("count............", avgReviewCount)

  if (!course || !course._id || !course.ratingAndReviews) {
    return null; 
  }

  // console.log("Course Card: ", course)
  // console.log("Course id: ", course._id)
  // console.log("rating and review: ", course.ratingAndReviews.length)

  if(!course) {
    console.log("course not found")
  }

  return (
    <>
      <Link to={`/courses/${course._id}`}>
        <div className="">
          <div className="rounded-lg">
            <img
              src={course?.thumbnail}
              alt="course thumnail"
              className={`${Height} w-full rounded-xl object-cover `}
            />
          </div>
          <div className="flex flex-col gap-2 px-1 py-3">
            <p className="text-xl text-richblack-5">{course?.courseName}</p>
            <p className="text-sm text-richblack-50">
              {course?.instructor?.firstName} {course?.instructor?.lastName}
            </p>
            <div className="flex items-center gap-2">
              <span className="text-yellow-5">{avgReviewCount || 0}</span>
              {/* <ReactStars
                count={5}
                value={avgReviewCount || 0}
                size={20}
                edit={false}
                activeColor="#ffd700"
                emptyIcon={<FaRegStar />}
                fullIcon={<FaStar />}
              /> */}
              <RatingStars Review_Count={avgReviewCount} />
              <span className="text-richblack-400">
                {course?.ratingAndReviews?.length} Ratings
              </span>
            </div>
            <p className="text-xl text-richblack-5">Rs. {course?.price}</p>
          </div>
        </div>
      </Link>
    </>
  )
}

export default CourseCard
