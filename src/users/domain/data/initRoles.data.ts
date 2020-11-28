import { Role } from '../../infrastructure/entities/role.entity';

export const initRoles: Partial<Role>[] = [
  {
    id: '1',
    name: 'admin',
    description: 'Administrator',
  },
  {
    id: '2',
    name: 'customer',
    description: 'Customer',
  },
  {
    id: '3',
    name: 'artist',
    description: 'Artist',
  },
  {
    id: '4',
    name: 'lessor',
    description: 'Lessor studios or instruments',
  },
  {
    id: '5',
    name: 'superuser',
    description: 'Superuser test',
  },
];
