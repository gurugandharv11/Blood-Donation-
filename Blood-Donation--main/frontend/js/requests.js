/**
 * requests.js - Blood requests management page logic
 * Handles Seekers creating/canceling requests, and Donors viewing/accepting/completing requests.
 */

let currentRequestsPage = 0;
const requestsPageSize = 10;

document.addEventListener('DOMContentLoaded', () => {
  if (!initProtectedPage()) return;
  
  populateBloodGroupSelect('reqBloodGroup');
  populateBloodGroupSelect('editReqBloodGroup');

  // Set active nav
  setActiveNav('requests');

  // Determine view based on role
  const user = Auth.getUser();
  if (Auth.isSeeker()) {
    document.getElementById('seekerActionsSection').style.display = 'block';
    // Check if requesting specific donor
    checkUrlParamsForRequest();
  } else if (Auth.isDonor()) {
    document.getElementById('donorActionsSection').style.display = 'block';
  }

  loadRequests();

  // Setup form submission
  const createForm = document.getElementById('createRequestForm');
  if (createForm) {
    createForm.addEventListener('submit', handleCreateRequest);
  }
});

// Check if redirected from donor search to create specific request
function checkUrlParamsForRequest() {
  const params = new URLSearchParams(window.location.search);
  const donorId = params.get('requestForDonor');
  if (donorId) {
    const donorName = params.get('donorName');
    const bloodGroup = params.get('bloodGroup');
    const city = params.get('city');

    // Show request modal instantly
    const myModal = new bootstrap.Modal(document.getElementById('createRequestModal'));
    myModal.show();

    // Populate default fields
    const bgSelect = document.getElementById('reqBloodGroup');
    const cityInput = document.getElementById('reqCity');
    const notesInput = document.getElementById('reqNotes');

    if (bgSelect) bgSelect.value = bloodGroup;
    if (cityInput) cityInput.value = city;
    if (notesInput) notesInput.value = `Requesting blood donation directly from donor ${donorName}.`;
  }
}

async function loadRequests() {
  showSpinner('Loading blood requests...');
  try {
    let res;
    if (Auth.isAdmin()) {
      res = await adminApi.getRequests(currentRequestsPage, requestsPageSize);
    } else if (Auth.isSeeker()) {
      res = await requestApi.getMy(currentRequestsPage, requestsPageSize);
    } else if (Auth.isDonor()) {
      // Donors see pending requests they can accept OR requests they accepted
      res = await requestApi.getPending(currentRequestsPage, requestsPageSize);
    }

    const requests = res.data?.content || [];
    const totalPages = res.data?.totalPages || 0;

    renderRequestsTable(requests);
    renderPagination(
      document.getElementById('requestsPagination'),
      currentRequestsPage,
      totalPages,
      (newPage) => {
        currentRequestsPage = newPage;
        loadRequests();
      }
    );
  } catch (err) {
    showError('Failed to load requests: ' + err.message);
  } finally {
    hideSpinner();
  }
}

function renderRequestsTable(requests) {
  const tbody = document.getElementById('requestsTableBody');
  if (!tbody) return;

  if (!requests.length) {
    tbody.innerHTML = `<tr><td colspan="9" class="text-center py-5 text-muted">No blood requests found.</td></tr>`;
    return;
  }

  tbody.innerHTML = requests.map(r => {
    let actionButtons = '';
    const user = Auth.getUser();

    if (Auth.isSeeker()) {
      if (r.status === 'PENDING') {
        actionButtons = `
          <button class="btn btn-sm btn-outline-danger" onclick="cancelRequest(${r.id})">
            Cancel
          </button>
        `;
      } else {
        actionButtons = `<span class="text-muted">No actions</span>`;
      }
    } else if (Auth.isDonor()) {
      if (r.status === 'PENDING') {
        actionButtons = `
          <button class="btn btn-sm btn-success" onclick="acceptRequest(${r.id})">
            Accept
          </button>
        `;
      } else if (r.status === 'ACCEPTED' && r.donorId === user.donorId) {
        actionButtons = `
          <button class="btn btn-sm btn-warning" onclick="rejectRequest(${r.id})">
            Reject
          </button>
          <button class="btn btn-sm btn-primary-custom ms-1" onclick="completeRequest(${r.id})">
            Complete
          </button>
        `;
      } else {
        actionButtons = `<span class="text-muted">--</span>`;
      }
    } else if (Auth.isAdmin()) {
      actionButtons = `
        <button class="btn btn-sm btn-outline-danger" onclick="deleteRequest(${r.id})">
          Delete
        </button>
      `;
      if (r.status === 'PENDING') {
        actionButtons += `
          <button class="btn btn-sm btn-success ms-1" onclick="approveByAdmin(${r.id})">Approve</button>
          <button class="btn btn-sm btn-warning ms-1" onclick="rejectByAdmin(${r.id})">Reject</button>
        `;
      }
    }

    return `
      <tr>
        <td><strong>${escapeHtml(r.patientName)}</strong></td>
        <td>${getBloodGroupBadge(r.bloodGroup)}</td>
        <td>${r.unitsRequired} unit(s)</td>
        <td>${escapeHtml(r.hospitalName)}, ${escapeHtml(r.city)}</td>
        <td>${escapeHtml(r.contactNumber)}</td>
        <td>${getUrgencyBadge(r.urgency)}</td>
        <td>${getStatusBadge(r.status)}</td>
        <td>${formatDate(r.createdAt)}</td>
        <td><div class="d-flex gap-1">${actionButtons}</div></td>
      </tr>
    `;
  }).join('');
}

