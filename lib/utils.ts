import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function extractFirstCodeBlock(input: string) {
  // 1) We use a more general pattern for the code fence:
  //    - ^```([^\n]*) captures everything after the triple backticks up to the newline.
  //    - ([\s\S]*?) captures the *body* of the code block (non-greedy).
  //    - Then we look for a closing backticks on its own line (\n```).
  // The 'm' (multiline) flag isn't strictly necessary here, but can help if input is multiline.
  // The '([\s\S]*?)' is a common trick to match across multiple lines non-greedily.
  const match = input.match(/```([^\n]*)\n([\s\S]*?)\n```/);

  if (match) {
    const fenceTag = match[1] || ""; // e.g. "tsx{filename=Calculator.tsx}"
    const code = match[2]; // The actual code block content
    const fullMatch = match[0]; // Entire matched string including backticks

    // We'll parse the fenceTag to extract optional language and filename
    let language: string | null = null;
    let filename: { name: string; extension: string } | null = null;

    // Attempt to parse out the language, which we assume is the leading alphanumeric part
    // Example: fenceTag = "tsx{filename=Calculator.tsx}"
    const langMatch = fenceTag.match(/^([A-Za-z0-9]+)/);
    if (langMatch) {
      language = langMatch[1];
    }

    // Attempt to parse out a filename from braces, e.g. {filename=Calculator.tsx}
    const fileMatch = fenceTag.match(/{\s*filename\s*=\s*([^}]+)\s*}/);
    if (fileMatch) {
      filename = parseFileName(fileMatch[1]);
    }

    return { code, language, filename, fullMatch };
  }
  return null; // No code block found
}

function parseFileName(fileName: string): { name: string; extension: string } {
  // Split the string at the last dot
  const lastDotIndex = fileName.lastIndexOf(".");
  if (lastDotIndex === -1) {
    // No dot found
    return { name: fileName, extension: "" };
  }
  return {
    name: fileName.slice(0, lastDotIndex),
    extension: fileName.slice(lastDotIndex + 1),
  };
}

export function splitByFirstCodeFence(text: string) {
  const parts = [];
  const codeBlockRegex = /```(?:typescript|tsx|javascript|jsx)?\n([\s\S]*?)```/;
  const match = text.match(codeBlockRegex);

  if (!match) {
    if (text.includes("```")) {
      parts.push({ type: "text", content: text.split("```")[0] });
      parts.push({ type: "first-code-fence-generating", content: "" });
    } else {
      parts.push({ type: "text", content: text });
    }
    return parts;
  }

  const beforeCode = text.slice(0, match.index);
  const code = match[1];
  const afterCode = text.slice(match.index! + match[0].length);

  if (beforeCode) parts.push({ type: "text", content: beforeCode });
  parts.push({ type: "code", content: code });
  if (afterCode) parts.push({ type: "text", content: afterCode });

  return parts;
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
