import React, { useState } from 'react';
import { fileApi } from '../utils/API.js';

const DownloadButton = ({ fileId, fileName }) => {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    try {
      setDownloading(true);
      
      // Use the range-enabled download endpoint
      const response = await fileApi.downloadFile(fileId);
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to download file');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={downloading}
      className={`
        px-4 py-2 bg-blue-600 text-white rounded-lg
        hover:bg-blue-700 transition-colors
        ${downloading ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      {downloading ? 'Downloading...' : 'Download'}
    </button>
  );
};

export default DownloadButton;