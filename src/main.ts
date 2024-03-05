import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'

async function bootstrap() {
	const app = await NestFactory.create(AppModule)
	await app.listen(3000)
	let url = await app.getUrl()
	// Replace `[::1]` with `localhost` if present in the URL
	url = url.replace('[::1]', 'localhost') 
	console.log(`Application is running on: ${url}`)

	process.on('SIGINT', async () => {
		console.log('SIGINT signal received: closing the application.')
		await app.close()
	})

	process.on('SIGTERM', async () => {
		console.log('SIGTERM signal received: closing the application.')
		await app.close()
	})
}


//npx prettier --write "**/*.ts"
bootstrap().catch((err) => {
	console.error('Error during application bootstrap:', err)
	process.exit(1)
})
