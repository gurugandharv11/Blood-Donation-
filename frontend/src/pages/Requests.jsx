import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Auth, requestApi, adminApi } from '../services/api';
import { useToast } from '../components/ToastContext';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import { BLOOD_GROUPS, URGENCY_LEVELS, formatDate } from '../services/utils';
import { AvatarImage } from '../components/AvatarImage';

export const Requests = () => {
  const { state } = useLocation();
  const { showError, showSuccess, showWarning } = useToast();
  const user = Auth.getUser();

  const [requests, setRequests] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);

  // Modal toggle state
  const [showModal, setShowModal] = useState(false);

  // Form states
  const [patientName, setPatientName] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');
  const [unitsRequired, setUnitsRequired] = useState(1);
  const [hospitalName, setHospitalName] = useState('');
  const [hospitalAddress, setHospitalAddress] = useState('');
  const [city, setCity] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [urgency, setUrgency] = useState('MEDIUM');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    loadRequests();
  }, [currentPage]);

  // Check state from donor redirect
  useEffect(() => {
    if (state?.requestForDonor) {
      setBloodGroup(state.bloodGroup || '');
      setCity(state.city || '');
      setNotes(`Requesting blood donation directly from donor ${state.donorName}.`);
      setShowModal(true);
    }
  }, [state]);

  const loadRequests = async () => {
    if (!user) return;
    setLoading(true);
    try {
      let res;
      if (Auth.isAdmin()) {
        res = await adminApi.getRequests(currentPage, 10);
      } else if (Auth.isSeeker()) {
        res = await requestApi.getMy(currentPage, 10);
      } else if (Auth.isDonor()) {
        res = await requestApi.getPending(currentPage, 10);
      }

      setRequests(res.data?.content || []);
      setTotalPages(res.data?.totalPages || 0);
    } catch (err) {
      showError('Failed to load requests: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRequest = async (e) => {
    e.preventDefault();

    const dto = {
      patientName: patientName.trim(),
      bloodGroup,
      unitsRequired: parseInt(unitsRequired),
      hospitalName: hospitalName.trim(),
      hospitalAddress: hospitalAddress.trim(),
      city: city.trim(),
      contactNumber: contactNumber.trim(),
      urgency,
      notes: notes.trim()
    };

    if (!dto.patientName || !dto.bloodGroup || isNaN(dto.unitsRequired) || !dto.hospitalName || !dto.city || !dto.contactNumber) {
      showError('Please fill in all required fields');
      return;
    }

    try {
      const res = await requestApi.create(dto);
      if (res.success) {
        showSuccess('Blood request created successfully!');
        setShowModal(false);
        // Reset form
        setPatientName('');
        setBloodGroup('');
        setUnitsRequired(1);
        setHospitalName('');
        setHospitalAddress('');
        setCity('');
        setContactNumber('');
        setUrgency('MEDIUM');
        setNotes('');

        setCurrentPage(0);
        loadRequests();
      }
    } catch (err) {
      showError(err.message || 'Failed to create request');
    }
  };

  const handleCancelRequest = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this pending blood request?')) return;
    try {
      await requestApi.cancel(id);
      showSuccess('Blood request canceled');
      loadRequests();
    } catch (err) {
      showError(err.message);
    }
  };

  const handleAcceptRequest = async (id) => {
    try {
      await requestApi.accept(id);
      showSuccess('Blood request accepted! Please get in touch with the seeker.');
      loadRequests();
    } catch (err) {
      showError(err.message);
    }
  };

  const handleRejectRequest = async (id) => {
    if (!window.confirm('Are you sure you want to reject this request? It will go back to the public pool.')) return;
    try {
      await requestApi.reject(id);
      showWarning('Request returned to pending');
      loadRequests();
    } catch (err) {
      showError(err.message);
    }
  };

  const handleCompleteRequest = async (id) => {
    if (!window.confirm('Have you successfully donated blood for this patient? This will complete the request.')) return;
    try {
      await requestApi.complete(id);
      showSuccess('Thank you for your life-saving donation! Request marked as completed.');
      loadRequests();
    } catch (err) {
      showError(err.message);
    }
  };

  const handleDeleteRequest = async (id) => {
    if (!window.confirm('Admin: Delete this request entirely?')) return;
    try {
      await requestApi.delete(id);
      showSuccess('Request deleted');
      loadRequests();
    } catch (err) {
      showError(err.message);
    }
  };

  const handleApproveByAdmin = async (id) => {
    try {
      await adminApi.approveRequest(id);
      showSuccess('Request approved');
      loadRequests();
    } catch (err) {
      showError(err.message);
    }
  };

  const handleRejectByAdmin = async (id) => {
    try {
      await adminApi.rejectRequest(id);
      showSuccess('Request rejected');
      loadRequests();
    } catch (err) {
      showError(err.message);
    }
  };

  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar />

      <div className="dashboard-layout">
        <Sidebar />

        <main className="dashboard-content">
          <div className="page-header d-flex justify-content-between align-items-center flex-wrap gap-2">
            <div>
              <h1>Blood Requests</h1>
              <p className="text-muted small m-0" id="requestsSubTitle">Manage and track blood donation requests</p>
            </div>
            
            {Auth.isSeeker() && (
              <div id="seekerActionsSection">
                <button className="btn-primary-custom" onClick={() => setShowModal(true)}>
                  <i className="bi bi-file-earmark-plus"></i> Create Blood Request
                </button>
              </div>
            )}
            {Auth.isDonor() && (
              <div id="donorActionsSection">
                <span className="badge bg-secondary p-2"><i className="bi bi-droplet-half"></i> Active Donor</span>
              </div>
            )}
          </div>

          {/* Main Blood Requests Table */}
          <div className="table-card">
            <div className="table-header">
              <span className="table-title">Request Board</span>
              <button className="btn btn-sm btn-outline-secondary" onClick={loadRequests}>
                <i className="bi bi-arrow-clockwise"></i> Refresh
              </button>
            </div>

            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-danger" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table-custom">
                  <thead>
                    <tr>
                      <th>Patient</th>
                      <th>Blood</th>
                      <th>Units</th>
                      <th>Hospital / City</th>
                      <th>Contact</th>
                      <th>Urgency</th>
                      <th>Status</th>
                      <th>Requested Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {!requests.length ? (
                      <tr>
                        <td colSpan="9" className="text-center py-5 text-muted">
                          No blood requests found.
                        </td>
                      </tr>
                    ) : (
                      requests.map((r) => {
                        let actionButtons = null;
                        if (Auth.isSeeker()) {
                          if (r.status === 'PENDING') {
                            actionButtons = (
                              <button className="btn btn-sm btn-outline-danger" onClick={() => handleCancelRequest(r.id)}>
                                Cancel
                              </button>
                            );
                          } else {
                            actionButtons = <span className="text-muted">No actions</span>;
                          }
                        } else if (Auth.isDonor()) {
                          if (r.status === 'PENDING') {
                            actionButtons = (
                              <button className="btn btn-sm btn-success" onClick={() => handleAcceptRequest(r.id)}>
                                Accept
                              </button>
                            );
                          } else if (r.status === 'ACCEPTED' && r.donorId === user.donorId) {
                            actionButtons = (
                              <>
                                <button className="btn btn-sm btn-warning me-1" onClick={() => handleRejectRequest(r.id)}>
                                  Reject
                                </button>
                                <button className="btn btn-sm btn-primary-custom" onClick={() => handleCompleteRequest(r.id)}>
                                  Complete
                                </button>
                              </>
                            );
                          } else {
                            actionButtons = <span className="text-muted">--</span>;
                          }
                        } else if (Auth.isAdmin()) {
                          actionButtons = (
                            <>
                              <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteRequest(r.id)}>
                                Delete
                              </button>
                              {r.status === 'PENDING' && (
                                <>
                                  <button className="btn btn-sm btn-success ms-1" onClick={() => handleApproveByAdmin(r.id)}>Approve</button>
                                  <button className="btn btn-sm btn-warning ms-1" onClick={() => handleRejectByAdmin(r.id)}>Reject</button>
                                </>
                              )}
                            </>
                          );
                        }

                        return (
                          <tr key={r.id}>
                            <td>
                              <div className="d-flex align-items-center gap-2">
                                <AvatarImage name={r.seekerName} imageUrl={r.seekerImage} size={32} />
                                <div>
                                  <strong>{r.patientName}</strong>
                                  <div className="text-muted small">Req: {r.seekerName}</div>
                                </div>
                              </div>
                            </td>
                            <td><span className="badge-blood">{r.bloodGroup}</span></td>
                            <td>{r.unitsRequired} unit(s)</td>
                            <td>{r.hospitalName}, {r.city}</td>
                            <td>{r.contactNumber}</td>
                            <td>
                              <span style={{ fontWeight: 600, fontSize: '0.78rem' }}>
                                {r.urgency}
                              </span>
                            </td>
                            <td>
                              <span className={`badge-custom badge-${r.status.toLowerCase()}`}>
                                {r.status}
                              </span>
                            </td>
                            <td>{formatDate(r.createdAt)}</td>
                            <td>
                              <div className="d-flex align-items-center gap-2">
                                {actionButtons}
                                {r.donorName && (
                                  <div className="d-flex align-items-center gap-1 border-start ps-2" title={`Donor: ${r.donorName}`}>
                                    <AvatarImage name={r.donorName} imageUrl={r.donorImage} size={28} />
                                    <span className="small text-muted d-none d-xl-inline">{r.donorName.split(' ')[0]}</span>
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>

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
        </main>
      </div>

      {/* Create Request Modal */}
      {showModal && (
        <div className="modal show d-block modal-custom" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title"><i className="bi bi-droplet-fill text-red me-2"></i>New Blood Request</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleCreateRequest}>
                <div className="modal-body">
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label htmlFor="reqPatientName" className="form-label-custom">Patient Name *</label>
                      <input
                        type="text"
                        className="form-control-custom"
                        placeholder="e.g. Ramesh Kumar"
                        value={patientName}
                        onChange={(e) => setPatientName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="col-md-3 mb-3">
                      <label htmlFor="reqBloodGroup" className="form-label-custom">Blood Group *</label>
                      <select
                        className="form-select form-control-custom"
                        value={bloodGroup}
                        onChange={(e) => setBloodGroup(e.target.value)}
                        required
                      >
                        <option value="">Select Blood Group</option>
                        {BLOOD_GROUPS.map((bg) => (
                          <option key={bg} value={bg}>{bg}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-3 mb-3">
                      <label htmlFor="reqUnits" className="form-label-custom">Units Required *</label>
                      <input
                        type="number"
                        className="form-control-custom"
                        min="1"
                        max="10"
                        value={unitsRequired}
                        onChange={(e) => setUnitsRequired(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label htmlFor="reqHospitalName" className="form-label-custom">Hospital Name *</label>
                      <input
                        type="text"
                        className="form-control-custom"
                        placeholder="e.g. Apollo Hospital"
                        value={hospitalName}
                        onChange={(e) => setHospitalName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label htmlFor="reqContact" className="form-label-custom">Contact Number *</label>
                      <input
                        type="tel"
                        className="form-control-custom"
                        placeholder="10-digit number"
                        value={contactNumber}
                        onChange={(e) => setContactNumber(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label htmlFor="reqCity" className="form-label-custom">City *</label>
                      <input
                        type="text"
                        className="form-control-custom"
                        placeholder="e.g. Mumbai"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        required
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label htmlFor="reqUrgency" className="form-label-custom">Urgency Level *</label>
                      <select
                        className="form-select form-control-custom"
                        value={urgency}
                        onChange={(e) => setUrgency(e.target.value)}
                        required
                      >
                        <option value="CRITICAL">Critical (Immediate)</option>
                        <option value="HIGH">High (Within 24 Hours)</option>
                        <option value="MEDIUM">Medium (Standard)</option>
                        <option value="LOW">Low (Not Urgent)</option>
                      </select>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="reqHospitalAddress" className="form-label-custom">Hospital Address *</label>
                    <textarea
                      className="form-control-custom"
                      rows="2"
                      placeholder="Full hospital address..."
                      value={hospitalAddress}
                      onChange={(e) => setHospitalAddress(e.target.value)}
                      required
                    ></textarea>
                  </div>

                  <div className="mb-0">
                    <label htmlFor="reqNotes" className="form-label-custom">Notes / Message</label>
                    <textarea
                      className="form-control-custom"
                      rows="2"
                      placeholder="Additional details (reason, instructions)..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-outline-secondary rounded-pill" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn-primary-custom">Submit Request</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
