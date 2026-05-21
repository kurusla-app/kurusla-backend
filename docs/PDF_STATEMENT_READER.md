# PDF Ekstre Okuyucu (pdf-parse)

E-posta ile gelen aylık banka ekstre PDF'leri ham metne çevrilir. Sonraki adımda bu metin `regexService` veya AI ile işlenebilir.

## Kurulum

```bash
npm install pdf-parse
```

Paket projede kuruludur (`pdf-parse` v2).

## API

**POST** `/api/statements/parse`

**Body:**
```json
{
  "pdfBase64": "<Base64 kodlu PDF veya data:application/pdf;base64,...>"
}
```

**Başarılı yanıt (200):**
```json
{
  "success": true,
  "message": "PDF başarıyla metne dönüştürüldü.",
  "data": {
    "text": "Garanti BBVA Ekstre ...",
    "pageCount": 3,
    "charCount": 12450,
    "pages": [
      { "pageNumber": 1, "text": "..." }
    ]
  }
}
```

## Ekstre satır ayrıştırma (parse-transactions)

**POST** `/api/statements/parse-transactions`

```json
{
  "text": "15.03.2026 STARBUCKS COFFEE TR 145,50 TL\n14.03.2026 MIGROS SANAL MARKET 1.234,56 TL"
}
```

Yanıt: `data[]` — her satır için `merchant`, `amount`, `category`, `date`, `rawLine`.

## Tam içe aktarma (import) — toplu DB kaydı

**POST** `/api/statements/import`

PDF veya metin gönderilir. Akış:

1. PDF → metin + `getTable()` ile tablo satırları
2. Satır + tablo + tab ayrılmış metin parse edilir
3. `Transaction` tablosuna **toplu** (`$transaction` batch) kayıt
4. Birikim / AgeSA / pot / AI yan etkileri toplu işlenir

```json
{
  "userId": 1,
  "pdfBase64": "..."
}
```

veya

```json
{
  "userId": 1,
  "text": "15.03.2026 STARBUCKS ..."
}
```

Yanıt özeti: `importedCount`, `skippedCount`, `failedCount`, `bulkSaved`, `savingsCreated`, `totalSavings`, `transactions[]`.

## Make.com entegrasyonu

1. **Gmail** — Aylık ekstre eki (PDF)
2. **HTTP** — `POST {{BACKEND_URL}}/api/statements/import`
3. Body: `{ "userId": 1, "pdfBase64": "{{attachment_base64}}" }`
4. Alternatif: önce `/parse` ile metin al, sonra `/parse-transactions` ile önizle, en son `/import`

## Yerel test

```bash
npx ts-node scratch/test-pdf-parse.ts
```

## Limitler

- Maksimum PDF boyutu: **10 MB**
- JSON body limiti: **15 MB** (base64 şişmesi için)
