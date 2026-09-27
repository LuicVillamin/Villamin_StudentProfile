const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");

const app = express();
const PORT = 3000;

// JWT secret comes from an environment variable.
// Do not store the actual secret in GitHub.
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    console.error("JWT_SECRET environment variable is not set.");
    process.exit(1);
}

app.use(cors());
app.use(express.json());

// Connect to SQLite database
const db = new sqlite3.Database("./student_profile.db", (err) => {
    if (err) {
        console.error("Database connection failed:", err.message);
    } else {
        console.log("Connected to the SQLite database.");

        // Student login accounts
        db.run(`
            CREATE TABLE IF NOT EXISTS student_accounts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                student_id TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL
            )
        `, (err) => {
            if (err) {
                console.error(
                    "Error creating student_accounts table:",
                    err.message
                );
            } else {
                console.log("student_accounts table is ready.");
            }
        });

        // Student profile information
        db.run(`
            CREATE TABLE IF NOT EXISTS student_profiles (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                student_id TEXT UNIQUE NOT NULL,
                name TEXT NOT NULL,
                course TEXT NOT NULL,
                year_level TEXT NOT NULL,
                about_me TEXT NOT NULL,
                skills TEXT NOT NULL,
                profile_picture TEXT,
                FOREIGN KEY (student_id)
                    REFERENCES student_accounts(student_id)
            )
        `, (err) => {
            if (err) {
                console.error(
                    "Error creating student_profiles table:",
                    err.message
                );
            } else {
                console.log("student_profiles table is ready.");
            }
        });
    }
});

// Authentication middleware
function authenticateToken(req, res, next) {
    const authHeader = req.headers["authorization"];

    if (!authHeader) {
        return res.status(401).json({
            success: false,
            message: "Authentication required."
        });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({
            success: false,
            message: "Authentication token is missing."
        });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({
                success: false,
                message: "Invalid or expired authentication token."
            });
        }

        req.user = user;
        next();
    });
}

// Test route
app.get("/", (req, res) => {
    res.json({
        message: "Student Profile API is running."
    });
});

// Login
app.post("/api/login", (req, res) => {
    const { studentId, password } = req.body;

    if (!studentId || !password) {
        return res.status(400).json({
            success: false,
            message: "Student ID and password are required."
        });
    }

    db.get(
        `SELECT * FROM student_accounts WHERE student_id = ?`,
        [studentId],
        async (err, account) => {
            if (err) {
                console.error(
                    "Login database error:",
                    err.message
                );

                return res.status(500).json({
                    success: false,
                    message: "Unable to authenticate. Please try again."
                });
            }

            if (!account) {
                return res.status(401).json({
                    success: false,
                    message: "Invalid student ID or password."
                });
            }

            const passwordMatches = await bcrypt.compare(
                password,
                account.password_hash
            );

            if (!passwordMatches) {
                return res.status(401).json({
                    success: false,
                    message: "Invalid student ID or password."
                });
            }

            // Create an authentication token
            const token = jwt.sign(
                {
                    studentId: account.student_id
                },
                JWT_SECRET,
                {
                    expiresIn: "1h"
                }
            );

            res.json({
                success: true,
                message: "Login successful.",
                studentId: account.student_id,
                token: token
            });
        }
    );
});

// Retrieve the authenticated student's profile
app.get("/api/profile", authenticateToken, (req, res) => {
    const studentId = req.user.studentId;

    db.get(
        `SELECT
            student_id,
            name,
            course,
            year_level,
            about_me,
            skills,
            profile_picture
         FROM student_profiles
         WHERE student_id = ?`,
        [studentId],
        (err, profile) => {
            if (err) {
                console.error(
                    "Profile database error:",
                    err.message
                );

                return res.status(500).json({
                    success: false,
                    message:
                        "Unable to retrieve your profile. Please try again."
                });
            }

            if (!profile) {
                return res.status(404).json({
                    success: false,
                    message: "Student profile not found."
                });
            }

            res.json({
                success: true,
                profile: profile
            });
        }
    );
});

// Update the authenticated student's profile
app.put("/api/profile", authenticateToken, (req, res) => {
    const studentId = req.user.studentId;

    const {
        name,
        course,
        yearLevel,
        aboutMe,
        skills,
        profilePicture
    } = req.body;

    // Validate required profile fields
    if (
        !name ||
        !course ||
        !yearLevel ||
        !aboutMe ||
        !skills
    ) {
        return res.status(400).json({
            success: false,
            message:
                "Please complete all required profile information."
        });
    }

    const sql = `
        UPDATE student_profiles
        SET
            name = ?,
            course = ?,
            year_level = ?,
            about_me = ?,
            skills = ?,
            profile_picture = ?
        WHERE student_id = ?
    `;

    db.run(
        sql,
        [
            name,
            course,
            yearLevel,
            aboutMe,
            skills,
            profilePicture || "",
            studentId
        ],
        function (err) {
            if (err) {
                console.error(
                    "Profile update database error:",
                    err.message
                );

                return res.status(500).json({
                    success: false,
                    message: "Unable to update your profile."
                });
            }

            if (this.changes === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Student profile not found."
                });
            }

            res.json({
                success: true,
                message: "Profile updated successfully."
            });
        }
    );
});

// Start server
app.listen(PORT, "0.0.0.0", () => {
    console.log(
        `Server running at http://localhost:${PORT}`
    );
});