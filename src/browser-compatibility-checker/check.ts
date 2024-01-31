import { CompatIssue } from "./compat-issues";
import { getMessage } from "./message";

export function findIssues(
  text: string,
  issues: { [key: string]: CompatIssue },
) {
  const selectorsToWarn = Object.keys(issues);
  const matches: { index: number; message: string; isError: boolean }[] = [];
  selectorsToWarn.forEach((selector) => {
    const regex = new RegExp(
      /^[a-zA-Z]/.test(selector) ? `(?:^|\\s)${selector}` : selector,
      "g",
    );
    const { message, isError } = getMessage(selector, issues[selector]);
    let match;
    while ((match = regex.exec(text)) !== null) {
      matches.push({ index: match.index + 2, message, isError });
    }
  });
  return matches;
}
