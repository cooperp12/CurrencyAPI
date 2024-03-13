import {
	Body,
	Controller,
	Delete,
	Get,
	HttpException,
	HttpStatus,
	Post,
} from '@nestjs/common'
import { MongoService } from './currency.service'
import { iterateOver } from './helpFunctions'

@Controller('currency-data')
export class CurrencyDataController {
	constructor(private readonly mongoService: MongoService) {}

	@Post('add')
	async addCurrencyData(@Body() currencyDataJSON: any) {
		//console.log(currencyDataJSON); // Log the received data
		try {
			let insertDataBool: Boolean
			insertDataBool = await this.mongoService.addDataToDB(
				currencyDataJSON,
				await this.mongoService.getCollectionRef()
			)

			if (insertDataBool) {
				return { message: 'Data successfully added to the database.' }
			} else {
				return { message: 'Data was NOT added to the database.' }
			}
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
			// requestedRecords may be one or many objects in the collection
			const requestedRecords = await this.mongoService.getCurrencyData(
				body.date
			)

			// helper function to reduce the code complexity shown
			//		Demonstrate the first five records to reduce output on console.log
			await iterateOver(requestedRecords, 5)

			// All records requested are returned to Postman
			return { CurrencyObject: requestedRecords }
		} catch (error) {
			console.error('Error getting data:', error)
			throw new HttpException(
				'Failed to get data from the database.',
				HttpStatus.INTERNAL_SERVER_ERROR
			)
		}
	}
}
