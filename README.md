# LMS Job Portal

## Overview

The **LMS Job Portal** is a Learning Management System (LMS) integrated with job portal functionalities, designed to help users enhance their skills and connect with job opportunities. The platform allows learners to enroll in courses, complete assessments, and apply for jobs based on their acquired skills.

## Features

- **Video Management**: Videos are stored and managed on Cloudinary.
- **Voting System**: Users can upvote and downvote answers in the Q&A Forum.

- **User Authentication**: Secure login and registration using JWT authentication.
- **Role-Based Access Control**:

  - Admin: Manage users, courses, and job listings.
  - Instructor: Create and manage courses.
  - Student: Enroll in courses and apply for jobs.

- **Course Management**: CRUD operations for courses, quizzes, and assignments (similar to Udemy).
- **Q&A Forum**: Users can ask and answer questions (similar to Stack Overflow).
- **Job Board**: Employers can post jobs and search for candidates.
- **Application Tracking**: Users can apply for jobs and track their application status.
- **RESTful API**: Well-structured API endpoints for integration.
- **Database**: Uses MongoDB with Mongoose for structured data storage.

## Tech Stack

### Backend:

- **Node.js** with **Express.js** (REST API Development)
- **MongoDB** (Database Management)
- **Mongoose ORM** (Database interactions)
- **JWT** (Authentication & Authorization)

## Installation & Setup

### Prerequisites:

- Node.js & npm
- MongoDB
- Google Application ID and Password

### Steps:

1. Clone the repository:
   ```sh
   git clone https://github.com/mahmoddddd/LMS-JobPortal.git
   ```
2. Navigate to the backend directory and install dependencies:
   ```sh
   cd backend
   npm install
   ```
3. Set up environment variables (`.env` file):
   ```sh
   PORT=4000
   MONGO_URL=your_mongodb_url
   JWT_SECRET=your_secret_key
   MAIL_ID=your_email
   PASS_MAIL=your_email_password
   CLOUD_NAME=your_cloudinary_name
   CLOUD_API_KEY=your_cloudinary_api_key
   CLOUD_API_SECRET=your_cloudinary_api_secret
   INFOBIP_BASE_URL=your_infobip_base_url
   INFOBIP_API_KEY=your_infobip_api_key
   WHATSAPP_TO_NUMBER=your_whatsapp_number
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   GOOGLE_CALLBACK_URL=your_google_callback_url
   OPENAI_API_KEY=your_openai_api_key
   AIML_API_KEY=your_aiml_api_key
   ```
4. Start the backend server:
   ```sh
   npm start
   ```

## API Documentation

- The API is documented using **Postman** or **Swagger**.
- Base URL: `http://localhost:4000/api`
- Postman Collection (Coming Soon): [Postman Link](#)

- The API is documented using **Postman** or **Swagger**.
- Base URL: `http://localhost:4000/api`

### Example API Requests

#### User Login

```sh
POST /api/auth/login
Headers: { "Content-Type": "application/json" }
Body: {
  "email": "user@example.com",
  "password": "password123"
}
```

Response:

```json
{
  "token": "your_jwt_token",
  "user": {
    "id": "123456789",
    "name": "John Doe",
    "role": "student"
  }
}
```

#### Create a New Course (Instructor Only)

```sh
POST /api/courses
Headers: { "Authorization": "Bearer your_jwt_token", "Content-Type": "application/json" }
Body: {
  "title": "Advanced Node.js",
  "description": "Learn advanced concepts of Node.js",
  "price": 49.99,
  "videoUrl": "https://res.cloudinary.com/demo/video/upload/sample.mp4"
}
```

Response:

```json
{
  "message": "Course created successfully",
  "course": {
    "id": "987654321",
    "title": "Advanced Node.js",
    "instructor": "123456789"
  }
}
```

- The API is documented using **Postman** or **Swagger**.
- Base URL: `http://localhost:4000/api`

## Contact

For any inquiries or contributions, feel free to reach out:

- **Email**: mahmodd.elsheriff@gmail.com
- **Phone**: 01002084496

## Contribution

Contributions are welcome! Follow these steps:

1. Fork the repository.
2. Create a new branch (`feature-branch`).
3. Commit your changes.
4. Push to the branch and create a Pull Request.

## License

This project is licensed under the MIT License.
