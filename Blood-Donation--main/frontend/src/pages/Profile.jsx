import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Auth, donorApi, authApi } from '../services/api';
import { useToast } from '../components/ToastContext';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import { AvatarImage } from '../components/AvatarImage';
import { CityAutocompleteInput } from '../components/CityAutocompleteInput';
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
    available: true,
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
          const img = donor.profileImage || donor.profilePhoto || user.profileImage || '';
          setDonorDetails({
            bloodGroup: donor.bloodGroup || 'O+',
            age: donor.age || '25',
            gender: donor.gender || 'Male',
            city: donor.city || 'Delhi',
            address: donor.address || '',
            lastDonationDate: donor.lastDonationDate || '',
            available: donor.available !== false,
            totalDonations: donor.totalDonations || 0,
            profilePhoto: img,
            profileImage: img
          });
          setCurrentProfileImage(img);
        }
      }
    } catch (err) {
      console.warn('Donor profile load info:', err.message);
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
      const updatedUser = { ...user, name: name.trim() };
      Auth.setUser(updatedUser);
      showSuccess('Profile details updated successfully!');
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

  const handlePhotoUpload = (e) => {
    e.preventDefault();
    if (!photoFile) {
      showError('Please select an image file first');
      return;
    }

    if (!ALLOWED_TYPES.includes(photoFile.type)) {
      showError('Only JPG, JPEG, PNG or WEBP images allowed');
      return;
    }

    if (photoFile.size > MAX_SIZE_MB * 1024 * 1024) {
      showError(`File size must not exceed ${MAX_SIZE_MB}MB`);
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target.result;
      Auth.updateProfileImage(dataUrl);
      setCurrentProfileImage(dataUrl);
      showSuccess('Profile photo updated successfully!');
      setPhotoFile(null);
      const fileInput = document.getElementById('profilePhotoInput');
      if (fileInput) fileInput.value = '';
    };
    reader.readAsDataURL(photoFile);
  };

  return (
    <div className="d-flex flex-column min-vh-100 dark-theme-page">
      <Navbar />

      <div className="dashboard-layout">
        <Sidebar />

        <main className="dashboard-content p-4">
          <div className="profile-header glass-card border-gradient p-4 rounded-4 mb-4">
            <div className="d-flex align-items-center gap-4 flex-wrap">
              <div id="profileAvatarContainer" className="position-relative">
                <AvatarImage name={name} imageUrl={currentProfileImage} size={90} />
              </div>
              <div>
                <h1 className="h2 m-0 fw-bold text-white" id="profileName">{name}</h1>
                <p className="m-0 text-white-50 small" id="profileEmail"><i className="bi bi-envelope me-1"></i>{user?.email}</p>
                <span className="badge bg-danger rounded-pill px-3 py-1 mt-2 text-uppercase font-weight-bold" id="profileRole">
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
                <div className="form-card glass-card p-4 rounded-4 h-100">
                  <h3 className="h5 fw-bold mb-4 text-white"><i className="bi bi-gear-fill text-danger me-2"></i>Account Settings</h3>
                  <form onSubmit={handleUserUpdate}>
                    <div className="mb-3">
                      <label htmlFor="userNameInput" className="form-label-custom text-white small fw-bold">Full Name</label>
                      <input
                        type="text"
                        className="form-control-custom"
                        id="userNameInput"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </div>
                    <button type="submit" className="btn-primary-custom btn-glow-3d">Update Name</button>
                  </form>

                  {/* Photo Upload */}
                  <hr className="my-4 border-secondary border-opacity-25" />
                  <h4 className="h6 fw-bold mb-2 text-white"><i className="bi bi-camera-fill text-danger me-2"></i>Upload Profile Photo</h4>
                  <p className="text-white-50 small mb-3">
                    Select a JPG, PNG, or WEBP image from your device.
                  </p>
                  <form onSubmit={handlePhotoUpload}>
                    <div className="mb-3">
                      <input
                        type="file"
                        className="form-control-custom"
                        id="profilePhotoInput"
                        accept=".jpg,.jpeg,.png,.webp"
                        onChange={(e) => setPhotoFile(e.target.files[0])}
                      />
                    </div>
                    <button className="btn btn-danger rounded-pill px-4" type="submit">
                      <i className="bi bi-cloud-arrow-up me-1"></i> Save Photo
                    </button>
                  </form>
                </div>
              </div>

              {/* Donor Profile settings (only for Donors) */}
              {Auth.isDonor() && (
                <div className="col-lg-6" id="donorSection">
                  <div className="form-card glass-card p-4 rounded-4 h-100">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                      <h3 className="h5 fw-bold m-0 text-white"><i className="bi bi-heart-pulse-fill text-danger me-2"></i>Donor Profile</h3>
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
                          <label htmlFor="donorBloodGroup" className="form-label-custom text-white small fw-bold">Blood Group</label>
                          <select
                            className="form-select form-control-custom"
                            id="donorBloodGroup"
                            value={donorDetails.bloodGroup}
                            onChange={(e) => setDonorDetails({ ...donorDetails, bloodGroup: e.target.value })}
                            required
                          >
                            {BLOOD_GROUPS.map((bg) => (
                              <option key={bg} value={bg}>{bg}</option>
                            ))}
                          </select>
                        </div>
                        <div className="col-md-6 mb-3">
                          <label htmlFor="donorAge" className="form-label-custom text-white small fw-bold">Age</label>
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
                          <label htmlFor="donorGender" className="form-label-custom text-white small fw-bold">Gender</label>
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
                        <div className="col-md-6 mb-3 position-relative">
                          <label htmlFor="donorCity" className="form-label-custom text-white small fw-bold">City / Village</label>
                          <CityAutocompleteInput
                            id="donorCity"
                            value={donorDetails.city}
                            onChange={(e) => setDonorDetails({ ...donorDetails, city: e.target.value })}
                            placeholder="Type city or village..."
                            className="form-control-custom"
                          />
                        </div>
                      </div>

                      <div className="mb-3">
                        <label htmlFor="donorAddress" className="form-label-custom text-white small fw-bold">Full Address</label>
                        <textarea
                          className="form-control-custom"
                          id="donorAddress"
                          rows="2"
                          value={donorDetails.address}
                          onChange={(e) => setDonorDetails({ ...donorDetails, address: e.target.value })}
                        ></textarea>
                      </div>

                      <div className="mb-4">
                        <label htmlFor="lastDonationDate" className="form-label-custom text-white small fw-bold">Last Donation Date</label>
                        <input
                          type="date"
                          className="form-control-custom"
                          id="lastDonationDate"
                          value={donorDetails.lastDonationDate}
                          onChange={(e) => setDonorDetails({ ...donorDetails, lastDonationDate: e.target.value })}
                        />
                      </div>

                      <div className="d-flex gap-2">
                        <button type="submit" className="btn-primary-custom btn-glow-3d">Save Profile</button>
                        <button
                          type="button"
                          className="btn btn-outline-light text-white rounded-pill px-3 border-opacity-25"
                          onClick={handleAvailabilityToggle}
                        >
                          Toggle Availability
                        </button>
                      </div>
                    </form>
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
