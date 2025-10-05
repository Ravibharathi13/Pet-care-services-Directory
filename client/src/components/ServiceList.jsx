import { useMemo, useState } from "react";

export default function ServiceList({ items = [], onSelect }){
  const [openServiceId, setOpenServiceId] = useState(null);
  if (items.length === 0) {
    return (
      <div className="empty-container">
        <div className="empty-icon">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.47-.881-6.08-2.33" />
          </svg>
        </div>
        <div className="empty-title">No centers found</div>
        <div className="empty-description">No centers found for this district.</div>
      </div>
    );
  }

  return (
    <div className="service-list">
      {items.map(service => (
        <div 
          key={service._id ?? service.id} 
          className="service-card hover-lift"
          onClick={() => onSelect(service)}
        >
          <div className="service-header">
            <div className="service-info">
              <h4 className="service-name">{service.name}</h4>
              <div className="service-meta">
                {service.rating && (
                  <span className="service-rating">
                    <svg className="rating-star" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="rating-text">{service.rating}</span>
                  </span>
                )}
                <span className="service-district">{service.district}</span>
              </div>
            </div>
            <div className="service-actions-right">
              <button 
                className="btn btn-secondary"
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenServiceId(prev => (prev === (service._id ?? service.id) ? null : (service._id ?? service.id)));
                }}
              >
                View Services & Cost
              </button>
              <button 
                className="btn btn-primary"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect(service);
                }}
              >
                Get Route
              </button>
            </div>
          </div>
          {/* Inline services & cost panel */}
          {openServiceId === (service._id ?? service.id) && (
            <InlineServicePricing service={service} />
          )}
          
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
    </div>
  );
}

function InlineServicePricing({ service }) {
  // Prefer explicit serviceDetails; otherwise derive from services string similar to modal
  const items = useMemo(() => {
    const list = Array.isArray(service.serviceDetails) && service.serviceDetails.length > 0
      ? service.serviceDetails
      : deriveFromText(service.services);
    // Ensure at least some defaults
    return (list && list.length > 0) ? list : [
      { name: 'Consultation', price: 300, currency: 'INR', unit: 'visit' },
      { name: 'Vaccination', price: 500, currency: 'INR', unit: 'dose' }
    ];
  }, [service]);

  return (
    <div className="service-details-panel">
      <div className="service-details-panel-header">Services & Pricing</div>
      <ul className="service-details-list">
        {items.map((it, i) => (
          <li key={i} className="service-details-row">
            <span className="service-details-name">{it.name}</span>
            <span className="service-details-price">
              {it.price != null ? `${it.currency || 'INR'} ${it.price}` : 'Contact clinic'}
              {it.unit ? ` / ${it.unit}` : ''}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function deriveFromText(text) {
  if (!text || typeof text !== 'string') return [];
  const catalog = [
    { key: 'vaccination', name: 'Vaccination', price: 500, unit: 'dose' },
    { key: 'groom', name: 'Grooming', price: 800, unit: 'session' },
    { key: 'consult', name: 'Consultation', price: 300, unit: 'visit' },
    { key: 'checkup', name: 'Health Checkup', price: 400, unit: 'visit' },
    { key: 'deworm', name: 'Deworming', price: 400, unit: 'dose' },
    { key: 'dental', name: 'Dental Care', price: 1200, unit: 'session' },
    { key: 'x-ray', name: 'X-Ray', price: 800, unit: 'scan' },
    { key: 'ultrasound', name: 'Ultrasound', price: 1200, unit: 'scan' },
    { key: 'surgery', name: 'Surgery', price: 3000, unit: 'procedure' },
    { key: 'emergency', name: 'Emergency', price: 1000, unit: 'visit' },
    { key: 'boarding', name: 'Boarding', price: 700, unit: 'day' },
    { key: 'training', name: 'Training', price: 600, unit: 'session' },
    { key: 'microchip', name: 'Microchipping', price: 1000, unit: 'procedure' },
    { key: 'pharmacy', name: 'Pharmacy', price: 0 },
  ];
  const parts = text.split(/[;,|]/).map(s => s.trim()).filter(Boolean);
  const mapped = parts.map(p => {
    const lower = p.toLowerCase();
    const m = catalog.find(c => lower.includes(c.key));
    return m ? { name: m.name, price: m.price, currency: 'INR', unit: m.unit } : { name: p, price: null, currency: 'INR' };
  });
  // de-dupe
  const out = [];
  const seen = new Set();
  for (const it of mapped) {
    const k = (it.name || '').toLowerCase();
    if (!seen.has(k)) { seen.add(k); out.push(it); }
  }
  return out;
}
