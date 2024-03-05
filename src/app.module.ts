import { Module } from '@nestjs/common';
import { CurrencyModule } from '../interfaces/currency.module';


@Module({
	imports: [CurrencyModule],
})

export class AppModule {}