const form = document.getElementById("alumniForm");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const formData = new FormData(form);

  try {
    const res = await fetch("/api/alumni", {
      method: "POST",
      body: formData
    });
    const data = await res.json();
    alert(data.message || "Alumni registered successfully!");
    form.reset();
  } catch (err) {
    console.error("Error:", err);
    alert("Error registering alumni.");
  }
});
// Photo preview before upload
const avatarInput = document.getElementById("avatarInput");
const avatarPreview = document.getElementById("avatarPreview");

if (avatarInput) {
  avatarInput.addEventListener("change", function () {
    const file = this.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        avatarPreview.src = e.target.result;
        avatarPreview.style.display = "block";
      };
      reader.readAsDataURL(file);
    } else {
      avatarPreview.src = "";
      avatarPreview.style.display = "none";
    }
  });
}
