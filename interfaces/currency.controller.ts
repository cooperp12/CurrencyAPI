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

export
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
