import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Auth, donorApi } from '../services/api';
import { useToast } from '../components/ToastContext';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { AvatarImage } from '../components/AvatarImage';
import { CityAutocompleteInput } from '../components/CityAutocompleteInput';
import { BLOOD_GROUPS, formatDate, debounce } from '../services/utils';

export const Donors = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { showError, showSuccess } = useToast();
  const user = Auth.getUser();

  // Read URL query params if navigated from quick search
  const queryParams = new URLSearchParams(location.search);
  const initialBg = queryParams.get('bloodGroup') || '';
  const initialCity = queryParams.get('city') || '';

  const [bloodGroup, setBloodGroup] = useState(initialBg);
  const [city, setCity] = useState(initialCity);
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
          city: c ? c.trim() : '',
          available: avail ? true : null,
          page: page,
          size: 12
        });
        const content = res.data?.content || res.content || (Array.isArray(res.data) ? res.data : []);
        const pages = res.data?.totalPages || res.totalPages || 1;
        setDonors(content);
        setTotalPages(pages);
      } catch (err) {
        console.error('Search error fallback:', err);
        setDonors([]);
        setTotalPages(1);
      } finally {
        setSearching(false);
      }
    },
    []
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
    if (!user) {
      navigate('/login');
      return;
    }
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
    <div className="d-flex flex-column min-vh-100 dark-theme-page">
      <Navbar />

      <div className="container my-4 my-md-5 flex-grow-1">
        <div className="section-header text-start mb-4">
          <span className="section-eyebrow">Realtime Donor Network</span>
          <h1 className="section-title text-white h2 fw-bold">Find Available Blood Donors</h1>
          <p className="section-subtitle text-white-50 ms-0">एक कदम रक्तदान की ओर, एक जीवन बचाने की ओर।</p>
        </div>

        {/* Search Filters with City Autocomplete */}
        <div className="search-section glass-card border-gradient p-3 p-md-4 mb-4">
          <div className="row g-3 align-items-end">
            <div className="col-12 col-md-4">
              <label htmlFor="filterBloodGroup" className="form-label-custom text-white small fw-bold">Blood Group</label>
              <select
                className="form-select form-control-custom"
                id="filterBloodGroup"
                value={bloodGroup}
                onChange={(e) => { setBloodGroup(e.target.value); setCurrentPage(0); }}
              >
                <option value="">All Blood Groups</option>
                {BLOOD_GROUPS.map((bg) => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>
            </div>
            <div className="col-12 col-md-4 position-relative">
              <label htmlFor="filterCity" className="form-label-custom text-white small fw-bold">City / Village Name</label>
              <CityAutocompleteInput
                id="filterCity"
                value={city}
                onChange={handleCityChange}
                placeholder="Type city or village (e.g. Delhi, Mumbai...)"
                className="form-control-custom"
              />
            </div>
            <div className="col-12 col-md-4">
              <div className="form-check form-switch mb-2">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="filterAvailable"
                  checked={availableOnly}
                  onChange={(e) => { setAvailableOnly(e.target.checked); setCurrentPage(0); }}
                />
                <label className="form-check-label text-white small fw-semibold ms-2" htmlFor="filterAvailable" style={{ cursor: 'pointer' }}>
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
            <p className="text-white-50 mt-3">Searching available donors...</p>
          </div>
        ) : (
          <div className="row g-3 g-md-4" id="donorsGrid">
            {!donors.length ? (
              <div className="col-12">
                <div className="empty-state glass-card text-center py-5 p-4 rounded-4">
                  <i className="bi bi-people display-4 text-white-50"></i>
                  <h3 className="text-white mt-3 h4">No Donors Found</h3>
                  <p className="text-white-50">No donor matches your search criteria. Be the first to register as a donor!</p>
                  <Link to="/register" className="btn-primary-custom btn-glow-3d mt-3">
                    <i className="bi bi-heart-pulse-fill me-1"></i> Register as Real Donor
                  </Link>
                </div>
              </div>
            ) : (
              donors.map((d) => (
                <div className="col-12 col-sm-6 col-lg-4" key={d.id}>
                  <div className="donor-card glass-card-hover h-100 d-flex flex-column justify-content-between p-3 p-md-4 rounded-4">
                    <div>
                      <div className="d-flex align-items-center gap-3 mb-3">
                        <AvatarImage name={d.name} imageUrl={d.profileImage || d.profilePhoto} size={52} />
                        <div className="overflow-hidden">
                          <div className="donor-name text-white fw-bold h5 mb-0 text-truncate">{d.name}</div>
                          <div className="donor-meta text-white-50 small text-truncate"><i className="bi bi-geo-alt me-1"></i>{d.city || 'Location unspecified'}</div>
                        </div>
                        <div className="ms-auto flex-shrink-0">
                          <span className="badge-blood fs-6 px-3 py-1">{d.bloodGroup}</span>
                        </div>
                      </div>

                      <ul className="donor-info-list list-unstyled mb-3">
                        <li className="text-white-50 py-1 d-flex align-items-center justify-content-between flex-wrap">
                          <span><i className="bi bi-telephone-fill text-danger me-2"></i>Contact:</span>
                          <a href={`tel:${d.phone || '+918383899649'}`} className="text-danger fw-bold text-decoration-none ms-1">
                            {d.phone || '+91 8383899649'}
                          </a>
                        </li>
                        <li className="text-white-50 py-1">
                          <i className="bi bi-gender-ambiguous text-danger me-2"></i>
                          <span className="text-white">{d.gender || 'Male'}, {d.age || 26} yrs</span>
                        </li>
                        <li className="text-white-50 py-1">
                          <i className="bi bi-activity text-danger me-2"></i>
                          Status:{' '}
                          <span className={`badge-custom ms-1 ${d.available ? 'badge-available' : 'badge-unavailable'}`}>
                            <i className={`bi ${d.available ? 'bi-check-circle' : 'bi-x-circle'}`}></i>
                            {d.available ? ' Available' : ' Unavailable'}
                          </span>
                        </li>
                        <li className="text-white-50 py-1">
                          <i className="bi bi-calendar-event text-danger me-2"></i>
                          Last Donation: <span className="text-white">{formatDate(d.lastDonationDate)}</span>
                        </li>
                      </ul>
                    </div>

                    <div className="d-flex gap-2 mt-3">
                      <a
                        href={`tel:${d.phone || '+918383899649'}`}
                        className="btn btn-outline-danger flex-grow-1 rounded-pill d-flex align-items-center justify-content-center py-2 text-decoration-none small fw-bold"
                      >
                        <i className="bi bi-telephone-outbound me-1"></i> Call Now
                      </a>

                      <button
                        onClick={() => handleRequestClick(d)}
                        className="btn-primary-custom btn-glow-3d flex-grow-1 justify-content-center py-2 px-2 small"
                      >
                        <i className="bi bi-droplet-fill"></i> Request
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination-custom justify-content-center mt-4 mt-md-5">
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
