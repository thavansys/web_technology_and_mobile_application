const Student = require('../models/Student');
const Result = require('../models/Result');
const { calculateGrade } = require('../utils/gradeLogic');

const generateAIResponse = async (prompt) => {
    const url = 'http://localhost:11434/api/chat';
    
    // Using the user-requested local Ollama model
    const modelName = 'qwen3.5:latest'; 

    const payload = {
        model: modelName,
        messages: [
            { role: "user", "content": prompt }
        ],
        stream: false
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorData = await response.text();
            console.error("Ollama API Error:", errorData);
            throw new Error(`Failed to generate AI response from local Ollama model. Ensure Ollama is running and the model '${modelName}' is installed.`);
        }

        const data = await response.json();
        return data.message.content;
    } catch (error) {
        console.error("Fetch Error:", error);
        throw new Error(`Failed to connect to local Ollama API. Ensure Ollama is running locally on port 11434. Error: ${error.message}`);
    }
};

// @route   POST /api/ai/student-insights
// @desc    Generate personalized insights for a student's performance
// @access  Student (or Admin)
const getStudentInsights = async (req, res) => {
    try {
        const { studentName, rollNo, results, cgpa } = req.body;

        if (!results || results.length === 0) {
            return res.status(400).json({ success: false, message: 'No results provided for analysis.' });
        }

        let prompt = `You are an encouraging and analytical academic advisor. Analyze the following semester results for student ${studentName} (Roll: ${rollNo}). Their overall CGPA is ${cgpa}.\n\nResults:\n`;
        results.forEach(r => {
            prompt += `- ${r.subjectName} (${r.subjectCode}): Total Marks: ${r.total}/100, Grade: ${r.grade}, Status: ${r.isPass ? 'Pass' : 'Fail'}\n`;
        });
        
        prompt += `\nPlease provide a short, encouraging summary (max 3 paragraphs). Highlight their strongest subjects, identify subjects they need to focus more on, and offer brief, actionable advice for the next semester. Do not use complex markdown formatting, just simple paragraphs.`;

        const aiText = await generateAIResponse(prompt);
        
        res.status(200).json({ success: true, data: aiText });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message || 'Server error generating insights.' });
    }
};

// @route   POST /api/ai/admin-insights
// @desc    Answer natural language queries about batch performance for admins
// @access  Admin
const getAdminInsights = async (req, res) => {
    try {
        const { query } = req.body;

        if (!query) {
            return res.status(400).json({ success: false, message: 'No query provided.' });
        }

        // Fetch all students and their results to provide as context
        const students = await Student.find().lean();
        const results = await Result.find().lean();

        // Map results to students for easier AI parsing
        const dataMap = students.map(s => {
            const studentResults = results.filter(r => r.student.toString() === s._id.toString());
            const formattedResults = studentResults.map(r => {
                const eval = calculateGrade(r.internalMarks, r.externalMarks);
                return {
                    subjectCode: r.subjectCode,
                    subjectName: r.subjectName,
                    internalMarks: r.internalMarks,
                    externalMarks: r.externalMarks,
                    total: r.internalMarks + r.externalMarks,
                    isPass: eval.isPass,
                    grade: eval.grade
                };
            });
            return {
                rollNo: s.rollNo,
                name: s.name,
                department: s.dept,
                semester: s.semester,
                results: formattedResults
            };
        });

        const contextData = JSON.stringify(dataMap);

        let prompt = `You are a helpful data analyst AI for a college administration. You are provided with a JSON array containing all student records and their marks.\n\n`;
        prompt += `Data Context:\n${contextData}\n\n`;
        prompt += `The admin has asked the following question: "${query}"\n\n`;
        prompt += `Please answer the admin's question accurately based ONLY on the provided Data Context. Be concise, direct, and professional. Do not use complex markdown formatting, just plain text or simple lists.`;

        const aiText = await generateAIResponse(prompt);
        
        res.status(200).json({ success: true, data: aiText });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message || 'Server error generating insights.' });
    }
};

module.exports = {
    getStudentInsights,
    getAdminInsights
};
