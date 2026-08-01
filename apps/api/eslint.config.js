// Re-exports the shared root config — see /eslint.config.js. Flat-config
// ESLint resolves relative to cwd, not upward through the tree, so each
// workspace package needs its own entry point pointing at the shared rules.
import rootConfig from "../../eslint.config.js";

export default rootConfig;
