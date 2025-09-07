document.addEventListener("DOMContentLoaded", async () => {
    const alumniList = document.getElementById("alumniList");
    const searchInput = document.getElementById("search");
    const loadingMessage = document.getElementById("loading-message");
    const noResultsMessage = document.getElementById("no-results-message");
    const pfpImage = document.getElementById("pfpImage");

    let allAlumniData = [];

    function getUserIdFromToken() {
        const token = localStorage.getItem('token');
        if (!token) return null;
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return parseInt(payload.alumniId, 10);
        } catch (e) {
            console.error("Failed to decode token:", e);
            return null;
        }
    }

    const currentAlumniId = getUserIdFromToken();
    const profileDropdown = document.getElementById("profileDropdown");

    if (currentAlumniId) {
        profileDropdown.style.display = 'inline-block';
    }

    async function fetchAlumni() {
        loadingMessage.style.display = 'block';
        alumniList.innerHTML = '';
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                window.location.href = "login.html";
                return;
            }
            const response = await fetch("/api/alumni", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (!response.ok) {
                throw new Error("Failed to fetch data.");
            }
            allAlumniData = await response.json();
            
            const currentUser = allAlumniData.find(a => a.id === currentAlumniId);
            if (currentUser && currentUser.avatar) {
                pfpImage.src = currentUser.avatar;
            } else {
                pfpImage.src = 'https://via.placeholder.com/40';
            }

            displayAlumni(allAlumniData);
        } catch (error) {
            console.error("Error fetching alumni data:", error);
            if (error.message.includes("401") || error.message.includes("403")) {
                alert("Session expired. Please log in again.");
                window.location.href = "login.html";
            }
        } finally {
            loadingMessage.style.display = 'none';
        }
    }

    function createAlumniCard(alumnus) {
        const card = document.createElement("div");
        card.className = "alumni-card";
        card.innerHTML = `
            <img src="${alumnus.avatar || 'https://via.placeholder.com/110'}" alt="${alumnus.name}'s photo" class="alumni-card__avatar">
            <h3>${alumnus.name}</h3>
            <p>${alumnus.jobTitle || 'Job Title'}</p>
            <p>${alumnus.company || 'Company'}</p>
            <p>Batch of ${alumnus.batch}</p>
        `;
        card.addEventListener("click", () => showAlumniDetails(alumnus));
        return card;
    }

    function displayAlumni(alumni) {
        alumniList.innerHTML = '';
        if (alumni.length === 0) {
            noResultsMessage.style.display = 'block';
        } else {
            noResultsMessage.style.display = 'none';
            alumni.forEach(alumnus => {
                alumniList.appendChild(createAlumniCard(alumnus));
            });
        }
    }

    function showAlumniDetails(alumnus) {
        const modal = document.getElementById("alumniModal");
        const modalContent = document.getElementById("modal-body-content");

        modalContent.innerHTML = `
            <img src="${alumnus.avatar || 'https://via.placeholder.com/150'}" alt="${alumnus.name}'s photo" class="profile-photo">
            <h3>${alumnus.name}</h3>
            <p><strong>Batch:</strong> ${alumnus.batch}</p>
            <p><strong>University:</strong> ${alumnus.university}</p>
            <p><strong>Course:</strong> ${alumnus.course}</p>
            ${alumnus.jobTitle && alumnus.company ? `<p><strong>Job:</strong> ${alumnus.jobTitle} at ${alumnus.company}</p>` : ''}
            ${alumnus.industry ? `<p><strong>Industry:</strong> ${alumnus.industry}</p>` : ''}
            ${alumnus.yoe ? `<p><strong>Years of Experience:</strong> ${alumnus.yoe}</p>` : ''}
            ${alumnus.city ? `<p><strong>City:</strong> ${alumnus.city}</p>` : ''}
            ${alumnus.contact ? `<p><strong>Contact:</strong> ${alumnus.contact}</p>` : ''}
            ${alumnus.email ? `<p><strong>Email:</strong> <a href="mailto:${alumnus.email}">${alumnus.email}</a></p>` : ''}
            ${alumnus.linkedin ? `<p><strong>LinkedIn:</strong> <a href="${alumnus.linkedin}" target="_blank">${alumnus.linkedin}</a></p>` : ''}
            ${alumnus.notes ? `<p><strong>Notes:</strong> ${alumnus.notes}</p>` : ''}
            ${alumnus.mentorship ? `<p><strong>Willing to Mentor:</strong> Yes</p>` : ''}
        `;
        
        modal.style.display = "block";
    }

    const modal = document.getElementById("alumniModal");
    const closeBtn = document.querySelector(".close-button");
    closeBtn.onclick = () => {
        modal.style.display = "none";
    };

    const viewProfileBtn = document.getElementById("viewProfileBtn");
    const editProfileBtn = document.getElementById("editProfileBtn");
    const changePasswordBtn = document.getElementById("changePasswordBtn");
    const deleteProfileBtn = document.getElementById("deleteProfileBtn");
    const logoutBtn = document.getElementById("logoutBtn");
    const dropdownToggle = document.querySelector("#profileDropdown .dropdown-toggle");
    const dropdownContent = document.querySelector("#profileDropdown .dropdown-content");

    if (dropdownToggle) {
        dropdownToggle.onclick = (e) => {
            e.stopPropagation();
            dropdownContent.style.display = dropdownContent.style.display === 'block' ? 'none' : 'block';
        };
    }

    if (viewProfileBtn) {
        viewProfileBtn.onclick = () => {
            const currentUser = allAlumniData.find(a => a.id === currentAlumniId);
            if (currentUser) {
                showAlumniDetails(currentUser);
                dropdownContent.style.display = 'none';
            }
        };
    }

    if (editProfileBtn) {
        editProfileBtn.onclick = () => {
            window.location.href = `register.html?edit=true&id=${currentAlumniId}`;
        };
    }

    if (changePasswordBtn) {
        changePasswordBtn.onclick = () => {
             window.location.href = `change_password.html?id=${currentAlumniId}`;
        };
    }

    if (deleteProfileBtn) {
        deleteProfileBtn.onclick = () => {
            if (confirm("Are you sure you want to delete your profile? This action cannot be undone.")) {
                deleteProfile(currentAlumniId);
            }
        };
    }

    if (logoutBtn) {
      logoutBtn.onclick = () => {
        logout();
      }
    }

    window.onclick = (event) => {
        if (!event.target.matches('.dropdown-toggle')) {
            const dropdowns = document.getElementsByClassName("dropdown-content");
            for (let i = 0; i < dropdowns.length; i++) {
                let openDropdown = dropdowns[i];
                if (openDropdown.style.display === 'block') {
                    openDropdown.style.display = 'none';
                }
            }
        }
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    };


    async function deleteProfile(alumniId) {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`/api/alumni/${alumniId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                localStorage.removeItem("token");
                alert("Profile deleted successfully. You will be redirected to the home page.");
                window.location.href = "index.html";
            } else {
                const errorData = await response.json();
                alert(`Error: ${errorData.error}`);
            }
        } catch (error) {
            console.error("Error deleting profile:", error);
            alert("An error occurred while deleting the profile. Please try again.");
        }
    }

    fetchAlumni();

    searchInput.addEventListener("input", (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const filteredAlumni = allAlumniData.filter(alumnus =>
            alumnus.name.toLowerCase().includes(searchTerm) ||
            (alumnus.jobTitle && alumnus.jobTitle.toLowerCase().includes(searchTerm)) ||
            (alumnus.company && alumnus.company.toLowerCase().includes(searchTerm)) ||
            (alumnus.industry && alumnus.industry.toLowerCase().includes(searchTerm))
        );
        displayAlumni(filteredAlumni);
    });
});

// Handle Home button click based on login status
const homeButton = document.getElementById("homeBtn");
if (homeButton) {
    homeButton.onclick = () => {
        const token = localStorage.getItem("token");
        if (token) {
            window.location.href = "alumni_directory.html";
        } else {
            window.location.href = "index.html";
        }
    };
}

function logout() {
    localStorage.removeItem("token");
    window.location.href = "login.html";
}