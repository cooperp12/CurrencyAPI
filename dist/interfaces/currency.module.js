"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CurrencyModule = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const currency_controller_1 = require("./currency.controller");
const healthcheck_controller_1 = require("./healthcheck.controller");
const currency_service_1 = require("./currency.service");
let CurrencyModule = class CurrencyModule {
};
exports.CurrencyModule = CurrencyModule;
exports.CurrencyModule = CurrencyModule = tslib_1.__decorate([
    (0, common_1.Module)({
        controllers: [healthcheck_controller_1.HealthCheckController, currency_controller_1.CurrencyDataController], // Add your new controller here
        providers: [currency_service_1.MongoService],
    })
], CurrencyModule);
