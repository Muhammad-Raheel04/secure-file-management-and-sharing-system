import React from 'react';

const SheetTabs = ({ sheets, currentSheet, onSheetChange }) => {
  return (
    <div className="flex overflow-x-auto border-b border-gray-200">
      {sheets.map((sheet) => (
        <button
          key={sheet}
          onClick={() => onSheetChange(sheet)}
          className={`
            px-4 py-2 text-sm font-medium whitespace-nowrap
            ${currentSheet === sheet
              ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
              : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
            }
          `}
        >
          {sheet}
        </button>
      ))}
    </div>
  );
};

export default SheetTabs;