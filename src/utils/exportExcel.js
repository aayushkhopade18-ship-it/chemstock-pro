import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export function exportInventoryToExcel(chemicals) {
  const data = chemicals.map((item) => ({
    "Chemical Name": item.name,
    Formula: item.formula,
    Quantity: item.quantity,
    Unit: item.unit,
    Location: item.location,
    Expiry: item.expiry,
    Supplier: item.supplier,
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);

  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(
    workbook,
    worksheet,
    "Chemical Inventory"
  );

  const excelBuffer = XLSX.write(workbook, {
    bookType: "xlsx",
    type: "array",
  });

  const file = new Blob([excelBuffer], {
    type:
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
  });

  saveAs(file, "ChemStock_Inventory.xlsx");
}