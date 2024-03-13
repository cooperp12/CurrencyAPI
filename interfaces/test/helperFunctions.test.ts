import { MongoClient } from 'mongodb';
import { getMongoClient, validateEnvironmentVariables } from '../helpFunctions';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

jest.mock('fs', () => ({
  readFileSync: jest.fn().mockReturnValue(true),
}));

jest.mock('dotenv', () => ({
  config: jest.fn(),
}));

jest.mock('mongodb', () => {
  const actualMongoDB = jest.requireActual('mongodb');
  
  const mockDbMethod = jest.fn().mockReturnValue({
    createCollection: jest.fn().mockResolvedValue(true),
    collection: jest.fn().mockReturnValue({}),
  });

  return {
    ...actualMongoDB,
    MongoClient: {
      connect: jest.fn().mockImplementation(() => Promise.resolve({ db: mockDbMethod })),
    },
  };
});

describe('getMongoClient', () => {
  let originalEnv: NodeJS.ProcessEnv;
  let mockConsoleLog: jest.SpyInstance;

  beforeAll(() => {
    originalEnv = process.env; // Save the original process.env
    process.env = { ...originalEnv, LOGIN: 'testUser', PASSWORD: 'testPassword', CLUSTER: 'testCluster' };
    dotenv.config();
  });

  afterAll(() => {
    process.env = originalEnv; // Restore original process.env after all tests
  });

  beforeEach(() => {
    // Mock console.log to prevent it from outputting anything during tests
    mockConsoleLog = jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    mockConsoleLog.mockRestore(); // Restore original console.log after each test
  });

  it('successfully connects using the schema from schema.json', async () => {
    const collectionName = 'testCollection';
    const schemaPath = path.join(__dirname, '../../schema.json');
    const mockSchema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));

    const { collectionsRef, mongoDBClient } = await getMongoClient(collectionName, mockSchema);

    expect(MongoClient.connect).toHaveBeenCalled();
    expect(collectionsRef).toBeDefined();
    expect(mongoDBClient).toBeDefined();
  });

});
