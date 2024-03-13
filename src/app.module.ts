import { Module } from '@nestjs/common'
import { CurrencyModule } from '../interfaces/currency.module'

@Module({
	imports: [CurrencyModule],
})
export class AppModule {
    close(close: any) {
        throw new Error('Method not implemented.')
    }
    listen: any
}
