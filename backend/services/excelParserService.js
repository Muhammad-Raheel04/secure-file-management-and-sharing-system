import ExcelJS from 'exceljs';
import { prisma } from '../config/prisma.js';
import fs from 'fs';

const ROW_BATCH_SIZE = Number(process.env.EXCEL_ROW_BATCH_SIZE) || 1000;
const CELL_BATCH_SIZE = Number(process.env.EXCEL_CELL_BATCH_SIZE) || 5000;
const STREAM_OPTIONS = {
  sharedStrings: 'cache',
  hyperlinks: 'ignore',
  styles: 'ignore',
  worksheets: 'emit'
};


export const parseExcelFile = async (workbookId, filePath, job = null) => {
  const updateProgress = async (progress) => {
    try {
      await prisma.workbook.update({
        where: { id: workbookId },
        data: { progress: Math.min(Math.max(progress, 0), 100) }
      });

      if (job) {
        await job.updateProgress(Math.min(Math.max(progress, 0), 100));
      }
    } catch (err) {
      console.error('parseExcelFile - Failed to update progress:', err);
    }
  };

  try {
    await prisma.worksheetCell.deleteMany({
      where: {
        row: {
          worksheet: {
            workbookId
          }
        }
      }
    });
    await prisma.worksheetRow.deleteMany({
      where: { worksheet: { workbookId } }
    });
    await prisma.worksheetColumn.deleteMany({
      where: { worksheet: { workbookId } }
    });
    await prisma.worksheet.deleteMany({
      where: { workbookId }
    });

    await prisma.workbook.update({
      where: { id: workbookId },
      data: { status: 'PROCESSING', progress: 0, processedSheets: 0, totalSheets: 0 }
    });
    await updateProgress(0);

    const fileExists = fs.existsSync(filePath);
    if (!fileExists) {
      throw new Error(`File not found at path: ${filePath}`);
    }

    let totalSheets = 0;
    const counter = new ExcelJS.stream.xlsx.WorkbookReader(filePath);

    for await (const worksheet of counter) {
      totalSheets++;
    }

    await prisma.workbook.update({
      where: { id: workbookId },
      data: { totalSheets }
    });
    await updateProgress(1);

    const workbookReader = new ExcelJS.stream.xlsx.WorkbookReader(filePath, STREAM_OPTIONS);

    let sheetIndex = 0;
    for await (const worksheet of workbookReader) {

      const sheetName = worksheet.name || `Sheet${sheetIndex + 1}`
      const dbWorksheet = await prisma.worksheet.create({
        data: {
          workbookId,
          name: sheetName,
          sheetIndex,
          totalRows: 0,
          totalColumns: 0
        }
      });
      await processWorksheetStream(dbWorksheet.id, worksheet);

      const processedSheets = sheetIndex + 1;
      const progress = Math.round((processedSheets / totalSheets) * 100);
      await prisma.workbook.update({
        where: { id: workbookId },
        data: {
          processedSheets,
          progress: Math.min(progress, 100)
        }
      });
      await updateProgress(progress);

      sheetIndex++;
    }
    await prisma.workbook.update({
      where: { id: workbookId },
      data: { status: 'COMPLETED', progress: 100 }
    });
    console.log('Workbook status updated to COMPLETED');
    await updateProgress(100);
    console.log('Progress: Complete!');

    return { success: true };
  } catch (error) {
    console.error('Excel parsing error:', error);
    console.error('Error stack:', error.stack);
    throw error;
  }
};

const processWorksheetStream = async (worksheetId, worksheet) => {

  let columns = [];
  let columnIdMap = null;
  let isFirstRow = true;
  let rowNumber = 0;
  let rowBatch = [];
  let columnCount = 0;
  let totalRows = 0;

  const flushRowBatch = async () => {
    if (rowBatch.length === 0) {
      console.log('processWorksheetStream - flushRowBatch: No rows to flush');
      return;
    }

    console.log('processWorksheetStream - flushRowBatch: Flushing', rowBatch.length, 'rows...');
    const batch = rowBatch;
    rowBatch = [];
    await insertRowBatch(worksheetId, batch, columnIdMap);
    console.log('processWorksheetStream - flushRowBatch: Batch flushed');
  };

  try {
    for await (const row of worksheet) {
      rowNumber++;

      if (isFirstRow) {
        columns = await processHeaders(worksheetId, row);
        columnIdMap = new Map(columns.map(col => [col.columnIndex, col.id]));
        isFirstRow = false;
        columnCount = columns.length;

        await prisma.worksheet.update({
          where: { id: worksheetId },
          data: { totalColumns: columnCount }
        });

        continue;
      }

      totalRows++;

      const cells = [];
      row.eachCell((cell, colNumber) => {
        const columnId = columnIdMap?.get(colNumber);
        if (columnId) {
          const value = cell.value;
          cells.push({
            columnId,
            value: value !== null && value !== undefined ? String(value) : null,
            valueType: detectDataType(cell)
          });
        }
      });

      if (cells.length > 0) {
        rowBatch.push({
          rowNumber: totalRows,
          cells
        });

        if (rowBatch.length >= ROW_BATCH_SIZE) {
          await flushRowBatch();

          if (totalRows % 10000 === 0) {
            console.log(`processWorksheetStream - Processed ${totalRows} rows in worksheet ${worksheetId}`);
          }
        }
      }
    }

    await flushRowBatch();

    await prisma.worksheet.update({
      where: { id: worksheetId },
      data: { totalRows: Math.max(0, totalRows) }
    });

  } catch (error) {
    console.error(`--- processWorksheetStream: ERROR for worksheet ${worksheetId} ---`);
    console.error('Worksheet processing failed:', error);
    console.error('Error stack:', error.stack);
    throw error;
  }
};

