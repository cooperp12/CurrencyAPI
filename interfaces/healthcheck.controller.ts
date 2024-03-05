import { Controller, Get } from '@nestjs/common'
import { MongoService } from './currency.service'

@Controller('health-check')
export class HealthCheckController {
	constructor(private readonly mongoService: MongoService) {}

	@Get()
	async checkMongoConnection() {
		try {
			const client = this.mongoService.getClient()
			await client.db().admin().ping()
			return 'MongoDB connection is healthy'
		} catch (error) {
			console.error('MongoDB connection error:', error)
			return 'MongoDB connection is down'
		}
	}
}
