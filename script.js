const alumniForm = document.getElementById("alumniForm");
const alumniList = document.getElementById("alumniList");
const searchInput = document.getElementById("search");
const avatarInput = document.getElementById("avatar");

const API_URL = "http://localhost:5000";

// Create live preview for uploaded photo
const previewImg = document.createElement("img");
previewImg.id = "avatarPreview";
previewImg.src = "https://i.pravatar.cc/70"; // default
document.querySelector(".form-section").insertBefore(previewImg, avatarInput);

avatarInput.addEventListener("change", () => {
  const file = avatarInput.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = e => previewImg.src = e.target.result;
    reader.readAsDataURL(file);
  } else {
    previewImg.src = "https://i.pravatar.cc/70";
  }
});

// Store alumni locally for search/filter
let alumniData = [];

// Fetch and render alumni
async function fetchAlumni() {
  try {
    const res = await fetch(`${API_URL}/alumni`);
    alumniData = await res.json();
    renderAlumni(alumniData);
  } catch (err) {
    console.error("Error fetching alumni:", err);
  }
}

// Render alumni cards
function renderAlumni(data) {
  alumniList.innerHTML = "";
  data.forEach(a => {
    const li = document.createElement("li");

    const avatarURL = a.avatar ? API_URL + a.avatar : "https://i.pravatar.cc/70";

    li.innerHTML = `
      <img src="${avatarURL}" class="avatar" alt="Profile Picture">
      <b>${a.name}</b>
      <div>
        <span class="badge">Batch: ${a.batch}</span>
        <span class="badge">Course: ${a.course || "N/A"}</span>
        <span class="badge">University: ${a.university || "N/A"}</span>
        <span class="badge">Job: ${a.job || "N/A"}</span>
      </div>
      <div>Email: ${a.email || "N/A"}</div>
      <div>Contact: ${a.contact || "N/A"}</div>
      ${a.notes ? `<div><b>Notes:</b> ${a.notes}</div>` : ""}
      <div class="social">
        ${a.linkedin ? `<a href="${a.linkedin}" target="_blank"><i class="fab fa-linkedin"></i></a>` : ""}
      </div>
    `;
    alumniList.appendChild(li);
  });
}

// Submit form with photo upload
alumniForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = new FormData();
  formData.append("name", document.getElementById("name").value.trim());
  formData.append("batch", document.getElementById("batch").value.trim());
  formData.append("contact", document.getElementById("contact").value.trim());
  formData.append("job", document.getElementById("job").value.trim());
  formData.append("university", document.getElementById("university").value.trim());
  formData.append("email", document.getElementById("email").value.trim());
  formData.append("course", document.getElementById("course").value.trim());
  formData.append("linkedin", document.getElementById("linkedin").value.trim());
  formData.append("notes", document.getElementById("notes").value.trim());

  const avatarFile = avatarInput.files[0];
  if (avatarFile) formData.append("avatar", avatarFile);

  try {
    const res = await fetch(`${API_URL}/add-alumni`, {
      method: "POST",
      body: formData
    });

    if (res.ok) {
      fetchAlumni();
      alumniForm.reset();
      previewImg.src = "https://i.pravatar.cc/70"; // reset preview
    } else {
      alert("Failed to add alumni.");
    }
  } catch (err) {
    console.error("Error adding alumni:", err);
  }
});

// Search / filter alumni
searchInput.addEventListener("input", () => {
  const filter = searchInput.value.toLowerCase();
  const filtered = alumniData.filter(a =>
    a.name.toLowerCase().includes(filter) ||
    a.batch.toLowerCase().includes(filter) ||
    (a.job && a.job.toLowerCase().includes(filter)) ||
    (a.university && a.university.toLowerCase().includes(filter)) ||
    (a.course && a.course.toLowerCase().includes(filter)) ||
    (a.notes && a.notes.toLowerCase().includes(filter))
  );
  renderAlumni(filtered);
});

// Initial fetch
fetchAlumni();
