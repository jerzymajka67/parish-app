const fs = require("fs");
const path = require("path");

/**
 * Get all Sundays in a given month
 */
function getSundays(year, month) {
  const sundays = [];
  const date = new Date(year, month - 1, 1);

  while (date.getMonth() === month - 1) {
    if (date.getDay() === 0) {
      sundays.push(new Date(date));
    }
    date.setDate(date.getDate() + 1);
  }
  return sundays;
}

/**
 * Create a placeholder HTML homily
 */
function createHTML(filePath, date, language) {
  const isoDate = date.toISOString().slice(0, 10);

  const html = `<!DOCTYPE html>
<html lang="${language}">
<head>
  <meta charset="UTF-8">
  <title>Homily for ${isoDate}</title>
</head>
<body>

<article class="homily">
  <h1>Homily for ${isoDate}</h1>

  <p>
    The homily for this Sunday is not available yet.
    Please check back later.
  </p>

  <p>
    May the Word of God guide us and strengthen our faith.
  </p>
</article>

</body>
</html>`;

  fs.writeFileSync(filePath, html, "utf8");
  console.log("Created:", filePath);
}

/**
 * Create homilies folder structure and files
 */
function createHomilies() {
  const basePath = path.join(__dirname, "..", "cloudinary", "homilies");
  const years = [2025, 2026];
  const languages = ["en", "es"];

  for (const year of years) {
    for (const lang of languages) {
      const yearLangPath = path.join(basePath, String(year), lang);
      fs.mkdirSync(yearLangPath, { recursive: true });

      for (let month = 1; month <= 12; month++) {
        const sundays = getSundays(year, month);

        for (const date of sundays) {
          const fileName = `${date.toISOString().slice(0, 10)}.html`;
          const filePath = path.join(yearLangPath, fileName);

          if (!fs.existsSync(filePath)) {
            createHTML(filePath, date, lang);
          }
        }
      }
    }
  }
}

// RUN
createHomilies();
