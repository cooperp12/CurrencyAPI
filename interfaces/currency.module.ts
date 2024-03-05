import { Module } from '@nestjs/common'
import { CurrencyDataController } from './currency.controller'
import { HealthCheckController } from './healthcheck.controller'
import { MongoService } from './currency.service'

@Module({
	controllers: [HealthCheckController, CurrencyDataController],
	providers: [MongoService],
})
export class CurrencyModule {}
