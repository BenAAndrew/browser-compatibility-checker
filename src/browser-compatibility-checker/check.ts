import { CompatIssue } from "./compat-issues";
import { getMessage } from "./message";

export function findIssues(
  text: string,
  issues: { [key: string]: CompatIssue },
  browsersToCheck: string[] = [],
  warnForOtherBrowsers: boolean = true
) {
  const selectorsToWarn = Object.keys(issues);
  const matches: { index: number; message: string; isError: boolean }[] = [];
  selectorsToWarn.forEach((selector) => {
    const regex = new RegExp(
      /^[a-zA-Z]/.test(selector) ? `(?:^|\\s)${selector}` : selector,
      "g",
    );
    const message = getMessage(selector, issues[selector], browsersToCheck, warnForOtherBrowsers);
    if(message){
      let match;
      while ((match = regex.exec(text)) !== null) {
        matches.push({ index: match.index + 2, message: message.message, isError: message.isError });
      }
    }
    
  });
  return matches;
}
