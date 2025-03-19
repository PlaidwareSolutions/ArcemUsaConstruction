import * as XLSX from 'xlsx';

/**
 * Export data to an Excel file and trigger download
 * @param data Array of objects to export
 * @param fileName Name of the file to download (without extension)
 * @param sheetName Name of the worksheet
 */
export function exportToExcel(data: any[], fileName: string, sheetName: string = 'Sheet1'): void {
  // Create a new workbook
  const workbook = XLSX.utils.book_new();
  
  // Convert data to worksheet
  const worksheet = XLSX.utils.json_to_sheet(data);
  
  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  
  // Generate Excel file and trigger download
  XLSX.writeFile(workbook, `${fileName}.xlsx`);
}

/**
 * Format data for export by removing unnecessary fields and formatting dates
 * @param data Raw data from API
 * @param excludeFields Fields to exclude from export
 * @param dateFields Fields to format as dates
 */
export function formatDataForExport(
  data: any[], 
  excludeFields: string[] = [], 
  dateFields: string[] = []
): any[] {
  return data.map(item => {
    const formattedItem: any = {};
    
    // Copy all fields except excluded ones
    Object.keys(item).forEach(key => {
      if (!excludeFields.includes(key)) {
        // Format date fields
        if (dateFields.includes(key) && item[key]) {
          formattedItem[key] = new Date(item[key]).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          });
        } else {
          formattedItem[key] = item[key];
        }
      }
    });
    
    return formattedItem;
  });
}