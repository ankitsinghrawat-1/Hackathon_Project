const alumniForm = document.getElementById("alumniForm");
const alumniList = document.getElementById("alumniList");
const searchInput = document.getElementById("search");

// Store alumni in memory for demo purposes
let alumniData = [];

// Render alumni cards
function renderAlumni(data) {
  alumniList.innerHTML = "";
  data.forEach(a => {
    const li = document.createElement("li");
    li.innerHTML = `
      <b>${a.name}</b>
      <div>
        <span class="badge">Batch: ${a.batch}</span>
        <span class="badge">Course: ${a.course || "N/A"}</span>
        <span class="badge">University: ${a.university || "N/A"}</span>
        <span class="badge">Job: ${a.job || "N/A"}</span>
      </div>
      <div>Contact: ${a.contact || "N/A"}</div>
      <div>Email: ${a.email || "N/A"}</div>
    `;
    alumniList.appendChild(li);
  });
}

// Add alumni
alumniForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = document.getElementById("name").value.trim();
  const batch = document.getElementById("batch").value.trim();
  const contact = document.getElementById("contact").value.trim();
  const job = document.getElementById("job").value.trim();
  const university = document.getElementById("university").value.trim();
  const email = document.getElementById("email").value.trim();
  const course = document.getElementById("course").value.trim();

  if (!name || !batch) return alert("Please fill Name and Batch!");

  alumniData.push({ name, batch, contact, job, university, email, course });
  renderAlumni(alumniData);
  alumniForm.reset();
});

// Search / Filter alumni
searchInput.addEventListener("input", () => {
  const filter = searchInput.value.toLowerCase();
  const filtered = alumniData.filter(a =>
    a.name.toLowerCase().includes(filter) ||
    a.batch.toLowerCase().includes(filter) ||
    (a.job && a.job.toLowerCase().includes(filter)) ||
    (a.university && a.university.toLowerCase().includes(filter)) ||
    (a.course && a.course.toLowerCase().includes(filter))
  );
  renderAlumni(filtered);
});
