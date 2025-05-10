const fs = require("fs");
const path = require("path");

// Function to recursively get all test files
function getTestFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);

  list.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat && stat.isDirectory()) {
      // Recursively get files from subdirectories
      results = results.concat(getTestFiles(filePath));
    } else if (filePath.endsWith(".spec.js")) {
      results.push(filePath);
    }
  });

  return results;
}

// Function to convert Chai assertions to Vitest
function convertTest(content) {
  // Replace chai require with Vitest comment
  content = content.replace(
    /const\s*{\s*expect\s*}\s*=\s*require\(['"]chai['"]\)/,
    "// import { expect, describe, it } from 'vitest' - these are globally available with globals: true"
  );

  // Replace Chai assertions with Vitest
  content = content
    // Equal assertions
    .replace(/\.to\.equal\((.*?)\)/g, ".toBe($1)")
    .replace(/\.to\.be\.equal\((.*?)\)/g, ".toBe($1)")

    // Length assertions
    .replace(/\.to\.have\.lengthOf\((\d+)\)/g, ".toHaveLength($1)")

    // Contains assertions
    .replace(/\.to\.contain\((.*?)\)/g, ".toContain($1)");

  // More complex case for chained assertions
  const chainedRegex = /.to.have.lengthOf\((\d+)\)(.to.contain\((.*?)\))+/g;
  let match;
  while ((match = chainedRegex.exec(content)) !== null) {
    const lengthPart = `.toHaveLength(${match[1]})`;
    // Extract all .to.contain() parts and convert them
    const containParts = match[0].match(/\.to\.contain\((.*?)\)/g);
    if (containParts) {
      const convertedContainParts = containParts
        .map((part) => part.replace(".to.contain(", ".toContain("))
        .join("\n    expect(x)");

      // Replace the entire chain with multiple assertions
      content = content.replace(
        match[0],
        lengthPart + "\n    " + convertedContainParts
      );
    }
  }

  return content;
}

// Get all test files
const testFiles = getTestFiles(path.join(__dirname, "test"));

// Process each file
testFiles.forEach((file) => {
  console.log(`Processing ${file}...`);
  const content = fs.readFileSync(file, "utf8");
  const convertedContent = convertTest(content);

  // Only write if content has changed
  if (content !== convertedContent) {
    fs.writeFileSync(file, convertedContent, "utf8");
    console.log(`Converted ${file}`);
  } else {
    console.log(`No changes needed for ${file}`);
  }
});

console.log("Migration complete!");
