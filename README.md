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
3. Ensure MongoDB is running and accessible.
4. Start the application by running `npm start`.

## Usage

The service exposes three main endpoints:

- `/health-check` for checking the database connection health.
- `/currency-data/add` for adding new currency data to the database.
- `/currency-data/remove` for removing currency data by date.
- `/currency-data/getInformation` for retrieving currency data by a specific date or the most recent data if no date is provided.

## Development

- Use `tsc -p tsconfig.json` to compile TypeScript files.
- Use `npx prettier --write "**/*.ts"` to format the code.

## Contributing

Contributions to the project are welcome. Please ensure to follow the project's coding standards and submit your pull requests for review.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
