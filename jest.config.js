module.exports = {
  preset: 'ts-jest',
  displayName: 'Lootr',
  setupFilesAfterEnv: ['./jest.setup.ts'],
  testEnvironment: 'node',
  moduleFileExtensions: ['js', 'ts'],
  verbose: true,
  globals: {
    'ts-jest': {
      tsconfig: "./tsconfig.test.json",
      diagnostics: { pretty: true },
      isolatedModules: false,
    },
  },
};
