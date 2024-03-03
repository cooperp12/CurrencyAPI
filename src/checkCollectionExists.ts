import { CurrencyObject } from '../interfaces/models'
import { Collection } from 'mongodb'

/*
export async function checkCollectionExistsAsync(
	db: Collection<CurrencyObject>,
	collectionName: string,
	expectedSchema: any
) {
	try {
		if (db.collectionName !== collectionName) {
			throw new Error(`Collection ${collectionName} not found.`)
		}

		const collection = db
		const firstDocument = await collection.findOne({})

		if (!firstDocument || Object.keys(firstDocument).length === 0) {
			console.log(
				`The collection ${collectionName} does not exist or is empty!`
			)
			return false
		} else {
			console.log(
				`The collection ${collectionName} exists and has at least one record!`
			)
			return true
		}
	} catch (error) {
		console.error(`Error checking collection: ${error}`)
		return false
	}
}
*/
