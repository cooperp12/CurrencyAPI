import { MongoClient, Collection, Decimal128, Db } from 'mongodb'
import * as dotenv from 'dotenv'
import { Environment, CurrencyObject } from '../interfaces/models'
dotenv.config()

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
	schema: JSON
): Promise<{ collectionsRef: Collection<any>; mongoDBClient: MongoClient }> {
	try {
		// Validate environment variables at the beginning
		const { USERNAME, PASSWORD, CLUSTER } = validateEnvironmentVariables(
			process.env
		)

		// Construct MongoDB URI using validated environment variables
		const uri = `mongodb+srv://${encodeURIComponent(USERNAME)}:${encodeURIComponent(PASSWORD)}@${encodeURIComponent(CLUSTER)}/?retryWrites=true&w=majority&appName=Cluster0`

		// Include the schema when creating the client
		const mongoDBClient = await MongoClient.connect(uri)
		const db: Db = mongoDBClient.db(collectionName)

		await db.createCollection(collectionName, { validator: schema })

		// Try to get the collection, if it doesn't exist, it will be created implicitly
		const collectionsRef: Collection<CurrencyObject> =
			db.collection<CurrencyObject>(collectionName)

		return { collectionsRef, mongoDBClient }
	} catch (err) {
		console.error(`Unable to connect to the server: ${err}`)
		throw err
	}
}
