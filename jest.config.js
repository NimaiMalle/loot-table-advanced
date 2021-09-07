// jest.config.js
// Sync object
/** @type {import('@jest/types').Config.InitialOptions} */

const config = {
  roots: ['<rootDir>/src'],
  testMatch: ['**/*.test.ts'],
  transform: { '^.+\\.(ts|tsx)$': 'ts-jest' },
  timers: 'modern',
}

module.exports = config
