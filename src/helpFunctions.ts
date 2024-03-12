import { readFileSync } from 'fs'
import { MongoClient, Collection, Db } from 'mongodb'
import * as dotenv from 'dotenv'
import { Environment, CurrencyObject } from '../interfaces/models'
dotenv.config()

const fs = {
	readFileSync: readFileSync,
}

export async function jsonParser(schemaPath: string) {
	let data

	try {
		// Read the content of the JSON file
		data = fs.readFileSync(schemaPath, 'utf8')
	} catch (error) {
		console.error(`Unable to read in JSON object: ${error}`)
		throw error
	}

	// Parse the JSON data
	const schema = JSON.parse(data)

	return schema
}

// Helper function to validate and extract environment variables
function validateEnvironmentVariables(env: NodeJS.ProcessEnv): Environment {
	//try to read in the .env, if it does not exist throw an error
	if (!fs.readFileSync('.env', 'utf8')) {
		throw new Error('.env file does not exist.')
	}

	dotenv.config()
	//USERNAME here for env.USERNAME was concatenating it
	const USERNAME = env.LOGIN
	const PASSWORD = env.PASSWORD
	const CLUSTER = env.CLUSTER

	if (!USERNAME || !PASSWORD || !CLUSTER) {
		// Throw a more specific error if you like
		throw new Error(
			'One or more required environment variables are missing or invalid.'
		)
	}

	return { USERNAME, PASSWORD, CLUSTER }
}

export async function getMongoClient(
	collectionName: string,
	schema: any // Adjusted from JSON to any for flexibility with MongoDB schema validation
): Promise<{
	collectionsRef: Collection<CurrencyObject>
	mongoDBClient: MongoClient
}> {
	// Changed return type to include Db instead of MongoClient
	try {
		const { USERNAME, PASSWORD, CLUSTER } = validateEnvironmentVariables(
			process.env
		)

		const uri = `mongodb+srv://${encodeURIComponent(USERNAME)}:${encodeURIComponent(PASSWORD)}@${encodeURIComponent(CLUSTER)}/?retryWrites=true&w=majority&appName=Cluster0`

		const mongoDBClient = await MongoClient.connect(uri)
		const db: Db = mongoDBClient.db(collectionName)

		await db.createCollection(collectionName, { validator: schema })

		const collectionsRef: Collection<CurrencyObject> =
			db.collection<CurrencyObject>(collectionName)

		return { collectionsRef, mongoDBClient } // Changed to return db instead of mongoDBClient directly
	} catch (error) {
		console.error(`Unable to connect to the server: ${error}`)
		throw error
	}
}

export async function iterateOver(
	jsonData: CurrencyObject[],
	numberOfIterations: number
): Promise<void> {
	// Loop through each object in the data array
	jsonData.forEach((obj: CurrencyObject) => {
		// Extract the Date and CurrencyCode from the object
		const date = obj.Date
		const currencyCodes = obj.CurrencyCode

		console.log('\nDate:', date.toDateString())

		// Iterate through the keys of the CurrencyCode object
		// and log the first five currency codes along with their prices
		let count = 0
		for (const currencyCode in currencyCodes) {
			if (count < numberOfIterations) {
				const priceInfo = currencyCodes[currencyCode]
				console.log(`CurrencyCode: ${currencyCode}`)

				console.log(
					'\t\tAUDPerUnit:\t' + currencyCodes[currencyCode].AUDPerUnit
				)
				console.log(
					'\t\tUnitsPerAUD:\t' + currencyCodes[currencyCode].UnitsPerAUD
				)

				count++
			} else {
				break
			}
		}
	})
}
