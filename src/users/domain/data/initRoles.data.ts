import { Role } from '../../infrastructure/entities/role.entity';

export const initRoles: Partial<Role>[] = [
  {
    id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    name: 'admin',
    description: 'Administrator',
  },
  {
    id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12',
    name: 'customer',
    description: 'Customer',
  },
  {
    id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13',
    name: 'artist',
    description: 'Artist',
  },
  {
    id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14',
    name: 'lessor',
    description: 'Lessor studios or instruments',
  },
  {
    id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15',
    name: 'superuser',
    description: 'Superuser test',
  },
];
