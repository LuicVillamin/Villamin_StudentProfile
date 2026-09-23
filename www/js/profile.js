document.addEventListener("DOMContentLoaded", function () {

    // Default profile information
    const defaultProfile = {
        fullName: "Luic Villamin",
        course: "Bachelor of Science in Information Technology",
        yearLevel: "3rd Year",
        aboutMe: "I am a Bachelor of Science in Information Technology student who is interested in computers, programming, and technology.",
        skills: "HTML, CSS, Java Programming, Problem Solving, Computer Skills"
    };

    // Get saved profile from localStorage
    let profile = JSON.parse(localStorage.getItem("studentProfile"));

    // If there is no saved profile, use the default information
    if (!profile) {
        profile = defaultProfile;
    }

    // Display the profile information
    displayProfile(profile);

    // Load saved profile picture
    loadProfilePicture();

    // Edit Profile button
    const editButton = document.getElementById("editProfileButton");

    if (editButton) {
        editButton.addEventListener("click", function () {
            openEditForm(profile);
        });
    }

    // Display profile information
    function displayProfile(data) {

        document.getElementById("profileName").textContent = data.fullName;
        document.getElementById("profileCourse").textContent = data.course;
        document.getElementById("profileYear").textContent = data.yearLevel;
        document.getElementById("profileAbout").textContent = data.aboutMe;
        document.getElementById("profileSkills").textContent = data.skills;
    }

    // Load saved profile picture from localStorage
    function loadProfilePicture() {

        const savedPicture = localStorage.getItem("profilePicture");

        if (savedPicture) {
            document.getElementById("profilePicture").src = savedPicture;
        }
    }

    // Open Edit Profile form
    function openEditForm(data) {

        document.getElementById("editForm").style.display = "block";
        document.getElementById("profileDisplay").style.display = "none";

        document.getElementById("fullName").value = data.fullName;
        document.getElementById("course").value = data.course;
        document.getElementById("yearLevel").value = data.yearLevel;
        document.getElementById("aboutMe").value = data.aboutMe;
        document.getElementById("skills").value = data.skills;
    }

    // Save the edited profile
    document.getElementById("saveProfileButton").addEventListener("click", function () {

        const fullName = document.getElementById("fullName").value.trim();
        const course = document.getElementById("course").value.trim();
        const yearLevel = document.getElementById("yearLevel").value.trim();
        const aboutMe = document.getElementById("aboutMe").value.trim();
        const skills = document.getElementById("skills").value.trim();

        // Validate required fields
        if (fullName === "") {
            alert("Please enter your full name.");
            return;
        }

        if (course === "") {
            alert("Please enter your course.");
            return;
        }

        if (yearLevel === "") {
            alert("Please enter your year level.");
            return;
        }

        if (aboutMe === "") {
            alert("Please enter information about yourself.");
            return;
        }

        // Create updated profile
        profile = {
            fullName: fullName,
            course: course,
            yearLevel: yearLevel,
            aboutMe: aboutMe,
            skills: skills
        };

        // Save profile to localStorage
        localStorage.setItem("studentProfile", JSON.stringify(profile));

        // Update the displayed profile
        displayProfile(profile);

        // Hide form and show profile
        document.getElementById("editForm").style.display = "none";
        document.getElementById("profileDisplay").style.display = "block";
    });

    // Cancel editing
    document.getElementById("cancelProfileButton").addEventListener("click", function () {

        document.getElementById("editForm").style.display = "none";
        document.getElementById("profileDisplay").style.display = "block";
    });

    // Camera button
    document.addEventListener("deviceready", function () {

        const cameraButton =
            document.getElementById("changeProfilePictureButton");

        if (cameraButton) {

            cameraButton.addEventListener("click", function () {

                navigator.camera.getPicture(
                    function (imageData) {

                 // Display the captured image
                   let imageSource = imageData;

                    if (!imageData.startsWith("data:")) {
                    imageSource = "data:image/jpeg;base64," + imageData;
                    }

                    document.getElementById("profilePicture").src = imageSource;

                    // Save the captured image to localStorage
                        localStorage.setItem("profilePicture", imageSource);

                        alert("Profile picture updated successfully.");
                    },

                    function (error) {

                        // Keep the existing profile picture
                        if (
                            error === "No Image Selected" ||
                            error === "Selection cancelled."
                        ) {
                            alert(
                                "Camera was cancelled. Your current profile picture was kept."
                            );
                        } else {
                            alert(
                                "Unable to access the camera. Your current profile picture was kept."
                            );
                        }
                    },

                    {
                        quality: 70,
                        destinationType: Camera.DestinationType.DATA_URL,
                        sourceType: Camera.PictureSourceType.CAMERA,
                        encodingType: Camera.EncodingType.JPEG,
                        targetWidth: 500,
                        targetHeight: 500,
                        correctOrientation: true,
                        saveToPhotoAlbum: false
                    }
                );
            });
        }

    }, false);

});