import { CurrencyObject } from '../interfaces/models'
import { Collection } from 'mongodb'

/*
export async function displayAllData(
	db: Collection<CurrencyObject>,
	collectionName: string,
	specificDate?: string
) {
	try {
		const collection = db
		let query = {}

		if (specificDate) {
			// Construct the date in a way that always sets it to midnight UTC
			// Mongo likes Dates in a specific way YYYY-MM-DD is not a Date on its own.
			const dateAtMidnightUTC = new Date(specificDate + 'T00:00:00.000Z')
			query = { Date: dateAtMidnightUTC }
		}

		const allData = await collection.find(query).toArray()

		console.log(
			'Data in the Collection' +
				(specificDate ? ` for ${specificDate}` : '') +
				':'
		)
		allData.forEach((data) => {
			console.log('Date:', data.Date.toISOString())
			console.log('Currency Code:')
			Object.entries(data.CurrencyCode).forEach(([currency, value]) => {
				console.log(
					`${currency}:`,
					`AUDPerUnit: ${value.AUDPerUnit.toString()}, UnitsPerAUD: ${value.UnitsPerAUD.toString()}`
				)
			})
			console.log('\n')
		})
	} catch (error) {
		console.error(
			'Error displaying data:',
			(error as Error).message || 'Unknown error'
		)
	}
*/