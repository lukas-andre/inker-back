"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersModule = void 0;
const common_1 = require("@nestjs/common");
const users_service_1 = require("./domain/services/users.service");
const users_controller_1 = require("./infrastructure/controllers/users.controller");
const typeorm_1 = require("@nestjs/typeorm");
const user_entity_1 = require("./infrastructure/entities/user.entity");
const role_entity_1 = require("./infrastructure/entities/role.entity");
const permission_entity_1 = require("./infrastructure/entities/permission.entity");
const roles_service_1 = require("./domain/services/roles.service");
const permissions_service_1 = require("./domain/services/permissions.service");
const initialPermissions_service_1 = require("./domain/services/initialPermissions.service");
const permissions_controller_1 = require("./infrastructure/controllers/permissions.controller");
const roles_controller_1 = require("./infrastructure/controllers/roles.controller");
const customers_module_1 = require("../customers/customers.module");
const artists_module_1 = require("../artists/artists.module");
const users_handler_1 = require("./infrastructure/handlers/users.handler");
const roles_handler_1 = require("./infrastructure/handlers/roles.handler");
const permissions_handler_1 = require("./infrastructure/handlers/permissions.handler");
const crerateUserByType_usecase_1 = require("./usecases/user/crerateUserByType.usecase");
const findAllRoles_usecase_1 = require("./usecases/role/findAllRoles.usecase");
const findOneRole_usecase_1 = require("./usecases/role/findOneRole.usecase");
const findOnePermission_usecase_1 = require("./usecases/permission/findOnePermission.usecase");
const findAllPermissions_usecase_1 = require("./usecases/permission/findAllPermissions.usecase");
const initRoles_usecase_1 = require("./usecases/role/initRoles.usecase");
const initPermissions_usecase_1 = require("./usecases/permission/initPermissions.usecase");
const findAllRoutes_usecase_1 = require("./usecases/permission/findAllRoutes.usecase");
let UsersModule = class UsersModule {
};
UsersModule = __decorate([
    common_1.Module({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([user_entity_1.User, role_entity_1.Role, permission_entity_1.Permission], 'user-db'),
            customers_module_1.CustomersModule,
            artists_module_1.ArtistsModule,
        ],
        providers: [
            users_service_1.UsersService,
            users_handler_1.UsersHandler,
            roles_service_1.RolesService,
            roles_handler_1.RolesHandler,
            permissions_service_1.PermissionsService,
            permissions_handler_1.PermissionsHandler,
            initialPermissions_service_1.InitialPermissionsService,
            initRoles_usecase_1.InitRolesUseCase,
            initPermissions_usecase_1.InitPermissionsUseCase,
            crerateUserByType_usecase_1.CreateUserByTypeUseCase,
            findAllRoles_usecase_1.FindAllRolesUseCase,
            findOneRole_usecase_1.FindOneRoleUseCase,
            findOnePermission_usecase_1.FindOnePermissionUseCase,
            findAllPermissions_usecase_1.FindAllPermissionsUseCase,
            findAllRoutes_usecase_1.FindAllRoutesUseCase,
        ],
        controllers: [users_controller_1.UsersController, permissions_controller_1.PermissionsController, roles_controller_1.RolesController],
        exports: [users_service_1.UsersService, roles_service_1.RolesService],
    })
], UsersModule);
exports.UsersModule = UsersModule;
//# sourceMappingURL=users.module.js.map