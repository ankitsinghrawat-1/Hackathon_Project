const alumniForm = document.getElementById("alumniForm");
const alumniList = document.getElementById("alumniList");

async function fetchAlumni() {
  const res = await fetch("http://localhost:5000/alumni");
  const data = await res.json();
  alumniList.innerHTML = "";
  data.forEach(a => {
    const li = document.createElement("li");
    li.textContent = `${a.name} | Batch ${a.batch} | ${a.job} | ${a.contact}`;
    alumniList.appendChild(li);
  });
}

alumniForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const name = document.getElementById("name").value;
  const batch = document.getElementById("batch").value;
  const contact = document.getElementById("contact").value;
  const job = document.getElementById("job").value;

  await fetch("http://localhost:5000/add-alumni", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, batch, contact, job })
  });

  alumniForm.reset();
  fetchAlumni();
});

// Load alumni when page opens
fetchAlumni();
