// Fetch alumni data from backend and display as cards
async function fetchAlumni() {
  try {
    const res = await fetch("/api/alumni");
    const data = await res.json();

    const container = document.getElementById("alumniList");
    container.innerHTML = "";

    if (data.length === 0) {
      container.innerHTML = "<p>No alumni registered yet.</p>";
      return;
    }

    data.forEach(alumni => {
      const card = document.createElement("div");
      card.className = "alumni-card";

      card.innerHTML = `
        <div class="alumni-header">
          <img src="${alumni.avatar ? alumni.avatar : 'default-avatar.png'}" alt="Profile" class="avatar-small">
        </div>
        <h3>${alumni.name}</h3>
        <p class="job">${alumni.job || "Not specified"}</p>
        <p class="course">${alumni.course || "Course not available"}</p>
      `;

      container.appendChild(card);
    });
  } catch (err) {
    console.error("Error fetching alumni:", err);
  }
}

// Run when page loads
window.onload = fetchAlumni;
