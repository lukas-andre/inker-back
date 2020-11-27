export interface InitRolePermissions {
  role: string;
  controllers: string[];
}

export const initRolePermissions: InitRolePermissions[] = [
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
