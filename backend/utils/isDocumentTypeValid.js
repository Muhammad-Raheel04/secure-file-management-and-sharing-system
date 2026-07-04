const validDocumentTypes = [
    "CV",
    "GRADUATION_DEGREE",
    "CNIC_FRONT",
    "CNIC_BACK",
    "SALARY_SLIP",
    "EMPLOYMENT_CONTRACT",
    "PERFORMANCE_REVIEW",
    "MEDICAL_CERTIFICATE",
    "OTHER",
];
export const isDocumentTypeValid = (documentType) => {
    return  validDocumentTypes.includes(documentType)
}