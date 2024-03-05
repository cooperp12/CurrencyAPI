"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MongoService = void 0;
const tslib_1 = require("tslib");
const helpFunctions_1 = require("../src/helpFunctions");
const helpFunctions_2 = require("../src/helpFunctions");
const common_1 = require("@nestjs/common");
const mongodb_1 = require("mongodb");
let MongoService = class MongoService {
    constructor() {
        this.authInfoPath = './schema.json';
        this.collectionName = 'currency_data';
        this.schemaPath = './schema.json';
    }
    async onModuleInit() {
        try {
            // Parse the JSON data for the schema
            const schema = await (0, helpFunctions_1.jsonParser)(this.schemaPath);
            // Destructure the result from getMongoClient
            const { collectionsRef, mongoDBClient } = await (0, helpFunctions_2.getMongoClient)(this.collectionName, this.authInfoPath, schema);
            // Assign these to the instance
            this.collectionsRef = collectionsRef;
            this.mongoDBClient = mongoDBClient;
        }
        catch (err) {
            console.error('Error connecting to MongoDB:', err);
            throw err;
        }
    }
    async addDataToDB(currencyDataJSON) {
        try {
            console.log('Collection Name: ' + this.collectionName);
            // Assuming currencyDataJSON is already in the format of CurrencyObject[]
            const currencyDataArray = Object.values(currencyDataJSON);
            const validData = [];
            for (const currencyObject of currencyDataArray) {
                if (!currencyObject.Date ||
                    isNaN(new Date(currencyObject.Date).getTime())) {
                    console.error('Invalid or missing date for currency object:', currencyObject);
                    continue; // Skip this object and move to the next one
                }
                currencyObject.Date = new Date(currencyObject.Date);
                const currencyData = {};
                let isValidCurrencyData = true;
                for (const [currency, data] of Object.entries(currencyObject.CurrencyCode)) {
                    if (!data ||
                        typeof data !== 'object' ||
                        data.AUDPerUnit === undefined ||
                        data.UnitsPerAUD === undefined) {
                        console.error(`Invalid currency data for ${currency}`);
                        isValidCurrencyData = false;
                        break;
                    }
                    currencyData[currency] = {
                        AUDPerUnit: mongodb_1.Decimal128.fromString(data.AUDPerUnit.toString()),
                        UnitsPerAUD: mongodb_1.Decimal128.fromString(data.UnitsPerAUD.toString()),
                    };
                }
                if (!isValidCurrencyData ||
                    Object.keys(currencyData).length === 0) {
                    console.error('Skipping currency object due to invalid data.');
                    continue;
                }
                currencyObject.CurrencyCode = currencyData;
                validData.push(currencyObject);
            }
            if (validData.length > 0) {
                const insertResult = await this.collectionsRef.insertMany(validData);
                console.log(`Inserted ${insertResult.insertedCount} documents into the collection.`);
            }
            else {
                console.log('No valid documents to insert.');
            }
        }
        catch (error) {
            console.error('Error adding data to DB:', error);
            throw error; // Rethrow or handle as necessary
        }
    }
    async removeDataByDate(date) {
        try {
            const result = await this.collectionsRef.deleteMany({
                Date: new Date(date),
            });
            console.log(`Deleted ${result.deletedCount} documents.`);
        }
        catch (error) {
            console.error('Error removing data from DB:', error);
            throw error; // Rethrow or handle as necessary
        }
    }
    async getCurrencyData(specificDate) {
        let query = {};
        if (specificDate) {
            // Ensuring the date is set to midnight UTC
            const dateAtMidnightUTC = new Date(specificDate + 'T00:00:00.000Z');
            query = { Date: dateAtMidnightUTC };
        }
        const options = specificDate ? {} : { limit: 5 }; // Limit to 5 if no specific date is provided
        try {
            const data = await this.collectionsRef.find(query, options).toArray();
            console.log(`Found ${data.length} documents.`);
            return data;
        }
        catch (error) {
            console.error('Error retrieving data from DB:', error);
            throw error; // Rethrow or handle as necessary
        }
    }
    async onModuleDestroy() {
        try {
            // Drop the collection before closing the connection
            console.log(`Dropping collection: ${this.collectionName}`);
            await this.dropCollection();
            console.log('MongoDB connection closed.');
        }
        catch (error) {
            console.error('Error during cleanup:', error);
        }
        finally {
            await this.mongoDBClient.close();
        }
    }
    async dropCollection() {
        try {
            await this.collectionsRef.drop();
            console.log('The collection has been successfully dropped.');
        }
        catch (error) {
            console.error('Error dropping the collection:', error instanceof Error ? error.message : error);
            throw error; // Re-throw the error to handle it further up the call stack if necessary
        }
    }
    getClient() {
        return this.mongoDBClient;
    }
};
exports.MongoService = MongoService;
exports.MongoService = MongoService = tslib_1.__decorate([
    (0, common_1.Injectable)()
], MongoService);
