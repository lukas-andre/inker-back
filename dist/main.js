"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const swagger_1 = require("@nestjs/swagger");
const app_module_1 = require("./app.module");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, {
        cors: {
            origin: true,
            preflightContinue: false,
        },
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        transform: true,
    }));
    const configService = app.get(config_1.ConfigService);
    const options = new swagger_1.DocumentBuilder()
        .setTitle('Inker Backend Service')
        .setDescription('Backend manager for Inker')
        .setVersion('0.0.1')
        .addBearerAuth()
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, options);
    swagger_1.SwaggerModule.setup('api', app, document);
    app.use(helmet());
    app.use(rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 100,
    }));
    console.log(configService.get('userDb'));
    const port = configService.get('app.port', 3000);
    await app.listen(port, '0.0.0.0');
}
bootstrap();
//# sourceMappingURL=main.js.map