import { readFileSync } from 'fs'
import { MongoClient, Collection, Db } from 'mongodb'
import * as dotenv from 'dotenv'
import { Environment, CurrencyObject } from '../interfaces/models'
dotenv.config()

const fs = {
	readFileSync: readFileSync,
}

export async function jsonParser(schemaPath: string) {
	// Read the content of the JSON file
	const data = fs.readFileSync(schemaPath, 'utf8')

	// Parse the JSON data
	const schema = JSON.parse(data)

	return schema
}


// Helper function to validate and extract environment variables
function validateEnvironmentVariables(env: NodeJS.ProcessEnv): Environment {
	dotenv.config()
	//USERNAME here for env.USERNAME was treating 'r' as '/r' (?)_
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
	authInfoPath: string,
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
	} catch (err) {
		console.error(`Unable to connect to the server: ${err}`)
		throw err
	}
}
