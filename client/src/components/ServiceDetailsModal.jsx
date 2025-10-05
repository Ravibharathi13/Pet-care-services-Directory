import { useEffect } from "react";

export default function ServiceDetailsModal({ service, onClose }) {
  useEffect(() => {
    const onEsc = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onEsc);
    return () => document.removeEventListener('keydown', onEsc);
  }, [onClose]);

  if (!service) return null;

  const details = Array.isArray(service.serviceDetails) ? service.serviceDetails : [];

  // Basic pricing catalog used when explicit serviceDetails are missing
  const pricingCatalog = [
    { key: 'vaccination', price: 500, unit: 'dose' },
    { key: 'groom', price: 800, unit: 'session' },
    { key: 'consult', price: 300, unit: 'visit' },
    { key: 'deworm', price: 400, unit: 'dose' },
    { key: 'dental', price: 1200, unit: 'session' },
    { key: 'x-ray', price: 800, unit: 'scan' },
    { key: 'ultrasound', price: 1200, unit: 'scan' },
    { key: 'surgery', price: 3000, unit: 'procedure' },
    { key: 'emergency', price: 1000, unit: 'visit' },
    { key: 'boarding', price: 700, unit: 'day' },
    { key: 'training', price: 600, unit: 'session' },
    { key: 'microchip', price: 1000, unit: 'procedure' }
  ];

  // Fallback parsing for legacy `services` string
  let fallbackItems = [];
  if ((!details || details.length === 0) && typeof service.services === 'string') {
    fallbackItems = service.services
      .split(/[;,|]/)
      .map(s => s.trim())
      .filter(Boolean)
      .map(name => {
        const lower = name.toLowerCase();
        const match = pricingCatalog.find(p => lower.includes(p.key));
        return match ? { name, price: match.price, currency: 'INR', unit: match.unit } : { name, price: null };
      });
  }

  return (
    <div className="modal-backdrop" style={backdropStyle} onClick={onClose}>
      <div className="modal-card" style={cardStyle} onClick={(e) => e.stopPropagation()}>
        <div style={headerStyle}>
          <h3 style={{ margin: 0 }}>Services & Pricing</h3>
          <button style={closeBtnStyle} onClick={onClose}>✕</button>
        </div>
        <div style={bodyStyle}>
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontWeight: 600, fontSize: 18 }}>{service.name}</div>
            <div style={{ color: '#6B7280', fontSize: 13 }}>{service.address}</div>
          </div>

          {details && details.length > 0 ? (
            <ul style={listStyle}>
              {details.map((item, idx) => (
                <li key={idx} style={rowStyle}>
                  <span>{item.name}</span>
                  <span style={{ fontWeight: 600 }}>
                    {item.price != null ? `${item.currency || 'INR'} ${item.price}` : '—'}
                    {item.unit ? ` / ${item.unit}` : ''}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <div>
              {fallbackItems.length > 0 ? (
                <>
                  <div style={{ marginBottom: 8, color: '#6B7280' }}>Estimated pricing shown for common services:</div>
                  <ul style={listStyle}>
                    {fallbackItems.map((it, i) => (
                      <li key={i} style={rowStyle}>
                        <span>{it.name}</span>
                        <span style={{ fontWeight: 600 }}>
                          {it.price != null ? `${it.currency || 'INR'} ${it.price}${it.unit ? ` / ${it.unit}` : ''}` : 'Contact clinic'}
                        </span>
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <div style={{ color: '#6B7280' }}>No service information available.</div>
              )}
            </div>
          )}
        </div>
        <div style={footerStyle}>
          <button style={primaryBtnStyle} onClick={onClose}>Close</button>
          {service.phone && (
            <a href={`tel:${service.phone.replace(/[^+\d]/g, '')}`} style={secondaryBtnStyle}>Call Clinic</a>
          )}
        </div>
      </div>
    </div>
  );
}

const backdropStyle = {
  position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)',
  display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
};
const cardStyle = {
  width: 'min(600px, 92vw)', background: 'white', borderRadius: 12,
  boxShadow: '0 10px 30px rgba(0,0,0,0.2)', overflow: 'hidden'
};
const headerStyle = {
  padding: '14px 16px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
};
const bodyStyle = { padding: 16, maxHeight: 420, overflowY: 'auto' };
const footerStyle = { padding: 16, borderTop: '1px solid #e5e7eb', display: 'flex', gap: 10, justifyContent: 'flex-end' };
const closeBtnStyle = { background: 'transparent', border: 'none', fontSize: 18, cursor: 'pointer' };
const listStyle = { listStyle: 'none', margin: 0, padding: 0 };
const rowStyle = { display: 'flex', justifyContent: 'space-between', padding: '10px 12px', border: '1px solid #F3F4F6', borderRadius: 8, marginBottom: 8, background: '#FAFAFB' };
const pillListStyle = { listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexWrap: 'wrap', gap: 8 };
const pillStyle = { padding: '6px 10px', background: '#F3F4F6', borderRadius: 999, fontSize: 12 };
const primaryBtnStyle = { padding: '10px 14px', background: '#3B82F6', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 };
const secondaryBtnStyle = { padding: '10px 14px', background: '#111827', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, textDecoration: 'none' };
