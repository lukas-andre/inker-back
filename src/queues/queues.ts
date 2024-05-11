export const queues = {
  default: {
    name: 'default',
    hostId: 'default',
    port: 6379,
  },
  notification: {
    name: 'notification',
    hostId: 'notification',
    attempts: 3,
    port: 6379,
  },
  deadLetter: {
    name: 'deadLetter',
    hostId: 'deadLetter',
    port: 6379,
  },
};
