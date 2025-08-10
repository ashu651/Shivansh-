import type { Config } from 'jest';

const config: Config = {
  testEnvironment: 'jsdom',
  transform: { '^.+\\.(t|j)sx?$': 'ts-jest' },
  moduleFileExtensions: ['ts', 'tsx', 'js'],
};
export default config;