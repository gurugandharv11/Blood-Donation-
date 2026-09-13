/**
 * donors.js - Donors page logic
 * Provides donor search filters, instant key-up filtering, and list pagination.
 */

let currentSearchPage = 0;
const searchPageSize = 9; // Grid of 3x3

document.addEventListener('DOMContentLoaded', () => {
  // If not logged in, they can still search, but show limited action or redirect to login.
  updateNavbarAuthState();
  populateBloodGroupSelect('filterBloodGroup');
  
  // Set up event listeners for instant searching
  const bgSelect = document.getElementById('filterBloodGroup');
  const cityInput = document.getElementById('filterCity');
  const availCheck = document.getElementById('filterAvailable');

  if (bgSelect) bgSelect.addEventListener('change', () => { currentSearchPage = 0; triggerSearch(); });
  if (cityInput) cityInput.addEventListener('keyup', debounce(() => { currentSearchPage = 0; triggerSearch(); }, 300));
  if (availCheck) availCheck.addEventListener('change', () => { currentSearchPage = 0; triggerSearch(); });

  // Initial load
  triggerSearch();
});

async function triggerSearch() {
  const bg = document.getElementById('filterBloodGroup')?.value || '';
  const city = document.getElementById('filterCity')?.value.trim() || '';
  const available = document.getElementById('filterAvailable')?.checked ? true : null;

  const container = document.getElementById('donorsGrid');
  if (!container) return;

  container.innerHTML = `
    <div class="col-12 text-center py-5">
      <div class="spinner-blood mx-auto"></div>
      <p class="text-muted mt-2">Searching available donors...</p>
    </div>
  `;

  try {
    const res = await donorApi.search({
      bloodGroup: bg,
      city: city,
      available: available,
      page: currentSearchPage,
      size: searchPageSize
    });

    const donors = res.data?.content || [];
    const totalPages = res.data?.totalPages || 0;

    renderDonorsGrid(donors);
    renderPagination(
      document.getElementById('donorsPagination'),
      currentSearchPage,
      totalPages,
      (newPage) => {
        currentSearchPage = newPage;
        triggerSearch();
      }
    );
  } catch (err) {
    showError('Search failed: ' + err.message);
    container.innerHTML = `
      <div class="col-12 text-center py-5 text-danger">
        <i class="bi bi-exclamation-triangle-fill display-4"></i>
        <p class="mt-2">An error occurred while loading donors.</p>
      </div>
    `;
  }
}

function renderDonorsGrid(donors) {
  const container = document.getElementById('donorsGrid');
  if (!container) return;

  if (!donors.length) {
    container.innerHTML = `
      <div class="col-12">
        <div class="empty-state">
          <i class="bi bi-people"></i>
          <h3>No Donors Found</h3>
          <p>Try modifying your search criteria or selecting a different city.</p>
        </div>
      </div>
    `;
    return;
  }

  container.innerHTML = donors.map(d => {
    const user = Auth.getUser();
    const actionBtn = user
      ? `<a href="requests.html?requestForDonor=${d.id}&donorName=${encodeURIComponent(d.name)}&bloodGroup=${encodeURIComponent(d.bloodGroup)}&city=${encodeURIComponent(d.city || '')}" class="btn btn-primary-custom w-100 mt-3 justify-content-center">
          <i class="bi bi-droplet-fill"></i> Request Blood
         </a>`
      : `<a href="login.html" class="btn btn-outline-custom text-red border-red w-100 mt-3 justify-content-center">
          Login to Request
         </a>`;

    return `
      <div class="col-12 col-md-6 col-lg-4 mb-4">
        <div class="donor-card">
          <div class="d-flex align-items-center gap-3">
            ${renderAvatar(d.name, d.profilePhoto, 56)}
            <div>
              <div class="donor-name">${escapeHtml(d.name)}</div>
              <div class="donor-meta">${escapeHtml(d.city || 'City not updated')}</div>
            </div>
            <div class="ms-auto">
              ${getBloodGroupBadge(d.bloodGroup)}
            </div>
          </div>
          
          <ul class="donor-info-list flex-grow-1">
            <li><i class="bi bi-phone"></i> ${user ? escapeHtml(d.phone || 'No phone') : 'Logged in users only'}</li>
            <li><i class="bi bi-gender-ambiguous"></i> ${escapeHtml(d.gender || '--')}, ${d.age || '--'} yrs</li>
            <li><i class="bi bi-activity"></i> Status: ${getAvailabilityBadge(d.available)}</li>
            <li><i class="bi bi-calendar-event"></i> Last Donation: ${formatDate(d.lastDonationDate)}</li>
          </ul>
          
          ${actionBtn}
        </div>
      </div>
    `;
  }).join('');
}
