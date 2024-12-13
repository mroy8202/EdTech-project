# EdTech Backend & Frontend

This is an Ed-tech platform where users can register as students or instructors. Instructors can create, update, and delete courses, while students can purchase, consume, and rate them. The platform ensures secure authentication using JWT, bcrypt for password hashing, OTP verification, and Razorpay for transactions. It also integrates Nodemailer for email notifications and Cloudinary for media storage.


## Features

### Backend (Node.js/Express)

* User authentication (signup, login, logout)
* Profile management (update, delete, display picture)
* Course creation, updating, and deletion (instructor only)
* Payment integration (capture and verify payments via Razorpay)
* Email notifications upon successful payment
* Password reset functionality with OTP
* Instructor dashboard with detailed course management
* Cloud storage integration with Cloudinary for file uploads

### Frontend (React)

* Responsive UI using Tailwind CSS
* Redux for state management
* React Router for navigation
* JWT authentication for protected routes
* Dynamic content loading (infinite scroll for course listing)
* Course details and video lectures for students
* Student and Instructor-specific routes
* Interactive dashboard for users
* Integrated Chart.js for course progress tracking
* Real-time notifications with React Hot Toast
* Ability to add and edit courses for instructors

## Tech Stack

### Backend

* **Node.js**: Server-side JavaScript runtime
* **Express.js**: Web framework
* **MongoDB**: Database
* **Mongoose**: MongoDB ODM
* **JWT**: Authentication token handling
* **Bcrypt**: Password hashing
* **Cloudinary**: Image hosting
* **Razorpay**: Payment gateway
* **Nodemailer**: Email sending
* **Nodemon**: Auto-reload server during development

### Frontend

* **React.js**: UI framework
* **Tailwind CSS**: Utility-first CSS framework
* **Redux**: State management
* **React Router**: Routing library
* **Axios**: HTTP client for API calls
* **Chart.js**: Data visualization library
* **React Hot Toast**: For real-time notifications
* **React Icons**: For adding icons
* **React Dropzone**: For file upload handling

## Installation

### Backend Setup

1. Clone the backend repository:

```bash
git clone https://github.com/your-username/edtech-backend.git
cd edtech-backend
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the root of the project and add the following environment variables:

```
MONGO_URI=your_mongo_db_connection_string
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
RAZORPAY_KEY=your_razorpay_key
PORT=your_preferred_port_number
```

4. Start the server:

```bash
npm run dev
```

### Frontend Setup

1. Clone the frontend repository:

```bash
git clone https://github.com/your-username/edtech-frontend.git
cd edtech-frontend
```

2. Install dependencies:

```bash
npm install
```

3. Start the frontend development server:

```bash
npm run dev
```

4. Open your browser and go to http://localhost:5173.

## API Endpoints

**Authentication Routes (Require JWT token for access):**

* `POST /api/v1/auth/signup`: Sign up a new user
* `POST /api/v1/auth/login`: Login an existing user
* `POST /api/v1/auth/logout`: Logout the current user
* `POST /api/v1/auth/sendOTP`: Send OTP for password reset
* `POST /api/v1/auth/changePassword`: Change user password

**Profile Routes:**

* `DELETE /api/v1/profile/deleteProfile`: Delete user profile
* `PUT /api/v1/profile/updateProfile`: Update user profile
* `GET /api/v1/profile/getUserDetails`: Fetch all user details
* `GET /api/v1/profile/getEnrolledCourses`: Get courses the user is enrolled in
* `PUT /api/v1/profile/updateDisplayPicture`: Update user profile picture

**Course Routes:**

* `POST /api/v1/course/createCourse`: Create a new course (instructor only)
* `GET /api/v1/course/getAllCourses`: Get a list of all courses
* `GET /api/v1/course/getInstructorCourses`: Get courses by instructor

**Payment Routes:**

* `POST /api/v1/payment/capturePayment`: Capture payment (student only)
* `POST /api/v1/payment/verifyPayment`: Verify payment (student only)
* `POST /api/v1/payment/sendPaymentSuccessEmail`: Send email after payment success (student only)

**Contact Us Route:**

* `POST /api/v1/reach/contact`: Contact form submission

