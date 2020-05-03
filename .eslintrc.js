const SIMPLE_IMPORT_SORT_RULE_SET = {
  // Implements rules in simple import sort https://github.com/lydell/eslint-plugin-simple-import-sort#usage
  "simple-import-sort/sort": "error",
  "sort-imports": "off",
  "import/order": "off",
};

const AVOID_STATE_IN_CONSTRUCTORS = {
  // https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/state-in-constructor.md
  "react/state-in-constructor": [1, "never"],
};

const ALLOW_JSX_IN_FILES_WITH_JS_EXTENSION = {
  // https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/jsx-filename-extension.md
  "react/jsx-filename-extension": 0,
};

const DO_NOT_VALIDATE_PROP_TYPES = {
  // https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/prop-types.md
  "react/prop-types": 0,
};

const ALLOW_UNDERSCORES_WITHIN_CLASSES = {
  // https://eslint.org/docs/rules/no-underscore-dangle
  "no-underscore-dangle": ["error", { allowAfterThis: true }],
};

module.exports = {
  plugins: ["prettier", "simple-import-sort"],
  parser: "babel-eslint",
  extends: [
    "airbnb",
    // https://github.com/prettier/eslint-plugin-prettier#recommended-configuration
    "plugin:prettier/recommended",
    "prettier/flowtype",
    "prettier/react",
    "prettier/standard",
  ],
  rules: {
    "prettier/prettier": "error",
    ...SIMPLE_IMPORT_SORT_RULE_SET,
    ...AVOID_STATE_IN_CONSTRUCTORS,
    ...ALLOW_JSX_IN_FILES_WITH_JS_EXTENSION,
    ...DO_NOT_VALIDATE_PROP_TYPES,
    ...ALLOW_UNDERSCORES_WITHIN_CLASSES,
  },
};
