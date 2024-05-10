# Currency Data Management Service

This service is built using NestJS, a progressive Node.js framework for building efficient, reliable, and scalable server-side applications. It provides functionality to manage currency data within a MongoDB database, including adding, removing, and retrieving currency data.

## Features

- **Database Connection:** Utilizes MongoDB for storing currency data, with initial setup and schema validation.
- **Data Manipulation:** Supports adding new currency data, removing existing data by date, and fetching currency data for a specific date or the most recent entries.
- **Health Check:** A dedicated controller for checking the health of the MongoDB connection.
- **Graceful Shutdown:** Handles `SIGINT` and `SIGTERM` signals for graceful application shutdown.

## Installation

To set up the project, ensure you have Node.js and npm installed. Then follow these steps:

1. Clone the repository to your local machine.
2. Navigate to the project directory and run `npm install` to install the dependencies.
   2.1. You may need to run `npm install typescript` if you receive an error when TypeScript is compiling the code.
3. Ensure MongoDB is running and accessible. You will need to add a `.env` file with the appropriate variables.

### .env format
The .env file should contain the following three lines:

LOGIN="<YOUR_USERNAME>"
PASSWORD="<YOUR_PASSWORD>"
CLUSTER="<YOUR_CLUSTER_INFORMATION>"

Replace `<YOUR_USERNAME>`, `<YOUR_PASSWORD>`, and `<YOUR_CLUSTER_INFORMATION>` with your actual MongoDB username, password, and cluster information respectively.

For `CLUSTER`, only include the information after the `@` symbol and before the first forward slash `/` in your MongoDB connection string. Including any additional information may cause a connection failure.

For example, if your MongoDB connection string is:

`mongodb+srv://<LOGIN>:<PASSWORD>@<CLUSTER>>/?retryWrites=true&w=majority&appName=Cluster0`

You would extract the `<CLUSTER>` information and use that for the `CLUSTER` variable in your .env file.

Please ensure that your .env file matches this format. If you encounter any issues, you may need to edit the `helpFunctions.ts` file accordingly.

## Usage

The service exposes three main endpoints:

- `/health-check` for checking the database connection health.
- `/currency-data/add` for adding new currency data to the database.
- `/currency-data/remove` for removing currency data by date.
- `/currency-data/getInformation` for retrieving currency data by a specific date or the most recent data if no date is provided.

## Scripts

This project includes several npm scripts for development and production purposes:

- `npm run format`: Formats code using Prettier for consistent code style.
- `npm test`: To run the Jest test/s (Feature development is ongoing).
- `npm run build`: Compiles the TypeScript code into JavaScript, preparing it for execution.
- `npm run start`: Compiles the code and starts the application. Use this for production.
- `npm run start:dev`: Formats the code, compiles it, and starts the application with Node.js. Ideal for development environments.

## Dependencies

- **NestJS:** Provides the framework for building the application.
- **dotenv:** Loads environment variables from a `.env` file.
- **mongodb:** The MongoDB driver for Node.js, used for database interactions.
- **Typescript:** Adds static type definitions to JavaScript, improving reliability and maintainability.

## DevDependencies

- **@types/node:** Provides TypeScript type definitions for Node.js.
- **eslint:** A static code analysis tool for identifying problematic patterns in JavaScript code.
- **prettier:** An opinionated code formatter that supports multiple languages and integrates with most editors.
- **typescript:** The language the project is written in, adding types to JavaScript for safer coding.

