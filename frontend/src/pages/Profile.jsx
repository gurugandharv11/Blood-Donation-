import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Auth, donorApi, authApi } from '../services/api';
import { useToast } from '../components/ToastContext';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import { AvatarImage } from '../components/AvatarImage';
import { BLOOD_GROUPS } from '../services/utils';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE_MB = 5;

export const Profile = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const user = Auth.getUser();

  const [name, setName] = useState(user?.name || '');
  const [donorDetails, setDonorDetails] = useState({
    bloodGroup: '',
    age: '',
    gender: 'Male',
    city: '',
    address: '',
    lastDonationDate: '',
    available: false,
    totalDonations: 0,
    profilePhoto: '',
    profileImage: ''
  });
  const [photoFile, setPhotoFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentDonorId, setCurrentDonorId] = useState(null);
  const [currentProfileImage, setCurrentProfileImage] = useState(user?.profileImage || '');

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    if (!user) return;
    setLoading(true);
    try {
      if (Auth.isDonor()) {
        const res = await donorApi.getByUserId(user.id);
        const donor = res.data;
        if (donor) {
          setCurrentDonorId(donor.id);
          const img = donor.profileImage || donor.profilePhoto || '';
          setDonorDetails({
            bloodGroup: donor.bloodGroup || '',
            age: donor.age || '',
            gender: donor.gender || 'Male',
            city: donor.city || '',
            address: donor.address || '',
            lastDonationDate: donor.lastDonationDate || '',
            available: donor.available || false,
            totalDonations: donor.totalDonations || 0,
            profilePhoto: img,
            profileImage: img
          });
          setCurrentProfileImage(img);
        }
      }
    } catch (err) {
      showError('Could not load donor profile. Please create one.');
    } finally {
      setLoading(false);
    }
  };

  const handleUserUpdate = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      showError('Name cannot be empty');
      return;
    }

    try {
      showSuccess('Basic details updated!');
      const updatedUser = { ...user, name: name.trim() };
      Auth.setUser(updatedUser);
      // Optional: if there was a backend update endpoint, we'd invoke it here.
    } catch (err) {
      showError(err.message);
    }
  };

  const handleDonorUpdate = async (e) => {
    e.preventDefault();
    if (!currentDonorId) return;

    const data = {
      bloodGroup: donorDetails.bloodGroup,
      age: parseInt(donorDetails.age),
      gender: donorDetails.gender,
      city: donorDetails.city.trim(),
      address: donorDetails.address.trim(),
      lastDonationDate: donorDetails.lastDonationDate || null
    };

    if (!data.bloodGroup || isNaN(data.age) || !data.city) {
      showError('Please fill in all required fields');
      return;
    }

    try {
      const res = await donorApi.update(currentDonorId, data);
      if (res.success) {
        showSuccess('Donor profile updated successfully');
        loadUserProfile();
      }
    } catch (err) {
      showError(err.message);
    }
  };

  const handleAvailabilityToggle = async () => {
    if (!currentDonorId) return;
    try {
      await donorApi.toggleAvailability(currentDonorId);
      showSuccess('Availability status updated');
      loadUserProfile();
    } catch (err) {
      showError(err.message);
    }
  };

  const validatePhotoFile = (file) => {
    if (!file) return 'Please select a photo to upload';
    if (!ALLOWED_TYPES.includes(file.type)) return 'Only JPG, JPEG, PNG, or WEBP images are allowed';
    if (file.size > MAX_SIZE_MB * 1024 * 1024) return `File size must not exceed ${MAX_SIZE_MB} MB`;
    return null;
  };

  const handlePhotoUpload = async (e) => {
    e.preventDefault();

    const validationError = validatePhotoFile(photoFile);
    if (validationError) {
      showError(validationError);
      return;
    }

    const formData = new FormData();
    formData.append('file', photoFile);

    try {
      let res;
      if (Auth.isDonor() && currentDonorId) {
        // Use donor-specific upload
        res = await donorApi.uploadPhoto(currentDonorId, formData);
      } else {
        // Use all-user upload endpoint
        res = await authApi.uploadProfileImage(formData);
      }
      if (res.success || res.data) {
        const newUrl = res.data || res;
        showSuccess('Profile photo uploaded!');
        setPhotoFile(null);

        // Update session immediately so other components reflect it
        Auth.updateProfileImage(newUrl);
        setCurrentProfileImage(newUrl);

        // Reset file input
        const fileInput = document.getElementById('profilePhotoInput');
        if (fileInput) fileInput.value = '';

        loadUserProfile();
      }
    } catch (err) {
      showError(err.message || 'Photo upload failed');
    }
  };

  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar />

      <div className="dashboard-layout">
        <Sidebar />

        <main className="dashboard-content">
          <div className="profile-header">
            <div className="d-flex align-items-center gap-4 flex-wrap">
              <div id="profileAvatarContainer">
                <AvatarImage name={name} imageUrl={currentProfileImage} size={100} />
              </div>
              <div>
                <h1 className="h2 m-0 fw-800" id="profileName">{name}</h1>
                <p className="m-0 text-white-50" id="profileEmail">{user?.email}</p>
                <span className="badge bg-danger mt-2" id="profileRole">
                  {user?.role?.replace('ROLE_', '')}
                </span>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-danger" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (
            <div className="row g-4">
              {/* Account Settings */}
              <div className="col-lg-6">
                <div className="form-card h-100">
                  <h3 className="h5 fw-700 mb-4 text-dark-custom">Account Settings</h3>
                  <form onSubmit={handleUserUpdate}>
                    <div className="mb-3">
                      <label htmlFor="userNameInput" className="form-label-custom">Full Name</label>
                      <input
                        type="text"
                        className="form-control-custom"
                        id="userNameInput"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </div>
                    <button type="submit" className="btn-primary-custom">Update Account</button>
                  </form>

                  {/* Photo Upload for ALL users */}
                  <hr className="my-4" />
                  <h4 className="h6 fw-700 mb-3 text-dark-custom">Upload Profile Photo</h4>
                  <p className="text-muted small mb-2">
                    Supported: JPG, PNG, WEBP · Max: 5 MB
                  </p>
                  <form onSubmit={handlePhotoUpload}>
                    <div className="input-group mb-3">
                      <input
                        type="file"
                        className="form-control"
                        id="profilePhotoInput"
                        accept=".jpg,.jpeg,.png,.webp"
                        onChange={(e) => setPhotoFile(e.target.files[0])}
                        required
                      />
                      <button className="btn btn-danger" type="submit">Upload</button>
                    </div>
                  </form>
                </div>
              </div>

              {/* Donor Profile settings (only for Donors) */}
              {Auth.isDonor() && (
                <div className="col-lg-6" id="donorSection">
                  <div className="form-card">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                      <h3 className="h5 fw-700 m-0 text-dark-custom">Donor Profile</h3>
                      <div id="availStatusBadge">
                        <span className={`badge-custom ${donorDetails.available ? 'badge-available' : 'badge-unavailable'}`}>
                          <i className={`bi ${donorDetails.available ? 'bi-check-circle' : 'bi-x-circle'}`}></i>
                          {donorDetails.available ? ' Available' : ' Unavailable'}
                        </span>
                      </div>
                    </div>

                    <form onSubmit={handleDonorUpdate}>
                      <div className="row">
                        <div className="col-md-6 mb-3">
                          <label htmlFor="donorBloodGroup" className="form-label-custom">Blood Group</label>
                          <select
                            className="form-select form-control-custom"
                            id="donorBloodGroup"
                            value={donorDetails.bloodGroup}
                            onChange={(e) => setDonorDetails({ ...donorDetails, bloodGroup: e.target.value })}
                            required
                          >
                            <option value="">Select Blood Group</option>
                            {BLOOD_GROUPS.map((bg) => (
                              <option key={bg} value={bg}>{bg}</option>
                            ))}
                          </select>
                        </div>
                        <div className="col-md-6 mb-3">
                          <label htmlFor="donorAge" className="form-label-custom">Age</label>
                          <input
                            type="number"
                            className="form-control-custom"
                            id="donorAge"
                            min="18"
                            max="65"
                            value={donorDetails.age}
                            onChange={(e) => setDonorDetails({ ...donorDetails, age: e.target.value })}
                            required
                          />
                        </div>
                      </div>

                      <div className="row">
                        <div className="col-md-6 mb-3">
                          <label htmlFor="donorGender" className="form-label-custom">Gender</label>
                          <select
                            className="form-select form-control-custom"
                            id="donorGender"
                            value={donorDetails.gender}
                            onChange={(e) => setDonorDetails({ ...donorDetails, gender: e.target.value })}
                            required
                          >
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                        <div className="col-md-6 mb-3">
                          <label htmlFor="donorCity" className="form-label-custom">City</label>
                          <input
                            type="text"
                            className="form-control-custom"
                            id="donorCity"
                            value={donorDetails.city}
                            onChange={(e) => setDonorDetails({ ...donorDetails, city: e.target.value })}
                            required
                          />
                        </div>
                      </div>

                      <div className="mb-3">
                        <label htmlFor="donorAddress" className="form-label-custom">Full Address</label>
                        <textarea
                          className="form-control-custom"
                          id="donorAddress"
                          rows="2"
                          value={donorDetails.address}
                          onChange={(e) => setDonorDetails({ ...donorDetails, address: e.target.value })}
                        ></textarea>
                      </div>

                      <div className="mb-4">
                        <label htmlFor="lastDonationDate" className="form-label-custom">Last Donation Date</label>
                        <input
                          type="date"
                          className="form-control-custom"
                          id="lastDonationDate"
                          value={donorDetails.lastDonationDate}
                          onChange={(e) => setDonorDetails({ ...donorDetails, lastDonationDate: e.target.value })}
                        />
                      </div>

                      <div className="d-flex gap-2">
                        <button type="submit" className="btn-primary-custom">Save Profile</button>
                        <button
                          type="button"
                          className="btn btn-outline-secondary rounded-pill px-4"
                          onClick={handleAvailabilityToggle}
                        >
                          Toggle Availability
                        </button>
                      </div>
                    </form>

                    <hr className="my-4" />

                    <div className="d-flex justify-content-between text-muted small">
                      <span>Total Successful Donations:</span>
                      <strong className="text-dark">{donorDetails.totalDonations}</strong>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
