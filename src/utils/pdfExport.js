import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export function exportInventoryToPDF(chemicals) {
  const doc = new jsPDF();

  doc.setFontSize(22);
  doc.setTextColor(30, 41, 59);
  doc.text("CHEMSTOCK PRO", 14, 18);

  doc.setFontSize(16);
  doc.text("Chemical Inventory Report", 14, 28);

  doc.setFontSize(11);
  doc.text(
    "Generated: " + new Date().toLocaleString(),
    14,
    36
  );

  const tableData = chemicals.map((item) => [
    item.name,
    item.formula,
    item.quantity,
    item.unit,
    item.location,
    item.expiry,
    item.supplier,
  ]);

  autoTable(doc, {
    startY: 45,
    head: [[
      "Chemical",
      "Formula",
      "Qty",
      "Unit",
      "Location",
      "Expiry",
      "Supplier",
    ]],
    body: tableData,
    theme: "grid",
    headStyles: {
      fillColor: [37, 99, 235],
    },
    styles: {
      fontSize: 10,
    },
  });

  const pageHeight = doc.internal.pageSize.height;

  doc.setFontSize(12);

  doc.text(
    `Total Chemicals : ${chemicals.length}`,
    14,
    pageHeight - 20
  );

  doc.save("ChemStock_Report.pdf");
}