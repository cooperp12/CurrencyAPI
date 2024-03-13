import { HttpException, HttpStatus } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { HealthCheckController } from '../healthcheck.controller';
import { MongoService } from '../currency.service';

// Describe block defines a test suite for HealthCheckController
describe('HealthCheckController', () => {
  let healthCheckController: HealthCheckController;
  let mongoService: jest.Mocked<MongoService>;
  let originalConsoleError: jest.SpyInstance; 

  // beforeEach is a setup function that runs before each test in this suite
  beforeEach(async () => {
    // Mocks console.error to prevent actual error logging during tests for cleaner test output
  // Mocks console.error to prevent actual error logging during tests for cleaner test output
  originalConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
  
  // Mock console.log to prevent it from outputting anything during tests
  jest.spyOn(console, 'log').mockImplementation(() => {});
  
    // Mocks MongoDB client with jest.fn().mockReturnThis() for method chaining and mockResolvedValue for async methods
    const mockMongoClient = {
      db: jest.fn().mockReturnThis(),
      admin: jest.fn().mockReturnThis(),
      ping: jest.fn().mockResolvedValue(true), // Simulates successful database ping
      close: jest.fn(),
    };

    // Initializes the Nest testing module with HealthCheckController and a mocked MongoService
    const moduleRef = await Test.createTestingModule({
      controllers: [HealthCheckController],
      providers: [
        {
          provide: MongoService,
          useValue: {
            getMongoClient: jest.fn().mockResolvedValue(mockMongoClient),
            onModuleInit: jest.fn(),
            onModuleDestroy: jest.fn(),
          },
        },
      ],
    }).compile();

    // Retrieves instances of HealthCheckController and MongoService for testing
    healthCheckController = moduleRef.get<HealthCheckController>(HealthCheckController);
    mongoService = moduleRef.get<MongoService>(MongoService) as jest.Mocked<MongoService>;
  });

  // afterEach is a teardown function that runs after each test in this suite
  afterEach(() => {
    // Restores the original console.error functionality
    originalConsoleError.mockRestore(); 
  });

  // Tests successful MongoDB connection scenario
  it('should return "MongoDB connection is healthy" on successful connection', async () => {
    const response = await healthCheckController.checkMongoConnection();
    expect(response).toBe('MongoDB connection is healthy');
    // Verifies that the MongoDB ping method was called, indicating a connection check
    expect((await mongoService.getMongoClient()).db().admin().ping).toHaveBeenCalled();
  });

  // Tests failed MongoDB connection scenario
  it('should throw an HttpException when the connection fails', async () => {
    // Mocks getMongoClient to simulate a failed database connection
    (mongoService.getMongoClient as jest.Mock).mockRejectedValue(new Error('Connection failed'));

    // Asserts that the method throws an HttpException with the expected message and status
    await expect(healthCheckController.checkMongoConnection()).rejects.toThrow(HttpException);
    await expect(healthCheckController.checkMongoConnection()).rejects.toHaveProperty('message', 'Failed to connect to the database.');
    await expect(healthCheckController.checkMongoConnection()).rejects.toHaveProperty('status', HttpStatus.INTERNAL_SERVER_ERROR);
  });
});
