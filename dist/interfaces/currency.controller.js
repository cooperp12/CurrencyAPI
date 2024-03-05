"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CurrencyDataController = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const currency_service_1 = require("./currency.service");
let CurrencyDataController = class CurrencyDataController {
    constructor(mongoService) {
        this.mongoService = mongoService;
    }
    async addCurrencyData(currencyDataJSON) {
        //console.log(currencyDataJSON); // Log the received data
        try {
            await this.mongoService.addDataToDB(currencyDataJSON);
            return { message: 'Data successfully added to the database.' };
        }
        catch (error) {
            console.error('Error adding data:', error);
            throw new common_1.HttpException('Failed to add data to the database.', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async removeCurrencyDataByDate(body) {
        try {
            await this.mongoService.removeDataByDate(body.date);
            return { message: 'Data successfully removed from the database.' };
        }
        catch (error) {
            console.error('Error removing data:', error);
            throw new common_1.HttpException('Failed to remove data from the database.', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getCurrencyData(body) {
        try {
            const data = await this.mongoService.getCurrencyData(body.date);
            return { data: data };
        }
        catch (error) {
            console.error('Error getting data:', error);
            throw new common_1.HttpException('Failed to get data from the database.', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.CurrencyDataController = CurrencyDataController;
tslib_1.__decorate([
    (0, common_1.Post)('add'),
    tslib_1.__param(0, (0, common_1.Body)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", Promise)
], CurrencyDataController.prototype, "addCurrencyData", null);
tslib_1.__decorate([
    (0, common_1.Delete)('remove'),
    tslib_1.__param(0, (0, common_1.Body)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", Promise)
], CurrencyDataController.prototype, "removeCurrencyDataByDate", null);
tslib_1.__decorate([
    (0, common_1.Get)('getInformation'),
    tslib_1.__param(0, (0, common_1.Body)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", Promise)
], CurrencyDataController.prototype, "getCurrencyData", null);
exports.CurrencyDataController = CurrencyDataController = tslib_1.__decorate([
    (0, common_1.Controller)('currency-data'),
    tslib_1.__metadata("design:paramtypes", [currency_service_1.MongoService])
], CurrencyDataController);
