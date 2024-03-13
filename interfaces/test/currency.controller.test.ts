import { Test } from '@nestjs/testing';
import { HttpException } from '@nestjs/common';
import { CurrencyDataController } from '../currency.controller';
import { MongoService } from '../currency.service';
import { Decimal128 } from 'mongodb';

const mockData = [{
  Date: new Date('2022-01-01'),
  CurrencyCode: {
    USD: {
      AUDPerUnit: Decimal128.fromString('1.30'),
      UnitsPerAUD: Decimal128.fromString('0.77'),
    },
  },
}];

describe('CurrencyDataController', () => {
  let currencyDataController: CurrencyDataController;
  let mongoService: jest.Mocked<MongoService>;
  let originalConsoleError: jest.SpyInstance;
  let mockConsoleLog: jest.SpyInstance;

  beforeEach(async () => {
    originalConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

    // Mock console.log to prevent it from outputting anything during tests
    mockConsoleLog = jest.spyOn(console, 'log').mockImplementation(() => {});

    const moduleRef = await Test.createTestingModule({
      controllers: [CurrencyDataController],
      providers: [
        {
          provide: MongoService,
          useValue: {
            addDataToDB: jest.fn(),
            getCollectionRef: jest.fn(),
            removeDataByDate: jest.fn().mockResolvedValue(true),
            getCurrencyData: jest.fn(),
          },
        },
      ],
    }).compile();

    currencyDataController = moduleRef.get<CurrencyDataController>(CurrencyDataController);
    mongoService = moduleRef.get<MongoService>(MongoService) as jest.Mocked<MongoService>;
  });

  afterEach(() => {
    originalConsoleError.mockRestore();
    mockConsoleLog.mockRestore();
  });

  describe('addCurrencyData', () => {
    it('should return success message when data is added', async () => {
      mongoService.addDataToDB.mockResolvedValue(true);
      const response = await currencyDataController.addCurrencyData(mockData[0]);
      expect(response.message).toBe('Data successfully added to the database.');
    });

    it('should throw HttpException when adding data fails', async () => {
      mongoService.addDataToDB.mockRejectedValue(new Error('Fail'));
      await expect(currencyDataController.addCurrencyData(mockData[0])).rejects.toThrow(HttpException);
    });
  });

  describe('removeCurrencyDataByDate', () => {
    it('should return success message when data is removed', async () => {
      mongoService.removeDataByDate.mockResolvedValue(true);
      const response = await currencyDataController.removeCurrencyDataByDate({ date: '2022-01-01' });
      expect(response.message).toBe('Data successfully removed from the database.');
    });

    it('should throw HttpException when removal fails', async () => {
      mongoService.removeDataByDate.mockRejectedValue(new Error('Fail'));
      await expect(currencyDataController.removeCurrencyDataByDate({ date: '2022-01-01' })).rejects.toThrow(HttpException);
    });
  });

  describe('getCurrencyData', () => {
    it('should return currency data for a given date', async () => {
      mongoService.getCurrencyData.mockResolvedValue(mockData);
      const response = await currencyDataController.getCurrencyData({ date: '2022-01-01' });
      expect(response.CurrencyObject).toEqual(mockData);
    });

    it('should throw HttpException when data retrieval fails', async () => {
      mongoService.getCurrencyData.mockRejectedValue(new Error('Fail'));
      await expect(currencyDataController.getCurrencyData({ date: '2022-01-01' })).rejects.toThrow(HttpException);
    });
  });
});
