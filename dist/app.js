"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const swagger_1 = require("./swagger/swagger");
const routes_1 = __importDefault(require("./routes"));
const ApiError_1 = require("./utils/ApiError");
const error_middleware_1 = require("./middleware/error.middleware");
const app = (0, express_1.default)();
// Global Middlewares
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Swagger Documentation UI Route
app.use('/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_1.swaggerSpec));
// Mount application API routes
app.use('/api', routes_1.default);
// 404 Route handler
app.use((req, res, next) => {
    next(ApiError_1.ApiError.notFound('Resource not found'));
});
// Global Error Handler Middleware
app.use(error_middleware_1.errorHandler);
exports.default = app;
