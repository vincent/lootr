module.exports = {
  parser: '@typescript-eslint/parser',
  plugins: ['prettier', '@typescript-eslint', 'import'],
  rules: {
    'prettier/prettier': 'error',
    'sort-imports': [
      'error',
      {
        ignoreDeclarationSort: true,
      },
    ],
    'import/order': [
      'error',
      {
        'newlines-between': 'always',
      },
    ],
    'import/no-default-export': 'error',
    'no-unused-vars': 0,
    'no-restricted-syntax': [
      'error',
      {
        // Curious why we have this rule?
        // - Enums only work for a subset of use cases that unions of string literals + objects work for and learning one language feature is easier than learning two language features
        // - Enums are a new language feature which have runtime semantics which means they change TypeScript from JS + types to JS + types + extra language features which is harder to teach without clear advantages for this specific feature
        selector: 'TSEnumDeclaration',
        message: 'Use a unions of string literals instead of an enum',
      },
    ],
    'array-callback-return': 'error',
    '@typescript-eslint/ban-types': [
      'error',
      {
        extendDefaults: false,
        types: {
          Function:
            '`Function` types are unsafe. Use more specific function types instead. e.g. (arg: number) => string',
          String: {
            message:
              'The `String` type refers to the String object which is probably not what you want, you probably want `string` instead which refers to the string primitive type.',
            fixWith: 'string',
          },
        },
      },
    ],
    '@typescript-eslint/no-unused-vars': 'error',
    // TypeScript will check this
    'no-undef': 'off',
    'import/no-anonymous-default-export': 'off',
    'no-use-before-define': 'off',
  },
};
