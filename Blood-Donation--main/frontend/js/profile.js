/**
 * profile.js - Profile page logic
 * Manages donor profile details, general details update and availability status.
 */

document.addEventListener('DOMContentLoaded', () => {
    if (!initProtectedPage()) return;

    // Set active nav
    setActiveNav('profile');

    // Load profile details
    loadUserProfile();

    // Populate blood group select
    populateBloodGroupSelect('donorBloodGroup');

    // Setup form submission listeners
    const userForm = document.getElementById('userProfileForm');
    if (userForm) userForm.addEventListener('submit', handleUserUpdate);

    const donorForm = document.getElementById('donorProfileForm');
    if (donorForm) donorForm.addEventListener('submit', handleDonorUpdate);

    const availBtn = document.getElementById('toggleAvailBtn');
    if (availBtn) availBtn.addEventListener('click', handleAvailabilityToggle);
});

let currentDonorId = null;

async function loadUserProfile() {
    showSpinner('Loading profile...');
    const user = Auth.getUser();
    if (!user) return;

    document.getElementById('profileName').textContent = user.name;
    document.getElementById('profileEmail').textContent = user.email;
    document.getElementById('profileRole').textContent = user.role.replace('ROLE_', '');

    document.getElementById('userNameInput').value = user.name;

    const donorSection = document.getElementById('donorSection');

    if (Auth.isDonor()) {
        if (donorSection) donorSection.style.display = 'block';

        try {
            const res = await donorApi.getByUserId(user.id);
            const donor = res.data;

            if (donor) {
                currentDonorId = donor.id;

                document.getElementById('donorBloodGroup').value = donor.bloodGroup || '';
                document.getElementById('donorAge').value = donor.age || '';
                document.getElementById('donorGender').value = donor.gender || 'Male';
                document.getElementById('donorCity').value = donor.city || '';
                document.getElementById('donorAddress').value = donor.address || '';
                document.getElementById('lastDonationDate').value = donor.lastDonationDate || '';

                document.getElementById('availStatusBadge').innerHTML =
                    getAvailabilityBadge(donor.available);

                document.getElementById('totalDonationsVal').textContent =
                    donor.totalDonations || 0;

                // Default avatar only
                const avatarContainer = document.getElementById('profileAvatarContainer');
                if (avatarContainer) {
                    avatarContainer.innerHTML = renderAvatar(user.name, null, 100);
                }
            }
        } catch (err) {
            showError('Could not load donor profile. Please create one.');
        }
    } else {
        if (donorSection) donorSection.style.display = 'none';

        const avatarContainer = document.getElementById('profileAvatarContainer');
        if (avatarContainer) {
            avatarContainer.innerHTML = renderAvatar(user.name, null, 100);
        }
    }

    hideSpinner();
}

async function handleUserUpdate(e) {
    e.preventDefault();

    const name = document.getElementById('userNameInput').value.trim();

    if (!name) {
        showError('Name cannot be empty');
        return;
    }

    showSpinner('Updating details...');

    try {
        showSuccess('Basic details updated!');

        const user = Auth.getUser();
        user.name = name;
        Auth.setUser(user);

        loadUserProfile();
    } catch (err) {
        showError(err.message);
    } finally {
        hideSpinner();
    }
}

async function handleDonorUpdate(e) {
    e.preventDefault();

    if (!currentDonorId) return;

    const data = {
        bloodGroup: document.getElementById('donorBloodGroup').value,
        age: parseInt(document.getElementById('donorAge').value),
        gender: document.getElementById('donorGender').value,
        city: document.getElementById('donorCity').value.trim(),
        address: document.getElementById('donorAddress').value.trim(),
        lastDonationDate: document.getElementById('lastDonationDate').value || null
    };

    if (!data.bloodGroup || isNaN(data.age) || !data.city) {
        showError('Please fill in all required fields');
        return;
    }

    showSpinner('Saving donor profile...');

    try {
        const res = await donorApi.update(currentDonorId, data);

        if (res.success) {
            showSuccess('Donor profile updated successfully');
            loadUserProfile();
        }
    } catch (err) {
        showError(err.message);
    } finally {
        hideSpinner();
    }
}

async function handleAvailabilityToggle() {
    if (!currentDonorId) return;

    showSpinner('Toggling status...');

    try {
        await donorApi.toggleAvailability(currentDonorId);

        showSuccess('Availability status updated');
        loadUserProfile();
    } catch (err) {
        showError(err.message);
    } finally {
        hideSpinner();
    }
}