const processHeaders = async (worksheetId, headerRow) => {
  const columnsData = [];
  const headerCells = [];

  headerRow.eachCell((cell, colNumber) => {
    const value = cell.value;
    headerCells.push({
      colNumber,
      value: value !== null && value !== undefined ? String(value) : `Column${colNumber}`
    });
  });

  if (headerCells.length === 0) {
    for (let i = 1; i <= 10; i++) {
      columnsData.push({
        worksheetId,
        name: `Column${i}`,
        columnIndex: i,
        dataType: 'text'
      });
    }
  } else {
    headerCells.forEach(({ colNumber, value }) => {
      columnsData.push({
        worksheetId,
        name: value || `Column${colNumber}`,
        columnIndex: colNumber,
        dataType: 'text'
      });
    });
  }
  try {
    const result = await prisma.worksheetColumn.createManyAndReturn({
      data: columnsData
    });

    return result;
  } catch (error) {
    await prisma.worksheetColumn.createMany({
      data: columnsData
    });
    const result = await prisma.worksheetColumn.findMany({
      where: { worksheetId },
      orderBy: { columnIndex: 'asc' }
    });
    return result;
  }
};

const insertRowBatch = async (worksheetId, rowBatch, columnIdMap) => {
  try {
    if (!rowBatch.length) {
      console.log('insertRowBatch - No rows in batch, returning early');
      return;
    }


    const rowsData = rowBatch.map(item => ({
      worksheetId,
      rowNumber: item.rowNumber
    }));

    let createdRows;
    try {
      createdRows = await prisma.worksheetRow.createManyAndReturn({
        data: rowsData
      });
    } catch (error) {
      await prisma.worksheetRow.createMany({
        data: rowsData
      });
      createdRows = await prisma.worksheetRow.findMany({
        where: {
          worksheetId,
          rowNumber: { in: rowBatch.map(item => item.rowNumber) }
        },
        orderBy: { rowNumber: 'asc' }
      });
    }

    const rowMap = new Map(createdRows.map(row => [row.rowNumber, row.id]));
    const cellsData = [];

    rowBatch.forEach(item => {
      const rowId = rowMap.get(item.rowNumber);
      if (!rowId) {
        console.log('insertRowBatch - No row ID found for rowNumber:', item.rowNumber);
        return;
      }

      item.cells.forEach(cell => {
        if (cell.columnId) {
          cellsData.push({
            rowId,
            columnId: cell.columnId,
            value: cell.value,
            valueType: cell.valueType
          });
        }
      });
    });

    if (cellsData.length > 0) {
      for (let i = 0; i < cellsData.length; i += CELL_BATCH_SIZE) {
        const batch = cellsData.slice(i, i + CELL_BATCH_SIZE);
        try {
          await prisma.worksheetCell.createMany({
            data: batch,
            skipDuplicates: true
          });
        } catch (error) {
          console.error('insertRowBatch - Error inserting cell batch:', error);
          throw error;
        }
      }
    }

  } catch (error) {
    console.error('Error inserting row batch:', error);
    console.error('Error stack:', error.stack);
    throw error;
  }
};

const detectDataType = (cell) => {
  if (!cell || cell.type === undefined) return 'text';

  switch (cell.type) {
    case ExcelJS.ValueType.Number:
      return 'number';
    case ExcelJS.ValueType.Date:
      return 'date';
    case ExcelJS.ValueType.Boolean:
      return 'boolean';
    case ExcelJS.ValueType.Formula:
      return 'formula';
    case ExcelJS.ValueType.String:
      return 'text';
    default:
      return 'text';
  }
};
