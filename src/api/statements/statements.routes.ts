import { Router } from 'express';
import {
  parseStatementPdf,
  parseStatementTransactions,
  importStatement,
} from './statements.controller';

const router = Router();

/**
 * @swagger
 * /api/statements/parse:
 *   post:
 *     summary: Aylık ekstre PDF'ini ham metne çevirir
 *     tags: [Statements]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [pdfBase64]
 *             properties:
 *               pdfBase64:
 *                 type: string
 *                 description: Base64 kodlu PDF (data URL formatı da kabul edilir)
 *     responses:
 *       200:
 *         description: Metin başarıyla çıkarıldı
 *       400:
 *         description: Geçersiz istek veya PDF
 *       422:
 *         description: PDF okundu ancak metin bulunamadı
 */
router.post('/parse', parseStatementPdf);

/**
 * @swagger
 * /api/statements/parse-transactions:
 *   post:
 *     summary: Ekstre metninden harcama satırlarını çıkarır (kayıt yapmaz)
 *     tags: [Statements]
 */
router.post('/parse-transactions', parseStatementTransactions);

/**
 * @swagger
 * /api/statements/import:
 *   post:
 *     summary: Ekstre PDF/metnini içe aktarır ve birikim akışını tetikler
 *     tags: [Statements]
 */
router.post('/import', importStatement);

export default router;
