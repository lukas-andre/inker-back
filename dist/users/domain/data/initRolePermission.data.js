"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initRolePermissions = void 0;
exports.initRolePermissions = [
    {
        role: 'admin',
        controllers: ['*'],
    },
    {
        role: 'superuser',
        controllers: [
            'CustomersController',
            'PostsController',
            'UsersController',
            'ArtistsController',
            'FeedController',
            'RolesController',
            'PermissionsController',
        ],
    },
    {
        role: 'customer',
        controllers: [
            'CustomersController',
            'PostsController',
            'UsersController',
            'ArtistsController',
            'FeedController',
        ],
    },
    {
        role: 'artist',
        controllers: [
            'CustomersController',
            'PostsController',
            'UsersController',
            'ArtistsController',
            'FeedController',
        ],
    },
    {
        role: 'lessor',
        controllers: [
            'CustomersController',
            'PostsController',
            'UsersController',
            'ArtistsController',
            'FeedController',
        ],
    },
];
//# sourceMappingURL=initRolePermission.data.js.map