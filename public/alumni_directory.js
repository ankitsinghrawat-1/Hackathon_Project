document.addEventListener('DOMContentLoaded', () => {
  const alumniListContainer = document.getElementById('alumniList');
  const searchInput = document.getElementById('search');
  const loadingMessage = document.getElementById('loading-message');
  const noResultsMessage = document.getElementById('no-results-message');
  const alumniModal = document.getElementById('alumniModal');
  const modalBodyContent = document.getElementById('modal-body-content');
  const closeButton = document.querySelector('.close-button');

  let allAlumniData = [];

  async function fetchAlumni() {
      loadingMessage.style.display = 'block';
      noResultsMessage.style.display = 'none';
      alumniListContainer.style.display = 'none';

      try {
          const response = await fetch('/api/alumni');
          if (!response.ok) {
              throw new Error('Failed to fetch alumni data.');
          }
          allAlumniData = await response.json();
          displayAlumni(allAlumniData);
      } catch (error) {
          console.error('Error fetching data:', error);
          alumniListContainer.innerHTML = '<p class="info-message">Error loading directory. Please try again later.</p>';
          alumniListContainer.style.display = 'block';
      } finally {
          loadingMessage.style.display = 'none';
      }
  }

  function displayAlumni(alumniToDisplay) {
      alumniListContainer.innerHTML = '';
      if (alumniToDisplay.length === 0) {
          noResultsMessage.style.display = 'block';
          alumniListContainer.style.display = 'none';
          return;
      }

      noResultsMessage.style.display = 'none';
      alumniListContainer.style.display = 'grid';

      const fragment = document.createDocumentFragment();

      alumniToDisplay.forEach(alumnus => {
          const card = document.createElement('div');
          card.className = 'alumni-card';
          card.dataset.id = alumnus.id;

          card.innerHTML = `
              <img src="${alumnus.avatar || 'default-avatar.png'}" alt="${alumnus.name}'s profile photo" class="alumni-card__avatar">
              <h3>${alumnus.name}</h3>
              <p><strong>Batch:</strong> ${alumnus.batch}</p>
              <p><strong>Job:</strong> ${alumnus.jobTitle || 'Not specified'}</p>
              <p><strong>Course:</strong> ${alumnus.course || 'Not specified'}</p>
          `;
          fragment.appendChild(card);
      });
      alumniListContainer.appendChild(fragment);
  }

  alumniListContainer.addEventListener('click', (e) => {
      const card = e.target.closest('.alumni-card');
      if (card) {
          const alumniId = parseInt(card.dataset.id);
          const alumniDetails = allAlumniData.find(alumnus => alumnus.id === alumniId);
          if (alumniDetails) {
              showAlumniDetails(alumniDetails);
          }
      }
  });

  function showAlumniDetails(alumnus) {
      modalBodyContent.innerHTML = `
          <img src="${alumnus.avatar || 'default-avatar.png'}" alt="${alumnus.name}'s profile photo" class="profile-photo">
          <h3>${alumnus.name}</h3>
          <p><strong>Batch:</strong> ${alumnus.batch}</p>
          <p><strong>University:</strong> ${alumnus.university || 'Not specified'}</p>
          <p><strong>University Email:</strong> ${alumnus.email || 'Not specified'}</p>
          <p><strong>Course:</strong> ${alumnus.course || 'Not specified'}</p>
          <p><strong>Specialization:</strong> ${alumnus.specialization || 'Not specified'}</p>
          <p><strong>Current Job:</strong> ${alumnus.jobTitle || 'Not specified'} at ${alumnus.company || 'Not specified'}</p>
          <p><strong>Industry:</strong> ${alumnus.industry || 'Not specified'}</p>
          <p><strong>Years of Experience:</strong> ${alumnus.yoe || 'Not specified'}</p>
          <p><strong>Current City:</strong> ${alumnus.city || 'Not specified'}</p>
          <p><strong>Contact:</strong> ${alumnus.contact || 'Not specified'}</p>
          <p><strong>LinkedIn:</strong> ${alumnus.linkedin ? `<a href="${alumnus.linkedin}" target="_blank" rel="noopener noreferrer">View Profile</a>` : 'Not specified'}</p>
          <p><strong>GitHub:</strong> ${alumnus.github ? `<a href="${alumnus.github}" target="_blank" rel="noopener noreferrer">View Profile</a>` : 'Not specified'}</p>
          <p><strong>Personal Website:</strong> ${alumnus.website ? `<a href="${alumnus.website}" target="_blank" rel="noopener noreferrer">View Website</a>` : 'Not specified'}</p>
          <p><strong>Notes:</strong> ${alumnus.notes || 'Not specified'}</p>
          <p><strong>Willing to mentor:</strong> ${alumnus.mentorship === 1 ? 'Yes' : 'No'}</p>
      `;
      alumniModal.style.display = 'block';
  }

  closeButton.addEventListener('click', () => {
      alumniModal.style.display = 'none';
  });

  window.addEventListener('click', (e) => {
      if (e.target === alumniModal) {
          alumniModal.style.display = 'none';
      }
  });

  searchInput.addEventListener('input', (e) => {
      const searchTerm = e.target.value.toLowerCase();
      const filteredAlumni = allAlumniData.filter(alumnus => {
          return alumnus.name.toLowerCase().includes(searchTerm) || 
                 (alumnus.jobTitle && alumnus.jobTitle.toLowerCase().includes(searchTerm)) ||
                 (alumnus.industry && alumnus.industry.toLowerCase().includes(searchTerm));
      });
      displayAlumni(filteredAlumni);
  });

  fetchAlumni();
});