document.addEventListener('DOMContentLoaded', function() {
  const alumniForm = document.getElementById('alumniForm');
  const avatarInput = document.getElementById('avatarInput');
  const avatarPreview = document.getElementById('avatarPreview');
  const pageTitle = document.getElementById('page-title');
  const headerTitle = document.getElementById('header-title');
  const formHeading = document.getElementById('form-heading');
  const submitBtn = document.getElementById('submitBtn');
  const passwordInput = document.getElementById('password');
  const passwordNote = document.getElementById('password-note');
  const alumniIdInput = document.getElementById('alumniId');
  const urlParams = new URLSearchParams(window.location.search);
  const isEditing = urlParams.get('edit') === 'true';
  const alumniId = urlParams.get('id');

  let currentStep = 1;
  const totalSteps = 4;
  
  function displayMessage(message, type) {
      const messageContainer = document.getElementById("message-container");
      if (!messageContainer) return;
      
      messageContainer.innerHTML = '';
      const messageElement = document.createElement("div");
      messageElement.classList.add("message", type);
      messageElement.textContent = message;
      messageContainer.appendChild(messageElement);
      
      setTimeout(() => {
          messageElement.remove();
      }, 4000);
  }
  
  function showStep(step) {
      document.querySelectorAll('fieldset').forEach(fieldset => {
          fieldset.style.display = 'none';
      });
      document.getElementById(`step-${step}`).style.display = 'block';
      currentStep = step;
  }
  
  window.nextStep = function() {
      const currentFieldset = document.getElementById(`step-${currentStep}`);
      const inputs = currentFieldset.querySelectorAll('input[required]');
      let allFilled = true;
      
      // Handle password field validation in edit mode
      if (isEditing && currentStep === 1) {
          passwordInput.required = false;
      }

      inputs.forEach(input => {
          if (!input.value) {
              allFilled = false;
              input.style.borderColor = 'red';
          } else {
              input.style.borderColor = '';
          }
      });

      if (allFilled) {
          if (currentStep < totalSteps) {
              showStep(currentStep + 1);
          }
      } else {
          displayMessage("Please fill in all required fields.", "error");
      }
  };
  
  window.prevStep = function() {
      if (currentStep > 1) {
          showStep(currentStep - 1);
      }
  };

  showStep(currentStep);

  avatarInput.addEventListener('change', function() {
      const file = this.files[0];
      if (file) {
          const reader = new FileReader();
          reader.onload = function(e) {
              avatarPreview.src = e.target.result;
              avatarPreview.style.display = 'block';
          }
          reader.readAsDataURL(file);
      } else {
          avatarPreview.src = "";
          avatarPreview.style.display = 'none';
      }
  });

  async function loadAlumniDataForEdit() {
      if (!alumniId) return;

      pageTitle.textContent = "Edit Alumni Profile";
      headerTitle.textContent = "🎓 Edit Alumni Profile";
      formHeading.textContent = "Edit Alumni Profile";
      submitBtn.textContent = "Update Profile";
      
      passwordInput.removeAttribute('required');
      passwordNote.style.display = 'inline-block';
      alumniIdInput.value = alumniId;

      try {
          const token = localStorage.getItem('token');
          const response = await fetch('/api/alumni', {
              headers: { 'Authorization': `Bearer ${token}` }
          });
          const alumniData = await response.json();
          const alumnusToEdit = alumniData.find(a => a.id == alumniId);

          if (alumnusToEdit) {
              document.getElementById('fullName').value = alumnusToEdit.name || '';
              document.getElementById('email').value = alumnusToEdit.email || '';
              document.getElementById('contact').value = alumnusToEdit.contact || '';
              document.getElementById('city').value = alumnusToEdit.city || '';
              document.getElementById('batch').value = alumnusToEdit.batch || '';
              document.getElementById('university').value = alumnusToEdit.university || '';
              document.getElementById('course').value = alumnusToEdit.course || '';
              document.getElementById('jobTitle').value = alumnusToEdit.jobTitle || '';
              document.getElementById('company').value = alumnusToEdit.company || '';
              document.getElementById('industry').value = alumnusToEdit.industry || '';
              document.getElementById('yoe').value = alumnusToEdit.yoe || '';
              document.getElementById('linkedin').value = alumnusToEdit.linkedin || '';
              document.getElementById('notes').value = alumnusToEdit.notes || '';
              document.getElementById('mentorship').checked = alumnusToEdit.mentorship;
              document.getElementById('specialization').value = alumnusToEdit.specialization || '';
              document.getElementById('github').value = alumnusToEdit.github || '';
              document.getElementById('website').value = alumnusToEdit.website || '';
              
              if (alumnusToEdit.avatar) {
                  avatarPreview.src = alumnusToEdit.avatar;
                  avatarPreview.style.display = 'block';
              }
          } else {
              displayMessage("Alumni profile not found.", "error");
          }
      } catch (error) {
          console.error("Error fetching alumni data for edit:", error);
          displayMessage("Could not load profile data.", "error");
      }
  }

  if (isEditing) {
      loadAlumniDataForEdit();
  }
  
  alumniForm.addEventListener('submit', async function(event) {
      event.preventDefault();

      const formData = new FormData(this);
      const method = isEditing ? 'PUT' : 'POST';
      const url = isEditing ? `/api/alumni/${alumniId}` : '/api/alumni';
      const token = localStorage.getItem("token");

      if (isEditing && !formData.get('password')) {
          formData.delete('password');
      }

      try {
          const response = await fetch(url, {
              method: method,
              headers: {
                  ...(isEditing && { 'Authorization': `Bearer ${token}` })
              },
              body: formData
          });

          const data = await response.json();
          
          if (response.ok) {
              displayMessage(data.message, "success");
              setTimeout(() => {
                  if (isEditing) {
                      window.location.href = "alumni_directory.html";
                  } else {
                      window.location.href = "login.html";
                  }
              }, 2000); 
          } else {
              displayMessage(data.error, "error");
          }
      } catch (error) {
          console.error('Error during form submission:', error);
          displayMessage("An unexpected error occurred. Please try again.", "error");
      }
  });
});