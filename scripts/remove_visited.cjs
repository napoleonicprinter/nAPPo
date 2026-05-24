const fs = require('fs');
const path = require('path');

const file = path.resolve(__dirname, '..', 'src', 'data', 'sites.json');

try {
  const raw = fs.readFileSync(file, 'utf8');
  const data = JSON.parse(raw);
  if (!Array.isArray(data)) {
    console.error('Expected an array in sites.json');
    process.exit(2);
  }
  let removed = 0;
  for (const obj of data) {
    if (Object.prototype.hasOwnProperty.call(obj, 'visited')) {
      delete obj.visited;
      removed++;
    }
  }
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n', 'utf8');
  console.log(`Removed ${removed} "visited" fields from ${file}`);
} catch (err) {
  console.error('Error processing file:', err.message);
  process.exit(1);
}
