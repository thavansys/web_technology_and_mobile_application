const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const Admin = require('../models/Admin');
const Student = require('../models/Student');
const Result = require('../models/Result');

async function seed() {
    try {
        console.log('Seeding in-memory DB...');

        // Wipe old data
        await Student.deleteMany({});
        await Result.deleteMany({});
        console.log('Cleared existing student and result records.');

        // Admin Seed
        const existingAdmin = await Admin.findOne({ username: 'admin' });
        if (!existingAdmin) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('admin123', salt);
            await Admin.create({ username: 'admin', password: hashedPassword });
            console.log('Default admin seeded.');
        } else {
            console.log('Admin already exists.');
        }

        // Students Seed
        const depts = [
            "AIML(Artificial Intelligence And Machine Learning)",
            "CSE(Computer Science and Engineering)",
            "IT(Information Technology)",
            "ECE(Electronics and Communication Engineering)",
            "EEE(Electrical and Electronics Engineering)",
            "MECH(Mechanical Engineering)",
            "CIVIL(Civil Engineering)",
            "AERO(Aeronautical Engineering)",
            "AUTO(Automobile Engineering)",
            "BME(Biomedical Engineering)",
            "CHEM(Chemical Engineering)",
            "AIDS(Artificial Intelligence and Data Science)"
        ];

        const studentsData = [];
        
        const firstNames = [
            "Thilak", "Ananya", "Rahul", "Sneha", "Vikram",
            "Pooja", "Suresh", "Divya", "Arun", "Nisha",
            "Madhavan", "Karthik", "Meera", "Rohan", "Aditi",
            "Vijay", "Swathi", "Karan", "Sanjana", "Abhishek",
            "Gokul", "Shruthi", "Arjun", "Priya", "Manoj"
        ];
        
        const lastNames = ["Reddy", "Rao", "Verma", "Iyer", "Singh", "Das", "Babu", "Krishnan", "Kumar", "Patel"];

        const years = [1, 2, 3, 4];
        const yearToSem = { 1: 2, 2: 4, 3: 6, 4: 8 };

        for (const dept of depts) {
            const deptIndexStr = String(depts.indexOf(dept) + 1).padStart(2, '0');
            for (const year of years) {
                const sem = yearToSem[year];
                for (let i = 1; i <= 5; i++) {
                    const fname = firstNames[Math.floor(Math.random() * firstNames.length)];
                    const lname = lastNames[Math.floor(Math.random() * lastNames.length)];
                    // roll number format example: 24 (year of joining?), but let's just make it unique
                    // Let's use: 24 + year + deptIndex + studentIndex
                    const rollNo = `24${year}${deptIndexStr}${String(i).padStart(3, '0')}`;
                    studentsData.push({
                        rollNo: rollNo,
                        name: `${fname} ${lname}`,
                        dob: `200${Math.floor(Math.random() * 2) + 3}-0${Math.floor(Math.random() * 9) + 1}-${Math.floor(Math.random() * 20) + 10}`,
                        dept: dept,
                        semester: sem,
                        year: year
                    });
                }
            }
        }

        for (const s of studentsData) {
            await Student.create(s);
        }
        console.log(`Seeded ${studentsData.length} students across all departments.`);

        // Results Seed
        const coreSubjects = [
            { code: "CS601", name: "DBMS" },
            { code: "CS602", name: "Operating Systems" },
            { code: "CS603", name: "Computer Networks" },
            { code: "CS604", name: "Software Engineering" },
            { code: "CS605", name: "Web Technology" },
            { code: "CS606", name: "Machine Learning" }
        ];

        const allStudents = await Student.find({});
        for (const student of allStudents) {
            for (const sub of coreSubjects) {
                // 15% chance of arrear (U grade)
                const isArrear = Math.random() < 0.15;
                const internalMarks = Math.floor(Math.random() * 6) + 14; // 14-19
                const externalMarks = isArrear 
                    ? Math.floor(Math.random() * 15) + 10 // 10-24 (Fail)
                    : Math.floor(Math.random() * 41) + 35; // 35-75 (Pass)

                await Result.create({
                    student: student._id,
                    subjectCode: sub.code,
                    subjectName: sub.name,
                    internalMarks: internalMarks,
                    externalMarks: externalMarks
                });
            }
        }
        console.log(`Results published for all ${allStudents.length} students.`);

        console.log('\nMongoDB Seed Compilation Complete! ✅');
    } catch (err) {
        console.error(err);
        throw err;
    }
}

module.exports = seed;
