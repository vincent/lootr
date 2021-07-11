module.exports = {
  preset: 'ts-jest',
  displayName: 'Lootr',
  setupFilesAfterEnv: ['./jest.setup.ts'],
  testEnvironment: 'node',
  moduleFileExtensions: ['js', 'ts'],
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputDirectory: 'reports',
        outputName: 'jest-junit.xml',
        ancestorSeparator: ' › ',
        uniqueOutputName: 'false',
        suiteNameTemplate: '{filepath}',
        classNameTemplate: '{classname}',
        titleTemplate: '{title}',
      },
    ],
  ],
  verbose: true,
  globals: {
    'ts-jest': {
      tsconfig: './tsconfig.test.json',
      diagnostics: { pretty: true },
      isolatedModules: false,
    },
  },
};
