# Comic Collective - Backend

Welcome to the backend of Comic Collective. This is a Node.js, Express, and MongoDB application that serves as the API for the [Comic Collective frontend](https://github.com/For-Quick-Start/comic-collective/tree/main/frontend).

## About The Project

This server provides the data and business logic for the Comic Collective application. It handles user authentication, data storage, and provides a complete RESTful API for managing comic book inventory, customer pull lists, and user accounts.

### Core Features

*   **User Authentication**: Secure user registration and login using JSON Web Tokens (JWT) for both customers and employees.
*   **Role-Based Access Control**: Differentiates between customer and employee roles, providing appropriate permissions for API endpoints.
*   **RESTful API**: A full suite of endpoints for CRUD (Create, Read, Update, Delete) operations on:
    *   **Books**: The entire comic book inventory.
    *   **Users**: Customer and employee accounts.
    *   **Pull Lists**: Customer-specific comic book subscriptions.
*   **Recommendation Engine**: Integrates with Google's Generative AI to provide comic book recommendations to customers.
*   **File Uploads**: Handles cover art uploads for comic book entries using `multer`.

## Getting Started

Follow these instructions to get the backend development server up and running on your local machine.

### Prerequisites

*   **Node.js**: Make sure you have Node.js installed. You can download it from nodejs.org.
*   **npm**: A package manager for Node.js (included with Node.js).
*   **MongoDB**: A running instance of MongoDB. You can install it locally or use a cloud service like MongoDB Atlas.

### Installation

1.  **Clone the repository** (if you haven't already):
    ```sh
    git clone https://github.com/For-Quick-Start/comic-collective.git
    ```

2.  **Navigate to the backend directory**:
    ```sh
    cd comic-collective/backend
    ```

3.  **Install NPM packages**:
    ```sh
    npm install
    ```

### Configuration

This project uses environment variables for configuration. Create a `.env` file in the `backend` directory and add the following variables.

```
.env

NODE_ENV=development
PORT=5001
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_google_gemini_api_key
```

*   `NODE_ENV`: Set to `development` for development mode or `production` for production.
*   `PORT`: The port on which the server will run (defaults to `5001`).
*   `MONGO_URI`: Your connection string for your MongoDB database.
*   `JWT_SECRET`: A secret string for signing JSON Web Tokens.
*   `GEMINI_API_KEY`: Your API key for Google's Generative AI service, used for recommendations.

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in development mode using `nodemon`.\
The server will start on the port specified in your `.env` file (e.g., `http://localhost:5001`).

`nodemon` will automatically restart the server whenever you make changes to the code.

### `npm test`

Currently, this script is a placeholder and does not run any tests.

### `node seeder.js`

The seeder file provides the ability to set up the first employee user in the database.\
Once this user is created, all other users can be created using the UI once authenticated as the first user.\
Be sure to sanitize the seeder script after use.

## API Endpoints

The server exposes several RESTful endpoints. Here is a brief overview of the main routes:

*   **Authentication**:
    *   `POST /api/users/login`: Authenticate a user and get a token.
    *   `POST /api/users`: Register a new user.

*   **Books (Inventory)**:
    *   `GET /api/books`: Get all books.
    *   `POST /api/books`: Add a new book (employee only).
    *   `PUT /api/books/:id`: Update a book (employee only).
    *   `DELETE /api/books/:id`: Delete a book (employee only).

*   **Pull Lists**:
    *   `GET /api/users/pull-list`: Get the logged-in customer's pull list.
    *   `GET /api/users/pull-list/all`: Get all pull lists for all customers (employee only).
    *   `POST /api/users/me/pull-list`: Add a book to the customer's pull list.
    *   `POST /api/users/me/pull-drop`: Remove a book from the customer's pull list.
    *   `PUT /api/users/pull-list/:id/pull`: Mark a pull list item as "pulled" (employee only).
    *   `PUT /api/users/pull-list/:id/purchase`: Mark a pull list item as "purchased" (employee only).

*   **Users**:
    *   `GET /api/users`: Get all users (employee only).
    *   `GET /api/users/:id`: Get a single user by ID (employee only).

...and more. Please refer to the route files in `/routes` for a complete definition of all available endpoints.