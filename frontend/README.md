# Comic Collective - Frontend

Welcome to the frontend of Comic Collective, a full-stack web application designed to streamline operations for a comic book store and enhance the customer experience.

## About The Project

Comic Collective is a digital platform that serves both comic book store employees and their customers. It provides a robust set of tools for inventory management, customer pull list tracking, and sales processing, while also offering customers a personalized portal to explore new releases and manage their comic subscriptions.

### For Customers

Customers can log in to their personal dashboard to:
*   **View a Personalized Dashboard**: Get at-a-glance statistics for new comic releases and their personal pull list for the current week, past weeks, and upcoming weeks.
*   **Browse Releases**: Explore a comprehensive catalog of all available comic books.
*   **Manage a Pull List**: Request new comics to be "pulled" and set aside for them at the store. They can also view the status of their pulled items (e.g., requested, pulled, purchased) and drop titles they no longer want.
*   **Get Recommendations**: Discover new series based on their interests. This feature is powered by Google Gemini AI.

### For Employees

Employees have access to a powerful administrative interface that allows them to:
*   **Access a Store Dashboard**: View store-wide statistics on inventory and customer pull lists across different timeframes.
*   **Manage Inventory**: Add new comic books to the store's catalog, edit existing entries, and manage stock levels.  When new books are added, cover art images of the releases can also be uploaded.  These image files are stored securely in Google Cloud Storage.
*   **Process Pull Lists**: View and manage all customer pull requests, marking items as "pulled" from the shelves or "purchased" by the customer.
*   **Manage Users**: View and manage both customer and employee accounts within the system.

## Getting Started

Follow these instructions to get the frontend development environment up and running on your local machine.

### Prerequisites

*   **Node.js**: Make sure you have Node.js installed. You can download it from [nodejs.org](https://nodejs.org/).
*   **npm** or **yarn**: A package manager for Node.js. npm is included with Node.js.
*   **Running Backend**: This frontend is designed to communicate with the Comic Collective backend API. Ensure the backend server is running locally, typically on `http://localhost:5001`.

### Installation

1.  **Clone the repository** (if you haven't already):
    ```sh
    git clone https://github.com/For-Quick-Start/comic-collective.git
    ```

2.  **Navigate to the frontend directory**:
    ```sh
    cd comic-collective/frontend
    ```

3.  **Install NPM packages**:
    ```sh
    npm install
    ```

### Configuration

The project is configured to proxy API requests to `http://localhost:5001` via the `proxy` setting in the `package.json` file. If your backend is running on a different port, you will need to update this value.

For other environment-specific variables, you can create a `.env` file in the `frontend` directory.

One variable that needs to be set in the .env file of the frontend is `REACT_APP_BACKEND_URL`.

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in development mode.\
Open http://localhost:3000 to view it in your browser.

The page will reload when you make changes. You may also see any lint errors in the console.

### `npm test`

Launches the test runner in interactive watch mode.\
See the section about running tests for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc.) right into your project so you have full control over them.

---

This project was bootstrapped with Create React App.
