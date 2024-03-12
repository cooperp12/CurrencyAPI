import { jsonParser } from '../src/helpFunctions'
import { getMongoClient } from '../src/helpFunctions'
import {
	Injectable,
	OnModuleInit,
	OnModuleDestroy,
	HttpException,
	HttpStatus,
} from '@nestjs/common'
import { MongoClient, Collection, Decimal128 } from 'mongodb'
import { CurrencyCode, CurrencyObject } from './models'

export
@Injectable()
class MongoService implements OnModuleInit, OnModuleDestroy {
	private collectionsRef!: Collection<CurrencyObject>
	private mongoDBClient!: MongoClient
	private collectionName = 'currency_data'
	private schemaPath = './schema.json'

	public async getCollectionRef() {
		return this.collectionsRef
	}

	public async getMongoClient() {
		return this.mongoDBClient
	}

	async onModuleInit() {
		try {
			// Parse the JSON data for the schema
			const schema = await jsonParser(this.schemaPath)

			// Destructure the result from getMongoClient
			const { collectionsRef, mongoDBClient } = await getMongoClient(
				this.collectionName,
				schema
			)

			// Assign these to the instance
			this.collectionsRef = collectionsRef
			this.mongoDBClient = mongoDBClient
		} catch (err) {
			console.error('Error connecting to MongoDB:', err)
			throw new HttpException(
				'Failed to add data to the database.',
				HttpStatus.INTERNAL_SERVER_ERROR
			)
		}
	}

	async addDataToDB(
		currencyDataJSON: JSON,
		collectionsRef: Collection<CurrencyObject>
	): Promise<Boolean> {
		try {
			let insertError: Error[] = []
			// Creating an array of the JSON object
			const currencyDataArray: CurrencyObject[] =
				Object.values(currencyDataJSON)
			const validData: CurrencyObject[] = []

			for (const currencyObject of currencyDataArray) {
				if (
					!currencyObject.Date ||
					isNaN(new Date(currencyObject.Date).getTime())
				) {
					console.error(
						'Invalid or missing date for currency object:',
						currencyObject
					)
					continue // Skip this object and move to the next one
				}
				currencyObject.Date = new Date(currencyObject.Date)

				// Check if the record exists for the date
				const existingRecord = await collectionsRef.findOne({
					Date: currencyObject.Date,
				})
				if (existingRecord) {
					var errorString =
						`Date ${currencyObject.Date.toISOString()} is already in the database`.toString()
					insertError.push(new Error(errorString))
					console.error(errorString)
					continue // Skip this object as it already exists
				}

				// Initialize the empty currencyData
				const currencyData: CurrencyCode = {}

				for (const [currency, data] of Object.entries(
					currencyObject.CurrencyCode
				)) {
					currencyData[currency] = {
						AUDPerUnit: Decimal128.fromString(data.AUDPerUnit.toString()),
						UnitsPerAUD: Decimal128.fromString(
							data.UnitsPerAUD.toString()
						),
					}
				}

				currencyObject.CurrencyCode = currencyData
				validData.push(currencyObject)
			}

			if (validData.length > 0) {
				const insertResult = await collectionsRef.insertMany(validData)
				console.log(
					`Inserted ${insertResult.insertedCount} documents into the collection.`
				)
				return true
			} else {
				if (insertError.length > 0) {
					const aggregatedError: Error = new Error(
						'Multiple errors occurred during insertion.'
					)
					for (const error of insertError) {
						aggregatedError.message += `\n${error.message}`
					}
					return false
				}
				console.log('No valid documents to insert.')
				return false
			}
		} catch (error) {
			console.error('Error adding data to DB:', error)
			// Error when there is a connection issue
			throw new HttpException(
				'Failed to add data to the database.',
				HttpStatus.INTERNAL_SERVER_ERROR
			)
		}
	}
	async removeDataByDate(date: string): Promise<boolean> {
		try {
			const result = await this.collectionsRef.deleteMany({
				Date: new Date(date),
			})
			console.log(`Deleted ${result.deletedCount} documents.`)
			return true // Operation was successful
		} catch (error) {
			console.error('Error removing data from DB:', error)
			return false // Instead of throwing an error, return false to indicate failure
		}
	}

	async getCurrencyData(specificDate?: string): Promise<CurrencyObject[]> {
		let query = {}
		if (specificDate) {
			// Ensuring the date is set to midnight UTC
			const dateAtMidnightUTC = new Date(specificDate + 'T00:00:00.000Z')
			query = { Date: dateAtMidnightUTC }
		}

		// Limit to 5 if no specific date is provided
		const options = specificDate ? {} : { limit: 5 }
		try {
			const data = await this.collectionsRef.find(query, options).toArray()
			console.log(`Found ${data.length} documents.`)
			return data
		} catch (error) {
			console.error('Error retrieving data from DB:', error)
			throw error
		}
	}

	async onModuleDestroy() {
		try {
			// Drop the collection before closing the connection
			console.log(`Dropping collection: ${this.collectionName}`)
			await this.dropCollection()
			console.log('MongoDB connection closed.')
		} catch (error) {
			console.error('Error during cleanup:', error)
		} finally {
			await this.mongoDBClient.close()
		}
	}

	async dropCollection(): Promise<boolean> {
		try {
			await this.collectionsRef.drop()
			console.log('The collection has been successfully dropped.')
			return true
		} catch (error) {
			console.error(
				'Error dropping the collection:',
				error instanceof Error ? error.message : error
			)
			return false
		}
	}
}
