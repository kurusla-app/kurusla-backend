import fs from 'fs';
import path from 'path';
import { parseStatementText } from '../src/services/statementParser.service';

const samplePath = path.join(__dirname, 'sample-statement-text.txt');
const text = fs.readFileSync(samplePath, 'utf8');
const parsed = parseStatementText(text);

console.log('Bulunan işlem sayısı:', parsed.length);
console.log(JSON.stringify(parsed, null, 2));

if (parsed.length !== 3) {
  console.error('Beklenen 3 işlem, bulunan:', parsed.length);
  process.exit(1);
}
