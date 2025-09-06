// Get form elements
const form = document.getElementById("alumniForm");
const registerButton = form.querySelector(".btn-primary");
const mentorshipCheckbox = document.getElementById("mentorship");

let currentStep = 1;

// Function to validate the current step before moving to the next
function validateStep(step) {
  const currentFieldset = document.getElementById(`step-${step}`);
  const inputs = currentFieldset.querySelectorAll("input[required]");
  
  for (const input of inputs) {
    if (!input.checkValidity()) {
      input.reportValidity();
      return false;
    }
  }
  return true;
}

// Function to move to the next step
function nextStep(step) {
  if (validateStep(step)) {
    document.getElementById(`step-${step}`).style.display = 'none';
    currentStep = step + 1;
    document.getElementById(`step-${currentStep}`).style.display = 'block';
  }
}

// Function to move to the previous step
function prevStep(step) {
  document.getElementById(`step-${step}`).style.display = 'none';
  currentStep = step - 1;
  document.getElementById(`step-${currentStep}`).style.display = 'block';
}

// Form submission logic
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  registerButton.disabled = true;
  registerButton.textContent = "Registering...";

  const formData = new FormData(form);
  
  // Explicitly set the 'mentorship' value based on the checkbox state
  // This ensures a consistent "true" or "false" string is sent to the backend
  formData.set("mentorship", mentorshipCheckbox.checked ? "true" : "false");

  try {
    const res = await fetch("/api/alumni", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || "Something went wrong on the server.");
    }

    const data = await res.json();
    alert(data.message || "Alumni registered successfully!");
    form.reset();
    // Reset to the first step after a successful submission
    document.getElementById(`step-${currentStep}`).style.display = 'none';
    document.getElementById('step-1').style.display = 'block';
    currentStep = 1;
  } catch (err) {
    console.error("Error:", err);
    alert("Error: " + err.message);
  } finally {
    registerButton.disabled = false;
    registerButton.textContent = "Register Alumni";
  }
});

// Photo preview logic
const avatarInput = document.getElementById("avatarInput");
const avatarPreview = document.getElementById("avatarPreview");

if (avatarInput && avatarPreview) {
  avatarInput.addEventListener("change", function () {
    const file = this.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        avatarPreview.src = e.target.result;
        avatarPreview.style.display = "block";
      };
      reader.readAsDataURL(file);
    } else {
      // If the file is deselected, hide the preview
      avatarPreview.src = "";
      avatarPreview.style.display = "none";
    }
  });
}