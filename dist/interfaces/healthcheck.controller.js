"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthCheckController = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const currency_service_1 = require("./currency.service");
let HealthCheckController = class HealthCheckController {
    constructor(mongoService) {
        this.mongoService = mongoService;
    }
    async checkMongoConnection() {
        try {
            const client = this.mongoService.getClient();
            await client.db().admin().ping();
            return 'MongoDB connection is healthy';
        }
        catch (error) {
            console.error('MongoDB connection error:', error);
            return 'MongoDB connection is down';
        }
    }
};
exports.HealthCheckController = HealthCheckController;
tslib_1.__decorate([
    (0, common_1.Get)(),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", []),
    tslib_1.__metadata("design:returntype", Promise)
], HealthCheckController.prototype, "checkMongoConnection", null);
exports.HealthCheckController = HealthCheckController = tslib_1.__decorate([
    (0, common_1.Controller)('health-check'),
    tslib_1.__metadata("design:paramtypes", [currency_service_1.MongoService])
], HealthCheckController);
