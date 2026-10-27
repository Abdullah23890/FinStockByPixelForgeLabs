import PDFDocument from "pdfkit";
import path from "path";
import fs from "fs";

export function buildReportPdf({ res, title, settings, columns, rows, summary, filtersApplied = [], isOverview = false, overviewData = null }) {
    const doc = new PDFDocument({ margin: 40, size: "A4" });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=${title.replace(/\s+/g, "_")}.pdf`);
    doc.pipe(res);

    let headerY = 40;
    if (settings?.logo) {
        try {
            const logoPath = path.resolve("uploads", path.basename(settings.logo));
            if (fs.existsSync(logoPath)) {
                doc.image(logoPath, 40, headerY, { width: 50, height: 50 });
            }
        } catch (e) {}
    }

    doc.fontSize(16).fillColor("#16203A").text(settings?.name || "Your Business", 100, headerY);
    doc.fontSize(9).fillColor("#6B7590");
    if (settings?.address) doc.text(settings.address, 100, headerY + 20);
    if (settings?.phone) doc.text(settings.phone, 100, headerY + 32);

    doc.moveTo(40, headerY + 60).lineTo(555, headerY + 60).strokeColor("#FF6B35").lineWidth(2).stroke();

    doc.fontSize(14).fillColor("#16203A").text(title, 40, headerY + 75);
    doc.fontSize(9).fillColor("#8C97B5").text(`Generated on ${new Date().toLocaleString()}`, 40, headerY + 95);

    let cursorY = headerY + 115;
    if (filtersApplied.length > 0) {
        doc.fontSize(9).fillColor("#6B7590").text(`Filters: ${filtersApplied.join(" | ")}`, 40, cursorY);
        cursorY += 20;
    }

    // ===== Overview cards (agar hain) =====
    if (isOverview && overviewData) {
        let x = 40, y = cursorY + 10, boxWidth = 165, boxHeight = 50, col = 0;
        for (const [label, value] of Object.entries(overviewData)) {
            doc.roundedRect(x, y, boxWidth, boxHeight, 4).fillAndStroke("#F5F7FB", "#E7EAF3");
            doc.fontSize(8).fillColor("#6B7590").text(label.toUpperCase(), x + 10, y + 8, { width: boxWidth - 20 });
            const isCount = !label.toLowerCase().includes("sale") && !label.toLowerCase().includes("purchase") &&
                             !label.toLowerCase().includes("receivable") && !label.toLowerCase().includes("payable") &&
                             !label.toLowerCase().includes("expense") && !label.toLowerCase().includes("profit") &&
                             !label.toLowerCase().includes("credit");
            const displayVal = isCount ? Number(value).toLocaleString() : `PKR ${Number(value).toLocaleString()}`;
            doc.fontSize(12).fillColor("#16203A").text(displayVal, x + 10, y + 26, { width: boxWidth - 20 });
            col++;
            x += boxWidth + 10;
            if (col % 3 === 0) { x = 40; y += boxHeight + 10; }
        }
        cursorY = y + boxHeight + 20;
        if (col % 3 !== 0) cursorY += boxHeight; // last incomplete row adjustment
    }

    // ===== Table — ab isOverview ke bawajood bhi chalega agar columns/rows diye gaye hon =====
    if (columns && rows) {
        if (cursorY > 700) { doc.addPage(); cursorY = 40; }

        if (isOverview) {
            doc.fontSize(11).fillColor("#16203A").text("Products Sold Today", 40, cursorY);
            cursorY += 18;
        }

        const tableTop = cursorY;
        const colWidth = (555 - 40) / columns.length;

        doc.fontSize(9).fillColor("#fff");
        doc.rect(40, tableTop, 515, 20).fill("#16203A");
        columns.forEach((c, i) => {
            doc.fillColor("#fff").text(c.label, 45 + i * colWidth, tableTop + 6, { width: colWidth - 5 });
        });

        let rowY = tableTop + 20;
        doc.fontSize(8.5);

        if (rows.length === 0) {
            doc.fillColor("#8C97B5").text("No data found for the selected filters.", 40, rowY + 10, { width: 515, align: "center" });
            rowY += 30;
        } else {
            rows.forEach((row, idx) => {
                if (rowY > 760) {
                    doc.addPage();
                    rowY = 40;
                }
                if (idx % 2 === 0) doc.rect(40, rowY, 515, 18).fill("#F5F7FB");
                columns.forEach((c, i) => {
                    const val = row[c.key];
                    const display = val == null ? "—" : c.money ? `PKR ${Number(val).toLocaleString()}` : String(val);
                    doc.fillColor("#16203A").text(display, 45 + i * colWidth, rowY + 4, { width: colWidth - 5 });
                });
                rowY += 18;
            });
        }

        if (summary && Object.keys(summary).length > 0) {
            rowY += 15;
            if (rowY > 750) { doc.addPage(); rowY = 40; }
            doc.moveTo(40, rowY).lineTo(555, rowY).strokeColor("#C9CFDC").dash(2, { space: 2 }).stroke();
            rowY += 10;
            let sx = 40;
            for (const [label, value] of Object.entries(summary)) {
                doc.fontSize(8).fillColor("#6B7590").text(label, sx, rowY);
                doc.fontSize(11).fillColor("#FF6B35").text(String(value), sx, rowY + 12);
                sx += 130;
            }
        }
    }

    doc.end();
}