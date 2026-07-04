const validCategories = ["IDENTITY", "EDUCATION", "PROFESSIONAL", "FINANCIAL", "OTHER"];

export const isValidCategory = (category) => {
    return validCategories.includes(category);
}