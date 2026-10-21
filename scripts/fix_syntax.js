const fs = require('fs');
let html = fs.readFileSync('public/index.html', 'utf8');

const badSnippet = `    }\r\n\r\n\r\n      // Load real system dynamic data\r\n      await Promise.all([\r\n        loadCourseRoadmap(),\r\n        loadRealPets(),\r\n        loadRealLeaderboard()\r\n      ]);\r\n    }`;

const badSnippetLF = `    }\n\n\n      // Load real system dynamic data\n      await Promise.all([\n        loadCourseRoadmap(),\n        loadRealPets(),\n        loadRealLeaderboard()\n      ]);\n    }`;

const goodSnippet = `      // Load real system dynamic data\r\n      await Promise.all([\r\n        loadCourseRoadmap(),\r\n        loadRealPets(),\r\n        loadRealLeaderboard()\r\n      ]);\r\n    }`;

if (html.includes(badSnippet)) {
  html = html.replace(badSnippet, goodSnippet);
  fs.writeFileSync('public/index.html', html, 'utf8');
  console.log('✓ Successfully fixed CRLF syntax placement');
} else if (html.includes(badSnippetLF)) {
  html = html.replace(badSnippetLF, goodSnippet);
  fs.writeFileSync('public/index.html', html, 'utf8');
  console.log('✓ Successfully fixed LF syntax placement');
} else {
  // Regex approach
  const regex = /liveSocket\.on\('connect'[\s\S]*?\}\);\s*\}\s*catch\s*\(e\)\s*\{[\s\S]*?\}\s*\}\s*\}\s*\/\/\s*Load real system[\s\S]*?loadRealLeaderboard\(\)\s*\]\);\s*\}/;
  const match = html.match(regex);
  if (match) {
    const fixed = match[0].replace(/\}\s*\}\s*\/\/\s*Load real system/, '} // Load real system');
    html = html.replace(match[0], fixed);
    fs.writeFileSync('public/index.html', html, 'utf8');
    console.log('✓ Fixed via regex');
  } else {
    console.log('Could not find match');
  }
}
