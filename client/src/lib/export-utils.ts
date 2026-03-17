export function exportToCSV(data: any[], filename: string) {
  if (!data || data.length === 0) {
    console.warn("Nenhum dado para exportar");
    return;
  }

  // Headers
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(","),
    ...data.map(row =>
      headers.map(header => {
        const value = row[header];
        // Escape quotes and wrap in quotes if contains comma or newline
        if (typeof value === "string" && (value.includes(",") || value.includes("\n") || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value ?? "";
      }).join(",")
    ),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  downloadFile(blob, `${filename}.csv`);
}

export function exportToExcel(data: any[], filename: string) {
  // Simple XLSX generation - export as CSV which Excel can open
  if (!data || data.length === 0) {
    console.warn("Nenhum dado para exportar");
    return;
  }

  // For a proper Excel file, we'd need a library
  // For now, export as CSV which Excel can open
  exportToCSV(data, filename);
}

export function exportToPDF(data: any[], filename: string, title: string) {
  // This would require a PDF library like jsPDF
  // For now, we'll create a simple HTML table and print it
  const htmlContent = generateHTMLTable(data, title);
  
  const newWindow = window.open("", "_blank");
  if (!newWindow) {
    console.error("Não foi possível abrir a janela de impressão");
    return;
  }

  newWindow.document.write(htmlContent);
  newWindow.document.close();
  
  // Trigger print dialog
  setTimeout(() => {
    newWindow.print();
  }, 250);
}

function generateHTMLTable(data: any[], title: string): string {
  if (!data || data.length === 0) return "<p>Nenhum dado</p>";

  const headers = Object.keys(data[0]);
  const headerRow = headers.map(h => `<th style="border: 1px solid #ddd; padding: 8px; background-color: #005A92; color: white;">${h}</th>`).join("");
  
  const bodyRows = data.map(row =>
    `<tr>${headers.map(h => `<td style="border: 1px solid #ddd; padding: 8px;">${row[h] ?? ""}</td>`).join("")}</tr>`
  ).join("");

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${title}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        h1 { color: #005A92; }
        table { border-collapse: collapse; width: 100%; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #005A92; color: white; }
        @media print {
          body { margin: 0; }
          table { page-break-inside: avoid; }
        }
      </style>
    </head>
    <body>
      <h1>${title}</h1>
      <p>Gerado em: ${new Date().toLocaleDateString("pt-BR")} às ${new Date().toLocaleTimeString("pt-BR")}</p>
      <table>
        <thead><tr>${headerRow}</tr></thead>
        <tbody>${bodyRows}</tbody>
      </table>
    </body>
    </html>
  `;
}

function downloadFile(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

export function formatInstrumentosForExport(instrumentos: any[]) {
  return instrumentos.map(i => ({
    "Número": i.numero,
    "Tipo": i.tipo,
    "Diretoria": i.diretoria,
    "Partes Envolvidas": i.partesEnvolvidas,
    "Objeto": i.objeto,
    "Data Início": i.dataInicio ? new Date(i.dataInicio).toLocaleDateString("pt-BR") : "N/A",
    "Data Término": i.dataTermino ? new Date(i.dataTermino).toLocaleDateString("pt-BR") : "N/A",
    "Processo SEI": i.processoSei || "N/A",
  }));
}
