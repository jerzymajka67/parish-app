function stampFileName(filename) {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Chicago",
    year: "2-digit",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  });
  const parts = Object.fromEntries(
    formatter.formatToParts(new Date()).map(p => [p.type, p.value])
  );
  const timestamp = `${parts.year}-${parts.month}-${parts.day}_${parts.hour}-${parts.minute}`;
  // remove existing timestamp if present
  const cleanName = filename.replace(/_\d{2}-\d{2}-\d{2}_\d{2}-\d{2}(?=\.)?/g, "");
  // insert timestamp before extension (or at end if no extension)
  return cleanName.replace(
    /(\.[^./\\]+)?$/,
    `_${timestamp}$1`
  );
}

module.exports = stampFileName;
