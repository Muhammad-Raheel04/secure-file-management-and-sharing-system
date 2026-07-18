import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { fileApi } from '../utils/API.js';
import DownloadButton from '../components/DownloadButton.jsx';
import API from '../utils/API.js';

const FileViewer = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [file, setFile] = useState(null);
  const [workbook, setWorkbook] = useState(null);
  const [currentSheetId, setCurrentSheetId] = useState(null);
  const [sheetData, setSheetData] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(100);
  const [totalRows, setTotalRows] = useState(0);
  const [status, setStatus] = useState(null);
  const [isExcelFile, setIsExcelFile] = useState(false);
  const [fileBlobUrl, setFileBlobUrl] = useState(null);

  // Check if file is Excel
  const checkIsExcel = (mimeType, originalName) => {
    return (
      mimeType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      mimeType === 'application/vnd.ms-excel' ||
      originalName.endsWith('.xlsx') ||
      originalName.endsWith('.xls')
    );
  };

  // First, fetch file info
  useEffect(() => {
    const fetchFileInfo = async () => {
      try {
        setLoading(true);
        // We need to get the file info - let's use a direct API call
        const response = await API.get(`/file/${id}`);
        const fileData = response.data.file;
        setFile(fileData);
        setIsExcelFile(checkIsExcel(fileData.mimeType, fileData.originalName));
      } catch (err) {
        setError('Failed to load file info');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchFileInfo();
  }, [id]);

  // Fetch file as blob for non-Excel files
  useEffect(() => {
    if (isExcelFile || !file) return;

    const fetchFileBlob = async () => {
      try {
        setLoading(true);
        const response = await API.get(`/file/${id}/view`, {
          responseType: 'blob',
        });
        const url = URL.createObjectURL(response.data);
        setFileBlobUrl(url);
      } catch (err) {
        setError('Failed to load file');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchFileBlob();

    // Cleanup object URL on unmount
    return () => {
      if (fileBlobUrl) {
        URL.revokeObjectURL(fileBlobUrl);
      }
    };
  }, [id, isExcelFile, file]);

  // Load workbook info if it's an Excel file
  useEffect(() => {
    if (!isExcelFile || !file) return;

    const loadWorkbook = async () => {
      try {
        setLoading(true);
        const response = await fileApi.getWorkbookInfo(id);
        const data = response.data.workbook;
        setWorkbook(data);
        
        if (data.worksheets && data.worksheets.length > 0) {
          setCurrentSheetId(data.worksheets[0].id);
        }
        
        // Check status
        const statusResponse = await fileApi.getWorkbookStatus(id);
        setStatus(statusResponse.data.status);
      } catch (err) {
        setError('Failed to load workbook');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    loadWorkbook();
  }, [id, isExcelFile, file]);

  // Load sheet data when sheet or page changes
  useEffect(() => {
    if (!currentSheetId || !isExcelFile) return;
    
    const loadSheetData = async () => {
      try {
        setLoading(true);
        const response = await fileApi.getWorksheetData(
          id, 
          currentSheetId, 
          page, 
          pageSize
        );
        const data = response.data;
        setSheetData(data);
        setTotalRows(data.totalRows);
      } catch (err) {
        setError('Failed to load sheet data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    loadSheetData();
  }, [id, currentSheetId, page, pageSize, isExcelFile]);

  // Check processing status periodically
  useEffect(() => {
    if (!workbook || workbook.status === 'COMPLETED' || !isExcelFile) return;
    
    const interval = setInterval(async () => {
      try {
        const response = await fileApi.getWorkbookStatus(id);
        const newStatus = response.data.status;
        setStatus(newStatus);
        
        if (newStatus.status === 'COMPLETED') {
          // Reload workbook data
          const workbookResponse = await fileApi.getWorkbookInfo(id);
          setWorkbook(workbookResponse.data.workbook);
          clearInterval(interval);
        }
      } catch (error) {
        console.error('Failed to check status:', error);
      }
    }, 3000);
    
    return () => clearInterval(interval);
  }, [id, workbook, isExcelFile]);

  // Transform data for AG Grid
  const { rowData, columnDefs } = useMemo(() => {
    if (!sheetData || !sheetData.rows || sheetData.rows.length === 0) {
      return { rowData: [], columnDefs: [] };
    }

    const { headers, rows } = sheetData;

    // Create column definitions
    const columnDefs = headers.map((header) => ({
      field: header,
      headerName: header,
      sortable: true,
      filter: true,
      resizable: true,
      minWidth: 100,
      flex: 1
    }));

    // Transform rows for AG Grid
    const rowData = rows.map((row) => row.data);

    return { rowData, columnDefs };
  }, [sheetData]);

  // Handle sheet change
  const handleSheetChange = (sheetId) => {
    setCurrentSheetId(sheetId);
    setPage(1);
    setSheetData(null);
  };

  // Handle pagination
  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Loading file...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  // Non-Excel file view
  if (!isExcelFile && file && fileBlobUrl) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm p-4 mb-4 flex justify-between items-center">
            <div>
              <h1 className="text-xl font-semibold text-gray-800">
                {file.originalName}
              </h1>
              <p className="text-sm text-gray-500">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            <DownloadButton fileId={id} fileName={file.originalName} />
          </div>
          {/* File view */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden h-[calc(100vh-200px)]">
            <iframe
              src={fileBlobUrl}
              className="w-full h-full border-0"
              title={file.originalName}
            />
          </div>
        </div>
      </div>
    );
  }

  // Excel processing state
  if (isExcelFile && status && status.status === 'PROCESSING') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Processing Excel file...</p>
          <p className="text-sm text-gray-500 mt-2">
            Progress: {status.progress}% ({status.processedSheets} of {status.totalSheets} sheets)
          </p>
        </div>
      </div>
    );
  }

  // Excel failed state
  if (isExcelFile && status && status.status === 'FAILED') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Failed to process Excel file</h2>
          <p className="text-gray-600">{status.errorMessage || 'An unknown error occurred'}</p>
        </div>
      </div>
    );
  }

  // Excel no sheets state
  if (isExcelFile && (!workbook || !workbook.worksheets || workbook.worksheets.length === 0)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-600 mb-4">No Sheets Found</h2>
          <p className="text-gray-500">This Excel file appears to be empty</p>
        </div>
      </div>
    );
  }

  // Excel file view
  const { worksheets } = workbook;
  const totalPages = Math.ceil(totalRows / pageSize);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-semibold text-gray-800">
              {file?.originalName || 'Excel Viewer'}
            </h1>
            <p className="text-sm text-gray-500">
              {workbook.worksheets.length} sheets • {totalRows.toLocaleString()} rows
            </p>
          </div>
          <DownloadButton fileId={id} fileName={file?.originalName} />
        </div>

        {/* Sheet Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-4 overflow-x-auto">
          <div className="flex border-b border-gray-200">
            {worksheets.map((sheet) => (
              <button
                key={sheet.id}
                onClick={() => handleSheetChange(sheet.id)}
                className={`
                  px-4 py-2 text-sm font-medium whitespace-nowrap
                  ${currentSheetId === sheet.id
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                  }
                `}
              >
                {sheet.name}
                <span className="ml-2 text-xs text-gray-400">
                  ({sheet.totalRows.toLocaleString()})
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="ag-theme-alpine" style={{ height: '600px', width: '100%' }}>
            <AgGridReact
              rowData={rowData}
              columnDefs={columnDefs}
              defaultColDef={{
                sortable: true,
                filter: true,
                resizable: true,
                flex: 1,
                minWidth: 100,
                enableCellTextSelection: true,
                ensureDomOrder: true
              }}
              loading={loading}
              enableCellTextSelection={true}
              ensureDomOrder={true}
              animateRows={true}
              suppressRowClickSelection={true}
              rowSelection="single"
              pagination={false}
            />
          </div>

          {/* Pagination Controls */}
          {totalRows > 0 && (
            <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                Showing {((page - 1) * pageSize + 1)} to{' '}
                {Math.min(page * pageSize, totalRows)} of {totalRows.toLocaleString()} rows
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(Math.max(1, page - 1))}
                  disabled={page <= 1}
                  className="px-3 py-1 bg-white border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-600">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(Math.min(totalPages, page + 1))}
                  disabled={page >= totalPages}
                  className="px-3 py-1 bg-white border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FileViewer;
