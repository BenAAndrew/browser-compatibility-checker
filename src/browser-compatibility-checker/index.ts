import { processCompatData } from "./compat-issues";

export const compatIssues = processCompatData();
export { findIssues } from "./check";
export { CompatIssue } from "./compat-issues";
