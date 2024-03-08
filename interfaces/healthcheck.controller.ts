import { Controller, Get, HttpException, HttpStatus } from '@nestjs/common'
import { MongoService } from './currency.service'

@Controller('health-check')
export class HealthCheckController {
	constructor(private readonly mongoService: MongoService) {}

	@Get()
	async checkMongoConnection() {
		try {
			const client = await this.mongoService.getMongoClient()
			await client.db().admin().ping()
			return 'MongoDB connection is healthy'
		} catch (error) {
			console.error('MongoDB connection error:', error)
			throw new HttpException(
				'Failed to connect to the database.',
				HttpStatus.INTERNAL_SERVER_ERROR
			)
		}
	}
}
