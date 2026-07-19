const excelProcessingFailureTemplate = (name, fileName, reason) => {
    return `
    <h2>Hello ${name},</h2>

    <p>
      Your Excel file <strong>${fileName}</strong> has been failed to process successfully.
    </p>

    <p>
      We request you to review your workbook
    </p>

    <p>Our system has found the following error of failure ${reason}</p>
  `;
};

export default excelProcessingFailureTemplate;