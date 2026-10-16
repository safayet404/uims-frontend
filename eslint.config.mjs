// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt({
  rules: {
    // Background fetches (stats, dropdown options) deliberately ignore failures;
    // user-triggered actions must still report errors with a toast.
    'no-empty': ['error', { allowEmptyCatch: true }],
  },
})
