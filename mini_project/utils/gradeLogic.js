/**
 * Calculates grade details based on internal and external marks
 * @param {number} internal - Internal marks (max 20)
 * @param {number} external - External marks (max 80)
 * @returns {object} { total, grade, gradePoint, isPass }
 */
const calculateGrade = (internal, external) => {
    const intM = parseInt(internal) || 0;
    const extM = parseInt(external) || 0;
    const total = intM + extM;
    
    // Pass condition: external marks >= 32 AND total >= 40
    let isPass = false;
    if (extM >= 32 && total >= 40) {
        isPass = true;
    }

    let grade = 'F';
    let gradePoint = 0;

    if (isPass) {
        if (total >= 90) { grade = 'O'; gradePoint = 10; }
        else if (total >= 80) { grade = 'A+'; gradePoint = 9; }
        else if (total >= 70) { grade = 'A'; gradePoint = 8; }
        else if (total >= 60) { grade = 'B+'; gradePoint = 7; }
        else if (total >= 50) { grade = 'B'; gradePoint = 6; }
        else if (total >= 40) { grade = 'C'; gradePoint = 5; }
    }

    return { total, grade, gradePoint, isPass };
};

/**
 * Calculates CGPA from an array of results
 * @param {Array} results - Array of result objects which contain gradePoint
 * @returns {string} CGPA rounded to 2 decimal places
 */
const calculateCGPA = (results) => {
    if (!results || results.length === 0) return '0.00';
    const totalPoints = results.reduce((sum, res) => sum + (res.gradePoint || 0), 0);
    return (totalPoints / results.length).toFixed(2);
};

module.exports = {
    calculateGrade,
    calculateCGPA
};
