import fs from "fs";

const content = fs.readFileSync("C:/Users/sahil/.gemini/antigravity-ide/brain/b4b37cb0-7a63-4c96-a5be-54a018715471/.system_generated/steps/332/content.md", "utf8");

// Search for any paragraph / textarea tags
console.log("Searching for textarea or paragraph fields in HTML:");
const textareas = [...content.matchAll(/<textarea[^>]*>/gi)];
console.log("Found textareas:", textareas.length);
textareas.forEach((t, i) => console.log(`Textarea ${i+1}: ${t[0]}`));

// Search for all occurrences of M7eMe class and print their full element and surrounding text
const labelRegex = /<span class="M7eMe"[^>]*>([\s\S]+?)<\/span>/gi;
let match;
let count = 0;
while ((match = labelRegex.exec(content)) !== null) {
  count++;
  console.log(`\nSpan label ${count}: "${match[1]}"`);
  const idx = match.index;
  console.log("Context:");
  console.log(content.slice(Math.max(0, idx - 150), Math.min(content.length, idx + 450)));
}
