export function downloadJSON(data: unknown, filename: string) {
  // Ensure .json suffix
  const safeFilename = filename.toLowerCase().endsWith(".json")
    ? filename
    : `${filename}.json`;

  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  // Create a temporary <a> element
  const a = document.createElement("a");
  a.href = url;
  a.download = safeFilename;

  // Append to DOM and trigger click inside a user gesture
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  // Release the object URL
  setTimeout(() => URL.revokeObjectURL(url), 100);
}
