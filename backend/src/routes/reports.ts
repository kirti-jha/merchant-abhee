import { Router } from "express";
import multer from "multer";
import csv from "csv-parser";
import fs from "fs";
import { prisma } from "../index";
import { requireAuth, requireAdmin, AuthRequest } from "../middleware/auth";

const router = Router();
const upload = multer({ dest: "uploads/" });

router.post("/upload", requireAuth, requireAdmin, upload.single("report"), async (req: AuthRequest, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const results: any[] = [];
  const filePath = req.file.path;

  try {
    fs.createReadStream(filePath)
      .pipe(csv({
        mapHeaders: ({ header }) => header.trim().toLowerCase()
      }))
      .on("data", (data) => results.push(data))
      .on("end", async () => {
        let processedCount = 0;
        let skippedCount = 0;
        let errorCount = 0;

        for (const row of results) {
          try {
            const rawTid = row['terminal id'] || row['tid'] || '';
            const rawAmount = row['transaction amount'] || row['amount(rs.)'] || row['amount'] || '';
            const rawRrn = row['rrn no'] || row['rrn'] || '';
            const rawStatus = row['transaction state'] || row['status'] || '';
            const rawDate = row['transaction date'] || row['date'] || '';
            const rawTime = row['transaction time'] || '';
            const rawPayer = row["payer's name"] || '';
            const rawDesc = row['description'] || '';
            const rawMobile = row['user mobile number'] || '';
            const rawTxType = row['transaction type'] || row['payment type'] || '';
            const rawMintoakId = row['mintoak transaction id'] || '';

            const tid = rawTid.toString().trim();
            const amount = rawAmount.toString().trim();
            const rrn = rawRrn.toString().trim();

            if (!tid || !amount || !rrn) {
                skippedCount++;
                continue;
            }

            // check for duplicates by RRN
            const existing = await prisma.transaction.findFirst({
                where: { refId: rrn }
            });
            
            if (existing) {
                skippedCount++;
                continue;
            }

            let merchantId = req.userId!;
            // 1. Find the QR code by TID
            const qr = await prisma.qrCode.findFirst({
              where: { tid: tid }
            });

            if (qr && qr.merchantId) {
                merchantId = qr.merchantId;
            }

            let finalStatus = "Pending";
            if (rawStatus) {
                const s = rawStatus.toString().toLowerCase();
                if (s.includes("success") || s === "completed") finalStatus = "Completed";
                else if (s.includes("fail") || s.includes("decline") || s.includes("error")) finalStatus = "Failed";
                else finalStatus = rawStatus.toString().trim();
            }

            let dateToSave = new Date();
            if (rawDate) {
               dateToSave = new Date(`${rawDate} ${rawTime}`.trim());
               if (isNaN(dateToSave.getTime())) {
                  dateToSave = new Date(rawDate);
                  if (isNaN(dateToSave.getTime())) dateToSave = new Date();
               }
            }

            // 3. Create transaction
            await prisma.transaction.create({
              data: {
                userId: merchantId,
                serviceType: "qr_settlement",
                amount: Number(amount) || 0,
                status: finalStatus,
                refId: rrn,
                clientRefId: rawMintoakId.toString().trim() || null,
                createdAt: dateToSave,
                category: "QR Payment",
                provider: "Bank Report",
                type: "credit",
                description: rawDesc.toString().trim() || null,
                sender: rawPayer.toString().trim() || null,
                consumer: rawMobile.toString().trim() || null
              }
            });

            processedCount++;
          } catch (err) {
            console.error("Error processing row:", err);
            errorCount++;
          }
        }

        // Cleanup
        fs.unlinkSync(filePath);

        res.json({
          message: "Report processed successfully",
          processed: processedCount,
          skipped: skippedCount,
          errors: errorCount
        });
      });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
