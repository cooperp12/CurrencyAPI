import { jsonParser } from './helpFunctions'
import { getMongoClient } from './setUpMongo'
import {
	Controller,
	Get,
	Post,
	Body,
	Module,
	Injectable,
	OnModuleInit,
	OnModuleDestroy,
	HttpException,
	HttpStatus,
	Put,
	Delete,
	Query,
} from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { MongoClient, Collection, Decimal128 } from 'mongodb'
import { CurrencyObject } from '../interfaces/models'
//TO-DO Update function handling
//import { addDataToDB } from './addToDatabase'
//import { dropCollections } from './dropCollections'
//import { checkCollectionExistsAsync } from './checkCollectionExists'
//import { displayAllData } from './displayAllData'

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

@Controller('health-check')
class HealthCheckController {
	constructor(private readonly mongoService: MongoService) {}

	@Get()
	async checkMongoConnection() {
		try {
			const client = this.mongoService.getClient()
			await client.db().admin().ping()
			return 'MongoDB connection is healthy'
		} catch (error) {
			console.error('MongoDB connection error:', error)
			return 'MongoDB connection is down'
		}
	}
}

@Controller('currency-data')
class CurrencyDataController {
	constructor(private readonly mongoService: MongoService) {}

	@Post('add')
	async addCurrencyData(@Body() currencyDataJSON: any) {
		//console.log(currencyDataJSON); // Log the received data
		try {
			await this.mongoService.addDataToDB(currencyDataJSON)
			return { message: 'Data successfully added to the database.' }
		} catch (error) {
			console.error('Error adding data:', error)
			throw new HttpException(
				'Failed to add data to the database.',
				HttpStatus.INTERNAL_SERVER_ERROR
			)
		}
	}

	@Delete('remove')
	async removeCurrencyDataByDate(@Body() body: { date: string }) {
		try {
			await this.mongoService.removeDataByDate(body.date)
			return { message: 'Data successfully removed from the database.' }
		} catch (error) {
			console.error('Error removing data:', error)
			throw new HttpException(
				'Failed to remove data from the database.',
				HttpStatus.INTERNAL_SERVER_ERROR
			)
		}
	}

	@Get('getInformation')
	async getCurrencyData(@Body() body: { date: string }) {
		try {
			const data = await this.mongoService.getCurrencyData(body.date)
			return { data: data }
		} catch (error) {
			console.error('Error getting data:', error)
			throw new HttpException(
				'Failed to get data from the database.',
				HttpStatus.INTERNAL_SERVER_ERROR
			)
		}
	}
}

@Module({
	controllers: [HealthCheckController, CurrencyDataController], // Add your new controller here
	providers: [MongoService],
})
class AppModule {}

async function bootstrap() {
	const app = await NestFactory.create(AppModule)
	await app.listen(3000)
	let url = await app.getUrl()
	url = url.replace('[::1]', 'localhost') // Replace `[::1]` with `localhost` if present in the URL
	console.log(`Application is running on: ${url}`)

	process.on('SIGINT', async () => {
		console.log('SIGINT signal received: closing the application.')
		await app.close()
	})

	process.on('SIGTERM', async () => {
		console.log('SIGTERM signal received: closing the application.')
		await app.close()
	})
}

//tsc -p tsconfig.json && node dist\src\main.js

//npx prettier --write "**/*.ts"
bootstrap().catch((err) => {
	console.error('Error during application bootstrap:', err)
	process.exit(1)
})
