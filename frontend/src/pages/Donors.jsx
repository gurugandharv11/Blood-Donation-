import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Auth, donorApi } from '../services/api';
import { useToast } from '../components/ToastContext';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { AvatarImage } from '../components/AvatarImage';
import { BLOOD_GROUPS, formatDate, debounce } from '../services/utils';

export const Donors = () => {
  const navigate = useNavigate();
  const { showError } = useToast();
  const user = Auth.getUser();

  const [bloodGroup, setBloodGroup] = useState('');
  const [city, setCity] = useState('');
  const [availableOnly, setAvailableOnly] = useState(true);
  const [donors, setDonors] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [searching, setSearching] = useState(false);

  const executeSearch = useCallback(
    async (bg, c, avail, page) => {
      setSearching(true);
      try {
        const res = await donorApi.search({
          bloodGroup: bg,
          city: c.trim(),
          available: avail ? true : null,
          page: page,
          size: 9
        });
        setDonors(res.data?.content || []);
        setTotalPages(res.data?.totalPages || 0);
      } catch (err) {
        showError('Search failed: ' + err.message);
      } finally {
        setSearching(false);
      }
    },
    [showError]
  );

  // Debounced search for city changes
  const debouncedSearch = useCallback(
    debounce((bg, c, avail, page) => {
      executeSearch(bg, c, avail, page);
    }, 300),
    [executeSearch]
  );

  useEffect(() => {
    executeSearch(bloodGroup, city, availableOnly, currentPage);
  }, [bloodGroup, availableOnly, currentPage, executeSearch]);

  const handleCityChange = (e) => {
    const val = e.target.value;
    setCity(val);
    setCurrentPage(0);
    debouncedSearch(bloodGroup, val, availableOnly, 0);
  };

  const handleRequestClick = (d) => {
    navigate('/requests', {
      state: {
        requestForDonor: d.id,
        donorName: d.name,
        bloodGroup: d.bloodGroup,
        city: d.city || ''
      }
    });
  };

  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar />

      <div className="container my-5">
        <div className="section-header text-start mb-4">
          <span className="section-eyebrow">Search Engine</span>
          <h1 className="section-title h2">Find Available Donors</h1>
          <p className="section-subtitle ms-0">Find eligible blood donors in your area and contact them instantly.</p>
        </div>

        {/* Search Filters */}
        <div className="search-section">
          <div className="row g-3 align-items-end">
            <div className="col-md-4">
              <label htmlFor="filterBloodGroup" className="form-label-custom">Blood Group</label>
              <select
                className="form-select form-control-custom"
                id="filterBloodGroup"
                value={bloodGroup}
                onChange={(e) => { setBloodGroup(e.target.value); setCurrentPage(0); }}
              >
                <option value="">Select Blood Group</option>
                {BLOOD_GROUPS.map((bg) => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>
            </div>
            <div className="col-md-4">
              <label htmlFor="filterCity" className="form-label-custom">City Name</label>
              <input
                type="text"
                className="form-control-custom"
                id="filterCity"
                placeholder="e.g. Mumbai, Delhi"
                value={city}
                onChange={handleCityChange}
              />
            </div>
            <div className="col-md-4">
              <div className="form-check form-switch mb-2">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="filterAvailable"
                  checked={availableOnly}
                  onChange={(e) => { setAvailableOnly(e.target.checked); setCurrentPage(0); }}
                />
                <label className="form-check-label form-label-custom mb-0 ms-2" htmlFor="filterAvailable" style={{ cursor: 'pointer' }}>
                  Show Available Only
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Donors Grid */}
        {searching ? (
          <div className="text-center py-5">
            <div className="spinner-blood mx-auto"></div>
            <p className="text-muted mt-2">Searching available donors...</p>
          </div>
        ) : (
          <div className="row g-4" id="donorsGrid">
            {!donors.length ? (
              <div className="col-12">
                <div className="empty-state">
                  <i className="bi bi-people"></i>
                  <h3>No Donors Found</h3>
                  <p>Try modifying your search criteria or selecting a different city.</p>
                </div>
              </div>
            ) : (
              donors.map((d) => (
                <div className="col-12 col-md-6 col-lg-4 mb-4" key={d.id}>
                  <div className="donor-card">
                    <div className="d-flex align-items-center gap-3">
                      <AvatarImage name={d.name} imageUrl={d.profileImage || d.profilePhoto} size={56} />
                      <div>
                        <div className="donor-name">{d.name}</div>
                        <div className="donor-meta">{d.city || 'City not updated'}</div>
                      </div>
                      <div className="ms-auto">
                        <span className="badge-blood">{d.bloodGroup}</span>
                      </div>
                    </div>

                    <ul className="donor-info-list flex-grow-1">
                      <li>
                        <i className="bi bi-phone"></i> {user ? (d.phone || 'No phone') : 'Logged in users only'}
                      </li>
                      <li>
                        <i className="bi bi-gender-ambiguous"></i> {d.gender || '--'}, {d.age || '--'} yrs
                      </li>
                      <li>
                        <i className="bi bi-activity"></i> Status:{' '}
                        <span className={`badge-custom ${d.available ? 'badge-available' : 'badge-unavailable'}`}>
                          <i className={`bi ${d.available ? 'bi-check-circle' : 'bi-x-circle'}`}></i>
                          {d.available ? ' Available' : ' Unavailable'}
                        </span>
                      </li>
                      <li>
                        <i className="bi bi-calendar-event"></i> Last Donation: {formatDate(d.lastDonationDate)}
                      </li>
                    </ul>

                    {user ? (
                      <button
                        onClick={() => handleRequestClick(d)}
                        className="btn-primary-custom w-100 mt-3 justify-content-center"
                      >
                        <i className="bi bi-droplet-fill"></i> Request Blood
                      </button>
                    ) : (
                      <Link
                        to="/login"
                        className="btn btn-outline-custom text-red border-red w-100 mt-3 justify-content-center d-flex align-items-center"
                      >
                        Login to Request
                      </Link>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination-custom mt-4">
            <button
              className="page-btn"
              disabled={currentPage === 0}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              <i className="bi bi-chevron-left"></i>
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                className={`page-btn ${currentPage === i ? 'active' : ''}`}
                onClick={() => setCurrentPage(i)}
              >
                {i + 1}
              </button>
            ))}
            <button
              className="page-btn"
              disabled={currentPage >= totalPages - 1}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              <i className="bi bi-chevron-right"></i>
            </button>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};
