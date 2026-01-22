const fs = require('fs');
const path = require('path');
const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');

function getSundays(year, month) {
  const sundays = [];
  const date = new Date(year, month - 1, 1);
  while (date.getMonth() === month - 1) {
    if (date.getDay() === 0) {
      sundays.push(new Date(date)); // clone the date
    }
    date.setDate(date.getDate() + 1);
  }
  return sundays;
}

async function createPDF(filePath, date, language) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([500, 300]);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const text = `Bulletin for Sunday ${date.toISOString().slice(0, 10)} (${language}) is not available yet, but you can get it in the future.`;

  page.drawText(text, {
    x: 25,
    y: 150,
    size: 14,
    font,
    color: rgb(0, 0, 0),
    maxWidth: 450
  });

  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync(filePath, pdfBytes);
  console.log(`Created ${filePath}`);
}

async function createFolderStructure() {
  const basePath = path.join(__dirname, '..', 'cloudinary', 'bulletins');
  const years = [2025, 2026];

  for (const year of years) {
    for (let month = 1; month <= 12; month++) {
      for (const lang of ['en', 'es']) {
        const folderPath = path.join(basePath, String(year), String(month).padStart(2, '0'), lang);
        fs.mkdirSync(folderPath, { recursive: true });

        const sundays = getSundays(year, month);
        for (const date of sundays) {
          const fileName = `${date.toISOString().slice(0, 10)}.pdf`;
          const filePath = path.join(folderPath, fileName);
          await createPDF(filePath, date, lang);
        }
      }
    }
  }
}

createFolderStructure()
  .then(() => console.log('All placeholder bulletins created!'))
  .catch(err => console.error(err));
