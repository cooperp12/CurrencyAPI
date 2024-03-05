import { jsonParser } from '../src/helpFunctions'
import { getMongoClient } from '../src/helpFunctions'
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common'
import { MongoClient, Collection, Decimal128 } from 'mongodb'
import { CurrencyObject } from './models'

export
@Injectable()
class MongoService implements OnModuleInit, OnModuleDestroy {
	private collectionsRef!: Collection<CurrencyObject>
	private mongoDBClient!: MongoClient
	private authInfoPath = './schema.json'
	private collectionName = 'currency_data'
	private schemaPath = './schema.json'

	async onModuleInit() {
		try {
			// Parse the JSON data for the schema
			const schema = await jsonParser(this.schemaPath)

			// Destructure the result from getMongoClient
			const { collectionsRef, mongoDBClient } = await getMongoClient(
				this.collectionName,
				this.authInfoPath,
				schema
			)

			// Assign these to the instance
			this.collectionsRef = collectionsRef
			this.mongoDBClient = mongoDBClient
		} catch (err) {
			console.error('Error connecting to MongoDB:', err)
			throw err
		}
	}

	async addDataToDB(currencyDataJSON: any): Promise<void> {
		try {
			console.log('Collection Name: ' + this.collectionName)

			// Assuming currencyDataJSON is already in the format of CurrencyObject[]
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

				const currencyData: Record<string, any> = {}
				let isValidCurrencyData = true

				for (const [currency, data] of Object.entries(
					currencyObject.CurrencyCode
				)) {
					if (
						!data ||
						typeof data !== 'object' ||
						data.AUDPerUnit === undefined ||
						data.UnitsPerAUD === undefined
					) {
						console.error(`Invalid currency data for ${currency}`)
						isValidCurrencyData = false
						break
					}

					currencyData[currency] = {
						AUDPerUnit: Decimal128.fromString(data.AUDPerUnit.toString()),
						UnitsPerAUD: Decimal128.fromString(
							data.UnitsPerAUD.toString()
						),
					}
				}

				if (
					!isValidCurrencyData ||
					Object.keys(currencyData).length === 0
				) {
					console.error('Skipping currency object due to invalid data.')
					continue
				}

				currencyObject.CurrencyCode = currencyData
				validData.push(currencyObject)
			}

			if (validData.length > 0) {
				const insertResult = await this.collectionsRef.insertMany(validData)
				console.log(
					`Inserted ${insertResult.insertedCount} documents into the collection.`
				)
			} else {
				console.log('No valid documents to insert.')
			}
		} catch (error) {
			console.error('Error adding data to DB:', error)
			throw error // Rethrow or handle as necessary
		}
	}

	async removeDataByDate(date: string): Promise<void> {
		try {
			const result = await this.collectionsRef.deleteMany({
				Date: new Date(date),
			})
			console.log(`Deleted ${result.deletedCount} documents.`)
		} catch (error) {
			console.error('Error removing data from DB:', error)
			throw error // Rethrow or handle as necessary
		}
	}

	async getCurrencyData(specificDate?: string): Promise<CurrencyObject[]> {
		let query = {}
		if (specificDate) {
			// Ensuring the date is set to midnight UTC
			const dateAtMidnightUTC = new Date(specificDate + 'T00:00:00.000Z')
			query = { Date: dateAtMidnightUTC }
		}

		const options = specificDate ? {} : { limit: 5 } // Limit to 5 if no specific date is provided
		try {
			const data = await this.collectionsRef.find(query, options).toArray()
			console.log(`Found ${data.length} documents.`)
			return data
		} catch (error) {
			console.error('Error retrieving data from DB:', error)
			throw error // Rethrow or handle as necessary
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

	async dropCollection(): Promise<void> {
		try {
			await this.collectionsRef.drop()
			console.log('The collection has been successfully dropped.')
		} catch (error) {
			console.error(
				'Error dropping the collection:',
				error instanceof Error ? error.message : error
			)
			throw error // Re-throw the error to handle it further up the call stack if necessary
		}
	}

	getClient() {
		return this.mongoDBClient
	}
}
