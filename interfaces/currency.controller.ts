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
import { CurrencyObject } from './models';

@Controller('currency-data')
export class CurrencyDataController {
	constructor(private readonly mongoService: MongoService) {}

	@Post('add')
	async addCurrencyData(@Body() currencyDataJSON: any) {
		//console.log(currencyDataJSON); // Log the received data
		try {
			let insertDataBool: Boolean;
			insertDataBool = await this.mongoService.addDataToDB(
				currencyDataJSON,
				await this.mongoService.getCollectionRef()
			)
			
			if(insertDataBool) { 
				return {message: 'Data successfully added to the database.'} 
			} else{
				return {message: 'Data was NOT added to the database.'} 
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
			// data was used as it may be one or many objects in the collection
			const data = await this.mongoService.getCurrencyData(body.date);
			
			// Loop through each object in the data array
			data.forEach((obj: CurrencyObject) => {
				// Extract the Date and CurrencyCode from the object
				const date = obj.Date;
				const currencyCodes = obj.CurrencyCode;
				
				// Log the date
				console.log('\nDate:', date);
				
				// Iterate through the keys of the CurrencyCode object
				// and log the first five currency codes along with their prices
				let count = 0;
				for (const currencyCode in currencyCodes) {
					if (count < 5) {
						const priceInfo = currencyCodes[currencyCode];
						console.log(`CurrencyCode: ${currencyCode}`);

						console.log('AUDPerUnit: \t\t' + currencyCodes[currencyCode].AUDPerUnit)
						console.log('UnitsPerAUD: \t\t' + currencyCodes[currencyCode].UnitsPerAUD)

						count++;
					} else {
						break; // Break the loop after logging the first five currency codes
					}
				}
			});
	
			return { CurrencyObject: data };
		} catch (error) {
			console.error('Error getting data:', error);
			throw new HttpException(
				'Failed to get data from the database.',
				HttpStatus.INTERNAL_SERVER_ERROR
			);
		}
	}
	
}
