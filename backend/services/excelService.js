import { prisma } from '../config/prisma.js';

export const getWorkbookInfoService = async (fileId) => {
  fileId = parseInt(fileId);
  const workbook = await prisma.workbook.findUnique({
    where: { fileId },
    include: {
      file: true,
      worksheets: {
        orderBy: { sheetIndex: 'asc' },
        select: {
          id: true,
          name: true,
          sheetIndex: true,
          totalRows: true,
          totalColumns: true
        }
      }
    }
  });

  if (!workbook) {
    throw new Error('Workbook not found');
  }

  return workbook;
};

export const getWorksheetDataService = async (worksheetId, page = 1, pageSize = 100) => {
  worksheetId = parseInt(worksheetId);
  
  const worksheet = await prisma.worksheet.findUnique({
    where: { id: worksheetId },
    include: {
      columns: {
        orderBy: { columnIndex: 'asc' }
      }
    }
  });

  if (!worksheet) {
    throw new Error('Worksheet not found');
  }

  const headers = worksheet.columns.map(col => col.name);

  const skip = (page - 1) * pageSize;
  
  const rows = await prisma.worksheetRow.findMany({
    where: { worksheetId: parseInt(worksheetId) },
    orderBy: { rowNumber: 'asc' },
    skip,
    take: pageSize,
    include: {
      cells: {
        include: {
          column: true
        }
      }
    }
  });

  const transformedRows = rows.map(row => {
    const rowData = {};
    row.cells.forEach(cell => {
      const columnName = cell.column.name;
      rowData[columnName] = cell.value;
    });
    return {
      rowNumber: row.rowNumber,
      data: rowData
    };
  });

  return {
    page,
    pageSize,
    totalRows: worksheet.totalRows,
    totalPages: Math.ceil(worksheet.totalRows / pageSize),
    headers,
    rows: transformedRows
  };
};


export const getWorkbookStatusService = async (fileId) => {
  fileId = parseInt(fileId);
  const workbook = await prisma.workbook.findUnique({
    where: { fileId },
    select: {
      id: true,
      status: true,
      progress: true,
      totalSheets: true,
      processedSheets: true,
      errorMessage: true
    }
  });

  return workbook;
};