import { Collection } from 'mongodb'
import { CurrencyObject } from '../interfaces/models'

/*
export async function dropCollections(
	db: Collection<CurrencyObject>,
	collectionName: string
): Promise<void> {
	try {
		// Use the `Db` object to drop the collection
		await db.drop()
		console.log('The collection has been successfully dropped.')
	} catch (error) {
		console.error(
			'Error dropping the collection:',
			error instanceof Error ? error.message : error
		)
		throw error // Re-throw the error to handle it further up the call stack if necessary
	}
}
*/
