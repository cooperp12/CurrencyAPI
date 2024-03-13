import { INestApplication } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { bootstrap } from '../main';
import { AppModule } from '../app.module';

// Mock NestFactory with typed mocks
jest.mock('@nestjs/core', () => ({
  NestFactory: {
    create: jest.fn().mockImplementation(() => Promise.resolve({
      listen: jest.fn().mockResolvedValue('Application is listening'),
      close: jest.fn().mockResolvedValue(undefined),
      getUrl: jest.fn().mockResolvedValue('http://localhost:3000')
    })),
  },
}));

describe('bootstrap', () => {
  beforeAll(() => {
    // Mocking console.log
    console.log = jest.fn();

    // Mocking process.on
    process.on = jest.fn();
  });

  beforeEach(() => {
    // Reset mock functions before each test
    jest.clearAllMocks();
  });

  it('should call NestFactory.create with AppModule', async () => {
    await bootstrap();
    expect(NestFactory.create).toHaveBeenCalledWith(AppModule);
  });

  it('should call app.listen with port 3000', async () => {
    await bootstrap();
    const mockCreate = NestFactory.create as jest.MockedFunction<typeof NestFactory.create>;
    const mockApp = await mockCreate.mock.results[0].value;
    expect(mockApp.listen).toHaveBeenCalledWith(3000);
  });

  it('should log the correct URL after bootstrap', async () => {
    await bootstrap();
    expect(console.log).toHaveBeenCalledWith('Application is running on: http://localhost:3000');
  });

  it('should register SIGINT and SIGTERM signal handlers', async () => {
    await bootstrap();
    expect(process.on).toHaveBeenCalledWith('SIGINT', expect.any(Function));
    expect(process.on).toHaveBeenCalledWith('SIGTERM', expect.any(Function));
  });
});
