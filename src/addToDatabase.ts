import { Collection, Decimal128 } from 'mongodb'
import { CurrencyObject } from '../interfaces/models'

/*
export async function addDataToDB(
	db: Collection<CurrencyObject>,
	collectionName: string,
	schema: JSON,
	currencyDataJSON: JSON
): Promise<void> {
	try {
		console.log('Collection Name: ' + collectionName)

		const currencyDataArray: CurrencyObject[] =
			Object.values(currencyDataJSON)
		const validData: CurrencyObject[] = []

		for (const currencyObject of currencyDataArray) {
			try {
				if (
					!currencyObject.CurrencyCode ||
					typeof currencyObject.CurrencyCode !== 'object'
				) {
					console.error('CurrencyCode is missing or not an object')
					continue
				}

				// Date validation
				if (
					!currencyObject.Date ||
					isNaN(new Date(currencyObject.Date).getTime())
				) {
					console.error('Invalid or missing date')
					continue
				}

				currencyObject.Date = new Date(currencyObject.Date)

				const currencyData: Record<string, unknown> = {}
				let isValidCurrencyData = true

				for (const [currency, data] of Object.entries(
					currencyObject.CurrencyCode
				)) {
					if (
						!data ||
						typeof data !== 'object' ||
						!data.AUDPerUnit ||
						!data.UnitsPerAUD
					) {
						console.error(`Invalid currency data for ${currency}`)
						isValidCurrencyData = false
						break // Breaks out of the current loop if any currency data is invalid
					}

					try {
						currencyData[currency] = {
							AUDPerUnit: Decimal128.fromString(
								data.AUDPerUnit.toString()
							),
							UnitsPerAUD: Decimal128.fromString(
								data.UnitsPerAUD.toString()
							),
						}
					} catch (e) {
						console.error(
							`Error converting currency data for ${currency}: ${e}`
						)
						isValidCurrencyData = false
						break // Assumes conversion failure as invalid data
					}
				}

				if (
					!isValidCurrencyData ||
					Object.keys(currencyData).length === 0
				) {
					console.error(`Skipping currency object due to invalid data.`)
					continue
				}

				currencyObject.CurrencyCode =
					currencyData as CurrencyObject['CurrencyCode']

				validData.push(currencyObject)
			} catch (error) {
				console.error(
					`Error processing data: ${(error as Error).message || error}`
				)
			}
		}

		if (validData.length > 0) {
			const result = await db.insertMany(validData)
			console.log(`${result.insertedCount} documents inserted.`)
		} else {
			console.log('No valid documents to insert.')
		}
	} catch (error) {
		console.error(
			`Error reading or inserting data into the database: ${(error as Error).message || error}`
		)
		throw error
	}
}
*/
