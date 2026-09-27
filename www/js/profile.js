document.addEventListener("DOMContentLoaded", function () {

    // Backend API address
    // 10.0.2.2 allows the Android emulator to access the computer's localhost.
    const API_BASE_URL = "http://10.0.0.37:3000";

    // Store the currently loaded profile
    let profile = null;



    // LOGIN


    const loginButton = document.getElementById("loginButton");

    if (loginButton) {

        loginButton.addEventListener("click", async function () {

            const studentId =
                document.getElementById("loginStudentId").value.trim();

            const password =
                document.getElementById("loginPassword").value;

            const loginMessage =
                document.getElementById("loginMessage");


            // Validate login fields
            if (studentId === "") {
                loginMessage.textContent =
                    "Please enter your Student ID.";
                return;
            }

            if (password === "") {
                loginMessage.textContent =
                    "Please enter your password.";
                return;
            }


            loginMessage.textContent = "Logging in...";


            try {

                const response = await fetch(
                    API_BASE_URL + "/api/login",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type": "application/json"
                        },

                        body: JSON.stringify({
                            studentId: studentId,
                            password: password
                        })
                    }
                );


                const data = await response.json();


                if (!response.ok || !data.success) {

                    loginMessage.textContent =
                        data.message ||
                        "Login failed. Please check your credentials.";

                    return;
                }


                // Save authentication information
                sessionStorage.setItem(
                    "authToken",
                    data.token
                );

                sessionStorage.setItem(
                    "studentId",
                    data.studentId
                );


                loginMessage.textContent =
                    "Login successful. Loading profile...";


                // Retrieve profile from database
                await loadProfile();


            } catch (error) {

                console.error("Login error:", error);

                loginMessage.textContent =
                    "Unable to connect to the server. Please try again.";
            }

        });

    }



    // LOAD PROFILE FROM DATABASE


    async function loadProfile() {

        const token =
            sessionStorage.getItem("authToken");


        if (!token) {
            return;
        }


        try {

            const response = await fetch(
                API_BASE_URL + "/api/profile",
                {
                    method: "GET",

                    headers: {
                        "Authorization": "Bearer " + token
                    }
                }
            );


            const data = await response.json();


            if (!response.ok || !data.success) {

                alert(
                    data.message ||
                    "Unable to load your profile."
                );

                sessionStorage.removeItem("authToken");
                sessionStorage.removeItem("studentId");

                return;
            }


            // Convert database field names
            // into the names used by the existing frontend.
            profile = {
                fullName: data.profile.name,
                course: data.profile.course,
                yearLevel: data.profile.year_level,
                aboutMe: data.profile.about_me,
                skills: data.profile.skills,
                profilePicture: data.profile.profile_picture
            };


            // Display database profile
            displayProfile(profile);


            // Display saved profile picture from database
            if (profile.profilePicture) {

                document.getElementById(
                    "profilePicture"
                ).src = profile.profilePicture;

            } else {

                loadDefaultOrSavedPicture();

            }


            // Hide login section
            document.getElementById(
                "loginSection"
            ).style.display = "none";


            // Show protected profile
            document.getElementById(
                "profileContent"
            ).style.display = "block";

            // Show protected main content
            document.getElementById(
                "protectedMain"
            ).style.display = "block";
           
           // Show protected footer
           document.getElementById(
               "profileFooter"
           ).style.display = "block";


        } catch (error) {

            console.error(
                "Profile loading error:",
                error
            );

            alert(
                "Unable to connect to the server."
            );
        }

    }



    // DISPLAY PROFILE


    function displayProfile(data) {

        document.getElementById(
            "profileName"
        ).textContent = data.fullName;

        document.getElementById(
            "profileCourse"
        ).textContent = data.course;

        document.getElementById(
            "profileYear"
        ).textContent = data.yearLevel;

        document.getElementById(
            "profileAbout"
        ).textContent = data.aboutMe;

        document.getElementById(
            "profileSkills"
        ).textContent = data.skills;

    }



    // PROFILE PICTURE


    function loadDefaultOrSavedPicture() {

        const savedPicture =
            localStorage.getItem("profilePicture");


        if (savedPicture) {

            document.getElementById(
                "profilePicture"
            ).src = savedPicture;

        }

    }



    // LOGOUT

    const logoutButton = document.getElementById("logoutButton");

    if (logoutButton) {
        logoutButton.addEventListener("click", function () {
            sessionStorage.removeItem("authToken");
            sessionStorage.removeItem("studentId");
            document.getElementById("profileContent").style.display = "none";
            document.getElementById("protectedMain").style.display = "none";
            document.getElementById("profileFooter").style.display = "none";
            document.getElementById("loginSection").style.display = "block";
            document.getElementById("loginStudentId").value = "";
            document.getElementById("loginPassword").value = "";
            document.getElementById("loginMessage").textContent = "";
            alert("You have been logged out successfully.");
        });
    }

    // EDIT PROFILE


    const editButton =
        document.getElementById("editProfileButton");


    if (editButton) {

        editButton.addEventListener(
            "click",
            function () {

                if (!profile) {
                    return;
                }


                document.getElementById(
                    "editForm"
                ).style.display = "block";


                document.getElementById(
                    "profileDisplay"
                ).style.display = "none";


                document.getElementById(
                    "fullName"
                ).value = profile.fullName;


                document.getElementById(
                    "course"
                ).value = profile.course;


                document.getElementById(
                    "yearLevel"
                ).value = profile.yearLevel;


                document.getElementById(
                    "aboutMe"
                ).value = profile.aboutMe;


                document.getElementById(
                    "skills"
                ).value = profile.skills;

            }
        );

    }



    // SAVE PROFILE TO DATABASE


    const saveButton =
        document.getElementById("saveProfileButton");


    if (saveButton) {

        saveButton.addEventListener(
            "click",
            async function () {

                const fullName =
                    document.getElementById(
                        "fullName"
                    ).value.trim();


                const course =
                    document.getElementById(
                        "course"
                    ).value.trim();


                const yearLevel =
                    document.getElementById(
                        "yearLevel"
                    ).value.trim();


                const aboutMe =
                    document.getElementById(
                        "aboutMe"
                    ).value.trim();


                const skills =
                    document.getElementById(
                        "skills"
                    ).value.trim();


                // Validate required fields
                if (fullName === "") {
                    alert(
                        "Please enter your full name."
                    );
                    return;
                }


                if (course === "") {
                    alert(
                        "Please enter your course."
                    );
                    return;
                }


                if (yearLevel === "") {
                    alert(
                        "Please enter your year level."
                    );
                    return;
                }


                if (aboutMe === "") {
                    alert(
                        "Please enter information about yourself."
                    );
                    return;
                }


                if (skills === "") {
                    alert(
                        "Please enter your skills."
                    );
                    return;
                }


                const token =
                    sessionStorage.getItem("authToken");


                if (!token) {

                    alert(
                        "You must be logged in to update your profile."
                    );

                    return;
                }


                const updatedProfile = {

                    name: fullName,

                    course: course,

                    yearLevel: yearLevel,

                    aboutMe: aboutMe,

                    skills: skills,

                    profilePicture:
                        profile.profilePicture || ""

                };


                try {

                    const response = await fetch(
                        API_BASE_URL + "/api/profile",
                        {
                            method: "PUT",

                            headers: {

                                "Content-Type":
                                    "application/json",

                                "Authorization":
                                    "Bearer " + token
                            },

                            body: JSON.stringify(
                                updatedProfile
                            )
                        }
                    );


                    const data =
                        await response.json();


                    if (!response.ok ||
                        !data.success) {

                        alert(
                            data.message ||
                            "Unable to update your profile."
                        );

                        return;
                    }


                    // Update local JavaScript profile
                    profile = {

                        fullName:
                            fullName,

                        course:
                            course,

                        yearLevel:
                            yearLevel,

                        aboutMe:
                            aboutMe,

                        skills:
                            skills,

                        profilePicture:
                            profile.profilePicture || ""
                    };


                    displayProfile(profile);


                    document.getElementById(
                        "editForm"
                    ).style.display = "none";


                    document.getElementById(
                        "profileDisplay"
                    ).style.display = "block";


                    alert(
                        "Profile updated successfully."
                    );


                } catch (error) {

                    console.error(
                        "Profile update error:",
                        error
                    );

                    alert(
                        "Unable to connect to the server."
                    );

                }

            }
        );

    }



    // CANCEL EDITING


    const cancelButton =
        document.getElementById(
            "cancelProfileButton"
        );


    if (cancelButton) {

        cancelButton.addEventListener(
            "click",
            function () {

                document.getElementById(
                    "editForm"
                ).style.display = "none";


                document.getElementById(
                    "profileDisplay"
                ).style.display = "block";

            }
        );

    }



    // CAMERA - ACTIVITY 6


    document.addEventListener(
        "deviceready",
        function () {

            const cameraButton =
                document.getElementById(
                    "changeProfilePictureButton"
                );


            if (cameraButton) {

                cameraButton.addEventListener(
                    "click",
                    function () {

                        navigator.camera.getPicture(

                            function (imageData) {

                                // Display the captured image
                                let imageSource =
                                    imageData;


                                if (
                                    !imageData.startsWith("data:")
                                ) {

                                    imageSource =
                                        "data:image/jpeg;base64," +
                                        imageData;

                                }


                                document.getElementById(
                                    "profilePicture"
                                ).src = imageSource;


                                // Save locally for Activity 6 compatibility
                                localStorage.setItem(
                                    "profilePicture",
                                    imageSource
                                );


                                // Update current profile
                                if (profile) {

                                    profile.profilePicture =
                                        imageSource;

                                }


// Save the new picture to database
updateProfilePicture(imageSource)
    .then(function () {
        alert(
            "Profile picture updated successfully."
        );
    })
    .catch(function (error) {
        console.error(
            "Profile picture update error:",
            error
        );

        alert(
            "The picture was changed, but it could not be saved to the database."
        );
    });

                            },


                            function (error) {

                                // Keep the existing profile picture
                                if (
                                    error ===
                                        "No Image Selected" ||
                                    error ===
                                        "Selection cancelled."
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

                                destinationType:
                                    Camera.DestinationType.DATA_URL,

                                sourceType:
                                    Camera.PictureSourceType.CAMERA,

                                encodingType:
                                    Camera.EncodingType.JPEG,

                                targetWidth: 500,

                                targetHeight: 500,

                                correctOrientation: true,

                                saveToPhotoAlbum: false
                            }
                        );

                    }
                );

            }

        },
        false
    );



    // UPDATE PROFILE PICTURE IN DATABASE


    async function updateProfilePicture(
        imageSource
    ) {

        const token =
            sessionStorage.getItem("authToken");


        if (!token || !profile) {
            return;
        }


        try {

            const response = await fetch(
                API_BASE_URL + "/api/profile",
                {
                    method: "PUT",

                    headers: {

                        "Content-Type":
                            "application/json",

                        "Authorization":
                            "Bearer " + token
                    },

                    body: JSON.stringify({

                        name:
                            profile.fullName,

                        course:
                            profile.course,

                        yearLevel:
                            profile.yearLevel,

                        aboutMe:
                            profile.aboutMe,

                        skills:
                            profile.skills,

                        profilePicture:
                            imageSource
                    })
                }
            );


            const data =
                await response.json();


            if (!response.ok ||
                !data.success) {

                console.error(
                    "Profile picture database update failed:",
                    data.message
                );

            }

        } catch (error) {

            console.error(
                "Profile picture update error:",
                error
            );

        }

    }



    // CHECK EXISTING LOGIN SESSION


    const existingToken =
        sessionStorage.getItem("authToken");


    if (existingToken) {

        loadProfile();

    }

});