import * as XLSX from 'xlsx';

export interface ExportColumnMap {
  [key: string]: string; // key -> Header Label
}

/**
 * Export data array to Microsoft Excel (.xlsx) file client-side.
 * Optimized for large datasets.
 *
 * @param data Array of records to export
 * @param filename File name without extension
 * @param sheetName Optional sheet tab name (default: 'Report')
 * @param columnMap Optional mapping of object keys to human-readable column headers
 */
export const exportToExcel = <T extends Record<string, any>>(
  data: T[],
  filename: string,
  sheetName: string = 'Report',
  columnMap?: ExportColumnMap
): void => {
  if (!data || data.length === 0) {
    console.warn('exportToExcel: No data to export.');
    return;
  }

  // Transform data if columnMap is provided
  let exportRows: Record<string, any>[] = [];

  if (columnMap) {
    const keys = Object.keys(columnMap);
    exportRows = data.map((item) => {
      const row: Record<string, any> = {};
      keys.forEach((key) => {
        const headerLabel = columnMap[key];
        const val = item[key];
        // Clean null/undefined values to empty string or numeric 0 if appropriate
        row[headerLabel] = val !== undefined && val !== null ? val : '';
      });
      return row;
    });
  } else {
    exportRows = data.map((item) => ({ ...item }));
  }

  // Create worksheet from JSON
  const worksheet = XLSX.utils.json_to_sheet(exportRows);

  // Auto-calculate column widths
  if (exportRows.length > 0) {
    const headers = Object.keys(exportRows[0]);
    const colWidths = headers.map((header) => {
      let maxLen = header.toString().length;
      // Sample up to first 200 rows for speed on large datasets
      const sampleSize = Math.min(exportRows.length, 200);
      for (let i = 0; i < sampleSize; i++) {
        const val = exportRows[i][header];
        if (val !== undefined && val !== null) {
          const strLen = val.toString().length;
          if (strLen > maxLen) {
            maxLen = strLen;
          }
        }
      }
      return { wch: Math.min(Math.max(maxLen + 3, 10), 50) };
    });

    worksheet['!cols'] = colWidths;
  }

  // Create workbook and append worksheet
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName.substring(0, 31)); // Sheet name max 31 chars in Excel

  // Format file name with timestamp if not present
  const timeStamp = new Date().toISOString().replace(/[-:T]/g, '').substring(0, 14);
  const finalFileName = filename.endsWith('.xlsx') ? filename : `${filename}_${timeStamp}.xlsx`;

  // Trigger client-side browser file download
  XLSX.writeFile(workbook, finalFileName);
};
