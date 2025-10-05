import { useState, useEffect } from "react";
import API from "../api";
import DistrictChips from "../components/DistrictChips";
import ServiceList from "../components/ServiceList";
import MapPanel from "../components/MapPanel";

export default function Home() {
  const [services, setServices] = useState([]);
  const [selectedDistrict, setSelectedDistrict] = useState("Coimbatore");
  const [selectedService, setSelectedService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [routeDistance, setRouteDistance] = useState(null);

  useEffect(() => {
    loadServices();
    // Remove getUserLocation() call - let MapPanel handle location
  }, [selectedDistrict]);

  const loadServices = async () => {
    try {
      setLoading(true);
      const response = await API.get(`/services/district/${selectedDistrict}`);
      setServices(response.data);
    } catch (error) {
      console.error("Error loading services:", error);
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  // Location handling is now fully managed by MapPanel component

  const handleServiceSelect = (service, distance = null, duration = null) => {
    setSelectedService(service);
    setRouteDistance(distance);
    console.log('🎯 Service selected:', service?.name, 'Distance:', distance, 'Duration:', duration);
  };

  const handleDistrictChange = (district) => {
    setSelectedDistrict(district);
    setSelectedService(null);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <div className="loading-text">Loading pet care centers...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Combined Hero + Search Card */}
      <div className="max-w-4xl mx-auto px-4 pt-6">
        <div className="hero-combined-card gradient-card">
          <div className="hero-content">
            <h1 className="hero-title">Find Your Perfect Pet Care Center</h1>
          </div>
          <DistrictChips
            selectedDistrict={selectedDistrict}
            onDistrictChange={handleDistrictChange}
            inCard={false}
          />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Services List */}
          <div className="lg:col-span-1">
            <div className="card">
              <div className="card-header">
                <h2 className="text-2xl font-bold text-gray-900">
                  Centers in {selectedDistrict}
                </h2>
                <p className="text-gray-600 mt-1">
                  {services.length} centers found
                </p>
              </div>
              
              <div className="card-body">
                <ServiceList 
                  items={services} 
                  onSelect={handleServiceSelect}
                />
              </div>
            </div>
          </div>

          {/* Map Panel */}
          <div className="lg:col-span-1">
            <div className="map-wrapper">
              <div className="map-header">
                <h3 className="text-xl font-bold text-gray-900">Interactive Map</h3>
                <p className="text-gray-600 mt-1">
                  Click on markers to see center details and get directions
                </p>
              </div>
              
              <div className="map-content">
                <MapPanel
                  services={services}
                  selected={selectedService}
                  onSelect={(service, distance, duration) => handleServiceSelect(service, distance, duration)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Selected Service Details */}
        {selectedService && (
          <div className="mt-8">
            <div className="card">
              <div className="card-header">
                <h3 className="text-xl font-bold text-gray-900">Selected Center Details</h3>
                <button
                  onClick={() => setSelectedService(null)}
                  className="btn btn-secondary"
                >
                  Close
                </button>
              </div>
              
              <div className="card-body">
                <div className="service-card">
                  <div className="service-header">
                    <div className="service-info">
                      <h4 className="service-name">{selectedService.name}</h4>
                      <div className="service-meta">
                        <span className="service-district">{selectedService.district}</span>
                        {selectedService.rating && (
                          <span className="service-rating">
                            <svg className="rating-star" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            <span className="rating-text">{selectedService.rating}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {selectedService.address && (
                    <div className="service-address">
                      <svg className="address-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>{selectedService.address}</span>
                    </div>
                  )}
                  
                  <div className="service-details">
                    {selectedService.phone && (
                      <div className="service-detail-item">
                        <svg className="detail-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        <span>{selectedService.phone}</span>
                      </div>
                    )}
                    
                    {selectedService.services && (
                      <div className="service-detail-item">
                        <svg className="detail-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a1 1 0 01-1.415-1.414l.158-.316a6 6 0 00.517-3.86l-.477-2.387a2 2 0 00-.547-1.022.146.146 0 01.054-.054A2 2 0 0112 2a2 2 0 01.054.054.146.146 0 01.054.054z" />
                        </svg>
                        <span>{selectedService.services}</span>
                      </div>
                    )}
                    
                    {selectedService.hours && (
                      <div className="service-detail-item">
                        <svg className="detail-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{selectedService.hours}</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Route Information Display */}
                  {routeDistance && (
                    <div className="service-actions" style={{ marginTop: "20px", paddingTop: "20px", borderTop: "1px solid #e5e7eb" }}>
                      <div style={{
                        padding: "16px",
                        background: "linear-gradient(135deg, #EFF6FF 0%, #F3E8FF 100%)",
                        borderRadius: "12px",
                        border: "1px solid #E0E7FF",
                        textAlign: "center"
                      }}>
                        <div style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "12px",
                          fontSize: "18px",
                          fontWeight: "600",
                          color: "#1E40AF",
                          marginBottom: "8px"
                        }}>
                          📏 Distance: <span style={{ color: "#7C3AED" }}>{routeDistance} km</span>
                        </div>
                        <div style={{
                          fontSize: "14px",
                          color: "#6B7280"
                        }}>
                          Route automatically calculated and displayed on map
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
