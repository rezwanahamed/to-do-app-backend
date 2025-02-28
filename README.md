# To-Do App Backend

## Description

This is the backend service for the To-Do App. It provides a RESTful API for managing to-do items, including creating, reading, updating, and deleting tasks. The backend is built using Node.js and Express, and it uses MongoDB as the database to store the to-do items. Authentication is handled using JSON Web Tokens (JWT) to ensure that only authorized users can access and modify their to-do items.

Key features of the backend service include:

- **User Authentication**: Secure user authentication using JWT.
- **CRUD Operations**: Create, read, update, and delete to-do items.
- **Data Validation**: Ensure data integrity with validation rules.
- **Error Handling**: Comprehensive error handling for robust API responses.
- **Scalability**: Designed to handle a large number of to-do items and users.

## Installation

To set up the project locally, follow these steps:

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/to-do-app-backend.git
   ```
2. Navigate to the project directory:
   ```bash
   cd to-do-app-backend
   ```
3. Install the dependencies:
   ```bash
   npm install
   ```
4. Set up the environment variables:
   Create a `.env` file in the root directory and add the following variables:
   ```plaintext
   PORT=3000
   DATABASE_URL=your_database_url
   JWT_SECRET=your_jwt_secret
   ```

## Usage

To start the server, run:

```bash
npm start
```

The server will be running on `http://localhost:3000`.

## Endpoints

Here are the available API endpoints:

### Get All To-Do Items

- **URL**: `/api/todos`
- **Method**: `GET`
- **Description**: Get all to-do items.
- **Response**:
  ```json
  [
    {
      "id": "1",
      "title": "Sample To-Do",
      "description": "This is a sample to-do item",
      "completed": false
    }
  ]
  ```

### Get To-Do Item by ID

- **URL**: `/api/todos/:id`
- **Method**: `GET`
- **Description**: Get a single to-do item by ID.
- **Response**:
  ```json
  {
    "id": "1",
    "title": "Sample To-Do",
    "description": "This is a sample to-do item",
    "completed": false
  }
  ```

### Create a New To-Do Item

- **URL**: `/api/todos`
- **Method**: `POST`
- **Description**: Create a new to-do item.
- **Request**:
  ```json
  {
    "title": "New To-Do",
    "description": "Description of the new to-do item"
  }
  ```
- **Response**:
  ```json
  {
    "id": "2",
    "title": "New To-Do",
    "description": "Description of the new to-do item",
    "completed": false
  }
  ```

### Update a To-Do Item by ID

- **URL**: `/api/todos/:id`
- **Method**: `PUT`
- **Description**: Update a to-do item by ID.
- **Request**:
  ```json
  {
    "title": "Updated To-Do",
    "description": "Updated description",
    "completed": true
  }
  ```
- **Response**:
  ```json
  {
    "id": "1",
    "title": "Updated To-Do",
    "description": "Updated description",
    "completed": true
  }
  ```

### Delete a To-Do Item by ID

- **URL**: `/api/todos/:id`
- **Method**: `DELETE`
- **Description**: Delete a to-do item by ID.
- **Response**:
  ```json
  {
    "message": "To-Do item deleted successfully"
  }
  ```

## Technologies

This project uses the following technologies:

- Node.js
- Express
- MongoDB
- Mongoose
- JSON Web Token (JWT)

## Contributing

To contribute to this project, follow these steps:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature-branch`).
3. Make your changes.
4. Commit your changes (`git commit -m 'Add some feature'`).
5. Push to the branch (`git push origin feature-branch`).
6. Open a pull request.

## License

This project is licensed under the Rezwan License.
