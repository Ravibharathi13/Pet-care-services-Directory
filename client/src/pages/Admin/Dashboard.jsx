import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import API from "../../api";
import Navigation from "../../components/Navigation";

export default function Dashboard(){
  // Unified list of Tamil Nadu districts (kept in sync with DistrictChips)
  const districts = [
    "Ariyalur", "Chengalpattu", "Chennai", "Coimbatore", "Cuddalore",
    "Dharmapuri", "Dindigul", "Erode", "Kallakurichi", "Kancheepuram",
    "Kanniyakumari", "Karur", "Krishnagiri", "Madurai", "Mayiladuthurai",
    "Nagapattinam", "Namakkal", "Perambalur", "Pudukkottai", "Ramanathapuram",
    "Ranipet", "Salem", "Sivaganga", "Tenkasi", "Thanjavur", "Theni",
    "Tiruchirappalli", "Tirunelveli", "Tirupathur", "Tiruppur", "Tiruvallur",
    "Tiruvannamalai", "Tiruvarur", "Vellore", "Viluppuram", "Virudhunagar",
    "The Nilgiris", "Thoothukudi"
  ];
  const [services, setServices] = useState([]);
  const [analytics, setAnalytics] = useState({ 
    totalVisits: 0, 
    todayVisits: 0, 
    weeklyVisits: 0, 
    authenticatedVisits: 0, 
    anonymousVisits: 0, 
    uniqueUsers: 0 
  });
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDistrict, setFilterDistrict] = useState("");
  const [form, setForm] = useState({ 
    name: "", 
    district: "Coimbatore", 
    address: "", 
    latitude: "", 
    longitude: "", 
    phone: "",
    services: "",
    rating: "",
    hours: ""
  });
  const [toast, setToast] = useState({ show: false, type: 'success', message: '' });

  const showToast = (message, type = 'success', duration = 3000) => {
    setToast({ show: true, type, message });
    window.clearTimeout(showToast._t);
    showToast._t = window.setTimeout(() => setToast(prev => ({ ...prev, show: false })), duration);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [servicesRes, analyticsRes] = await Promise.all([
        API.get("/services"),
        API.get("/analytics/stats")
      ]);
      setServices(servicesRes.data);
      setAnalytics(analyticsRes.data);
    } catch (e) { 
      console.error(e); 
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    // Basic client-side validation
    const lat = parseFloat(form.latitude);
    const lng = parseFloat(form.longitude);
    if (!form.name?.trim()) {
      showToast('Center name is required', 'error');
      return;
    }
    if (!form.district) {
      showToast('Please select a district', 'error');
      return;
    }
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      showToast('Valid latitude and longitude are required', 'error');
      return;
    }

    try {
      const payload = { 
        ...form, 
        latitude: lat, 
        longitude: lng,
        rating: parseFloat(form.rating) || 0
      };
      
      if (editing) {
        await API.put(`/services/${editing._id}`, payload);
        setEditing(null);
        showToast('Center updated successfully', 'success');
      } else {
        await API.post("/services", payload);
        showToast('Center added successfully', 'success');
      }
      
      resetForm();
      loadData();
    } catch (e) { 
      const msg = e?.response?.data?.message || (editing ? 'Update failed' : 'Add failed');
      showToast(msg, 'error');
    }
  };

  const resetForm = () => {
    setForm({ 
      name: "", 
      district: "Coimbatore", 
      address: "", 
      latitude: "", 
      longitude: "", 
      phone: "",
      services: "",
      rating: "",
      hours: ""
    });
  };

  const editService = (service) => {
    setEditing(service);
    setForm({
      name: service.name,
      district: service.district,
      address: service.address || "",
      latitude: service.latitude?.toString() || "",
      longitude: service.longitude?.toString() || "",
      phone: service.phone || "",
      services: service.services || "",
      rating: service.rating?.toString() || "",
      hours: service.hours || ""
    });
  };

  const cancelEdit = () => {
    setEditing(null);
    resetForm();
  };

  const remove = async (id) => {
    if (!confirm("Are you sure you want to delete this center?")) return;
    try {
    await API.delete(`/services/${id}`);
      loadData();
    } catch (e) {
      alert("Delete failed");
    }
  };

  const filteredServices = services.filter((service) => {
    const q = (searchTerm || "").trim().toLowerCase();
    const haystacks = [service?.name, service?.address, service?.services];
    const matchesSearch = q === "" || haystacks.some((v) => (v || "").toLowerCase().includes(q));
    const matchesDistrict = !filterDistrict || service.district === filterDistrict;
    return matchesSearch && matchesDistrict;
  });

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <div className="loading-text">Loading Dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Navigation />
      {/* Centered Toast Notification */}
      {toast.show && createPortal(
        <div role="dialog" aria-live="polite" aria-modal="true" style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {/* Backdrop */}
          <div
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.25)', zIndex: 0 }}
            onClick={() => setToast(prev => ({ ...prev, show: false }))}
          />
          {/* Card */}
          <div
            style={{
              position: 'relative',
              width: 'min(92vw, 380px)',
              background: '#ffffff',
              borderRadius: '12px',
              boxShadow: '0 12px 40px rgba(0,0,0,0.2)',
              overflow: 'hidden',
              border: '1px solid #e5e7eb',
              zIndex: 1
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '16px',
                background:
                  toast.type === 'success'
                    ? 'linear-gradient(135deg,#10B981,#059669)'
                    : toast.type === 'error'
                    ? 'linear-gradient(135deg,#EF4444,#DC2626)'
                    : 'linear-gradient(135deg,#3B82F6,#1D4ED8)',
                color: 'white',
                fontWeight: 700
              }}
            >
              <span>{toast.type === 'success' ? '✅' : toast.type === 'error' ? '⚠️' : 'ℹ️'}</span>
              <span>{toast.message}</span>
            </div>
            <div style={{ padding: '12px', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setToast(prev => ({ ...prev, show: false }))}
                className="btn btn-secondary"
                style={{
                  background: '#f3f4f6',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '6px 12px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
      
      {/* Stats Header */}
      <div className="nav">
        <div className="nav-container">
          <div></div>
          <div className="stats-header">
            <div className="stat-item">
              <div className="stat-number">{analytics.totalVisits}</div>
              <div className="stat-label">TOTAL VISITS</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">{analytics.todayVisits}</div>
              <div className="stat-label">TODAY</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">{analytics.weeklyVisits}</div>
              <div className="stat-label">THIS WEEK</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">{analytics.authenticatedVisits}</div>
              <div className="stat-label">LOGGED IN USERS</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">{analytics.uniqueUsers}</div>
              <div className="stat-label">UNIQUE USERS</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">{services.length}</div>
              <div className="stat-label">TOTAL CENTERS</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Dashboard Title */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">Manage pet care centers and monitor analytics</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Centers List */}
          <div className="lg:col-span-2">
            <div className="card">
              <div className="card-header">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Pet Care Centers</h3>
                    <p className="text-gray-600 mt-1">
                      {filteredServices.length} of {services.length} centers shown
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="text"
                      placeholder="Search centers..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="form-input"
                    />
                    <select
                      value={filterDistrict}
                      onChange={(e) => setFilterDistrict(e.target.value)}
                      className="form-select"
                    >
                      <option value="">All Districts</option>
                      {districts.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="card-body">
                <div className="service-list">
                  {filteredServices.map(service => (
                    <div key={service._id} className="service-card">
                      <div className="service-header">
                        <div className="service-info">
                          <h4 className="service-name">{service.name}</h4>
                          <div className="service-meta">
                            <span className="service-district">{service.district}</span>
                            {service.rating && (
                              <span className="service-rating">
                                <svg className="rating-star" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                                <span className="rating-text">{service.rating}</span>
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => editService(service)}
                            className="btn btn-secondary"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => remove(service._id)}
                            className="btn btn-danger"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                      
                      {service.address && (
                        <div className="service-address">
                          <svg className="address-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span>{service.address}</span>
                        </div>
                      )}
                      
                      <div className="service-details">
                        {service.phone && (
                          <div className="service-detail-item">
                            <svg className="detail-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            <span>{service.phone}</span>
                          </div>
                        )}
                        
                        {service.services && (
                          <div className="service-detail-item">
                            <svg className="detail-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a1 1 0 01-1.415-1.414l.158-.316a6 6 0 00.517-3.86l-.477-2.387a2 2 0 00-.547-1.022.146.146 0 01.054-.054A2 2 0 0112 2a2 2 0 01.054.054.146.146 0 01.054.054z" />
                            </svg>
                            <span>{service.services}</span>
                          </div>
                        )}
                        
                        {service.hours && (
                          <div className="service-detail-item">
                            <svg className="detail-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>{service.hours}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {filteredServices.length === 0 && (
                    <div className="empty-container">
                      <div className="empty-icon">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.47-.881-6.08-2.33" />
                        </svg>
                      </div>
                      <div className="empty-title">No centers found</div>
                      <div className="empty-description">
                        {searchTerm || filterDistrict 
                          ? 'Try adjusting your search criteria.' 
                          : 'Add your first center using the form on the right.'
                        }
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Add/Edit Form */}
          <div className="lg:col-span-1">
            <div className="form-container admin-add-pro">
              <div className="admin-add-header">
                <span className="emoji-badge" aria-hidden>{editing ? '✏️' : '🐾'}</span>
                <div>
                  <div className="form-title">
                    {editing ? '✏️ Edit Center' : '🐾 Add New Center'}
                  </div>
                  <div className="form-subtitle">
                    {editing ? 'Update center information' : 'Register a new pet care center'}
                  </div>
                </div>
              </div>
              
              <form onSubmit={submit} className="space-y-6">
                <div className="form-group">
                  <label className="form-label">Center Name *</label>
                  <input
                    required
                    value={form.name}
                    onChange={e => setForm({...form, name: e.target.value})}
                    placeholder="Enter center name"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">District *</label>
                  <select
                    value={form.district}
                    onChange={e => setForm({...form, district: e.target.value})}
                    className="form-select"
                  >
                    {districts.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Address</label>
                  <textarea
                    value={form.address}
                    onChange={e => setForm({...form, address: e.target.value})}
                    placeholder="Enter full address"
                    rows={3}
                    className="form-textarea"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="form-label">Latitude</label>
                    <input
                      value={form.latitude}
                      onChange={e => setForm({...form, latitude: e.target.value})}
                      placeholder="11.0168"
                      type="number"
                      step="any"
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Longitude</label>
                    <input
                      value={form.longitude}
                      onChange={e => setForm({...form, longitude: e.target.value})}
                      placeholder="76.9558"
                      type="number"
                      step="any"
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input
                    value={form.phone}
                    onChange={e => setForm({...form, phone: e.target.value})}
                    placeholder="+91 98765 43210"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Services Offered</label>
                  <input
                    value={form.services}
                    onChange={e => setForm({...form, services: e.target.value})}
                    placeholder="Grooming, Vaccination, Surgery, etc."
                    className="form-input"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="form-label">Rating (1-5)</label>
                    <input
                      value={form.rating}
                      onChange={e => setForm({...form, rating: e.target.value})}
                      placeholder="4.5"
                      type="number"
                      min="1"
                      max="5"
                      step="0.1"
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Operating Hours</label>
                    <input
                      value={form.hours}
                      onChange={e => setForm({...form, hours: e.target.value})}
                      placeholder="9 AM - 6 PM"
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    className="btn btn-primary flex-1"
                  >
                    {editing ? 'Update Center' : 'Add Center'}
                  </button>
                  {editing && (
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="btn btn-secondary"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
