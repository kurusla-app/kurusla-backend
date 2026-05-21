import fs from 'fs';
import path from 'path';
import { extractTextFromPdf } from '../src/services/pdfStatement.service';

async function main() {
  const samplePath = path.join(__dirname, 'sample-statement.pdf');

  if (!fs.existsSync(samplePath)) {
    console.error('Önce scratch/sample-statement.pdf dosyasını ekleyin veya gerçek bir ekstre PDF koyun.');
    process.exit(1);
  }

  const buffer = fs.readFileSync(samplePath);
  const result = await extractTextFromPdf(buffer);

  console.log('Sayfa sayısı:', result.pageCount);
  console.log('Karakter sayısı:', result.text.length);
  console.log('--- Metin önizleme (ilk 500 karakter) ---');
  console.log(result.text.slice(0, 500));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