// ============ MUTATIONS ============
async function handleCreateRequest(e) {
  e.preventDefault();
  
  const dto = {
    patientName:     document.getElementById('reqPatientName').value.trim(),
    bloodGroup:      document.getElementById('reqBloodGroup').value,
    unitsRequired:   parseInt(document.getElementById('reqUnits').value),
    hospitalName:    document.getElementById('reqHospitalName').value.trim(),
    hospitalAddress: document.getElementById('reqHospitalAddress').value.trim(),
    city:            document.getElementById('reqCity').value.trim(),
    contactNumber:   document.getElementById('reqContact').value.trim(),
    urgency:         document.getElementById('reqUrgency').value,
    notes:           document.getElementById('reqNotes').value.trim()
  };

  // Basic Validation
  if (!dto.patientName || !dto.bloodGroup || isNaN(dto.unitsRequired) || !dto.hospitalName || !dto.city || !dto.contactNumber) {
    showError('Please fill in all required fields');
    return;
  }

  showSpinner('Creating request...');
  try {
    const res = await requestApi.create(dto);
    if (res.success) {
      showSuccess('Blood request created successfully!');
      
      // Close modal
      const modalEl = document.getElementById('createRequestModal');
      const modal = bootstrap.Modal.getInstance(modalEl);
      if (modal) modal.hide();
      
      document.getElementById('createRequestForm').reset();
      currentRequestsPage = 0;
      loadRequests();
    }
  } catch (err) {
    showError(err.message || 'Failed to create request');
  } finally {
    hideSpinner();
  }
}

async function cancelRequest(id) {
  const ok = await confirmAction('Are you sure you want to cancel this pending blood request?');
  if (!ok) return;

  showSpinner('Canceling request...');
  try {
    await requestApi.cancel(id);
    showSuccess('Blood request canceled');
    loadRequests();
  } catch (err) {
    showError(err.message);
  } finally {
    hideSpinner();
  }
}

async function acceptRequest(id) {
  showSpinner('Accepting request...');
  try {
    await requestApi.accept(id);
    showSuccess('Blood request accepted! Please get in touch with the seeker.');
    loadRequests();
  } catch (err) {
    showError(err.message);
  } finally {
    hideSpinner();
  }
}

async function rejectRequest(id) {
  const ok = await confirmAction('Are you sure you want to reject this request? It will go back to the public pool.');
  if (!ok) return;

  showSpinner('Rejecting request...');
  try {
    await requestApi.reject(id);
    showWarning('Request returned to pending');
    loadRequests();
  } catch (err) {
    showError(err.message);
  } finally {
    hideSpinner();
  }
}

async function completeRequest(id) {
  const ok = await confirmAction('Have you successfully donated blood for this patient? This will complete the request.');
  if (!ok) return;

  showSpinner('Completing request...');
  try {
    await requestApi.complete(id);
    showSuccess('Thank you for your life-saving donation! Request marked as completed.');
    loadRequests();
  } catch (err) {
    showError(err.message);
  } finally {
    hideSpinner();
  }
}

async function deleteRequest(id) {
  const ok = await confirmAction('Admin: Delete this request entirely?');
  if (!ok) return;

  showSpinner('Deleting request...');
  try {
    await requestApi.delete(id);
    showSuccess('Request deleted');
    loadRequests();
  } catch (err) {
    showError(err.message);
  } finally {
    hideSpinner();
  }
}

async function approveByAdmin(id) {
  try {
    await adminApi.approveRequest(id);
    showSuccess('Request approved and accepted');
    loadRequests();
  } catch (err) {
    showError(err.message);
  }
}

async function rejectByAdmin(id) {
  try {
    await adminApi.rejectRequest(id);
    showSuccess('Request rejected');
    loadRequests();
  } catch (err) {
    showError(err.message);
  }
}
