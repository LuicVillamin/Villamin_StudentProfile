const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcryptjs");

const db = new sqlite3.Database("./student_profile.db", (err) => {
    if (err) {
        console.error("Database connection failed:", err.message);
        return;
    }

    console.log("Connected to the SQLite database.");
});

// Demonstration account
const studentId = "TEST001";
const password = "TestPassword123";

// Hash the password before storing it
const passwordHash = bcrypt.hashSync(password, 10);

// Student profile information
const profile = {
    name: "Luic Villamin",
    course: "Bachelor of Science in Information Technology",
    yearLevel: "3rd Year",
    aboutMe: "I am an Information Technology student interested in mobile application development and web technologies.",
    skills: "HTML, CSS, JavaScript, Java, Cordova",
    profilePicture: ""
};

// Create the account
db.run(
    `INSERT OR IGNORE INTO student_accounts
    (student_id, password_hash)
    VALUES (?, ?)`,
    [studentId, passwordHash],
    function (err) {
        if (err) {
            console.error("Error creating student account:", err.message);
            db.close();
            return;
        }

        console.log("Test student account is ready.");

        // Create the profile
        db.run(
            `INSERT OR IGNORE INTO student_profiles
            (student_id, name, course, year_level, about_me, skills, profile_picture)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                studentId,
                profile.name,
                profile.course,
                profile.yearLevel,
                profile.aboutMe,
                profile.skills,
                profile.profilePicture
            ],
            function (err) {
                if (err) {
                    console.error("Error creating student profile:", err.message);
                } else {
                    console.log("Test student profile is ready.");
                }

                db.close((err) => {
                    if (err) {
                        console.error("Error closing database:", err.message);
                    } else {
                        console.log("Database connection closed.");
                    }
                });
            }
        );
    }
);