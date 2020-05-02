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
  },
};
