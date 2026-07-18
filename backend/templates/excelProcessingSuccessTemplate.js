const excelProcessingSuccessTemplate = (name, fileName) => {
  return `
    <h2>Hello ${name},</h2>

    <p>
      Your Excel file <strong>${fileName}</strong> has been processed successfully.
    </p>

    <p>
      You can now view and interact with the processed workbook in the application.
    </p>

    <p>Thank you for using our Secure File Management & Sharing System.</p>
  `;
};

export default excelProcessingSuccessTemplate;