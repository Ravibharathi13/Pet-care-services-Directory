import { useState, useRef, useEffect } from "react";

export default function DistrictChips({ selectedDistrict, onDistrictChange, inCard = true }) {
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
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [filteredDistricts, setFilteredDistricts] = useState(districts);
  const searchRef = useRef(null);
  const dropdownRef = useRef(null);

  // Filter districts based on search query
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredDistricts(districts);
    } else {
      const filtered = districts.filter(district =>
        district.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredDistricts(filtered);
    }
  }, [searchQuery]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleDistrictSelect = (district) => {
    onDistrictChange(district);
    setSearchQuery("");
    setIsOpen(false);
  };

  const handleInputFocus = () => {
    setIsOpen(true);
  };

  const handleInputChange = (e) => {
    setSearchQuery(e.target.value);
    setIsOpen(true);
  };

  const content = (
    <>
      <div className="search-card-header">
        <div className="search-title">Find centers by district</div>
        <div className="search-subtitle">Type to search or pick a quick chip</div>
      </div>

      <div className="district-search-container">
        <div className="district-search-input-wrapper">
          <span className="search-icon" aria-hidden>🔎</span>
          <input
            ref={searchRef}
            type="text"
            placeholder={`🔍 Search districts... (Current: ${selectedDistrict})`}
            value={searchQuery}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            className="district-search-input"
          />
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="district-dropdown-toggle"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              style={{
                transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s ease'
              }}
            >
              <polyline points="6,9 12,15 18,9"></polyline>
            </svg>
          </button>
        </div>

        {isOpen && (
          <div className="district-dropdown">
            {filteredDistricts.length > 0 ? (
              filteredDistricts.map((district) => (
                <button
                  key={district}
                  onClick={() => handleDistrictSelect(district)}
                  className={`district-dropdown-item ${
                    selectedDistrict === district ? 'active' : ''
                  }`}
                >
                  <span className="district-name">{district}</span>
                  {selectedDistrict === district && (
                    <span className="district-selected-icon">✓</span>
                  )}
                </button>
              ))
            ) : (
              <div className="district-no-results">
                No districts found for "{searchQuery}"
              </div>
            )}
          </div>
        )}
      </div>

      {/* Show current selection as a chip */}
      <div className="current-district-chip">
        <span className="district-chip active">
          📍 {selectedDistrict}
        </span>
      </div>

      {/* Quick select chips */}
      <div className="quick-chips">
        {['Coimbatore','Erode','Tiruppur','Salem','Namakkal','Dharmapuri','Karur'].map((d) => (
          <button
            key={d}
            type="button"
            className={`quick-chip ${selectedDistrict === d ? 'active' : ''}`}
            onClick={() => handleDistrictSelect(d)}
          >
            {selectedDistrict === d ? '✨ ' : ''}{d}
          </button>
        ))}
      </div>
    </>
  );

  return (
    <div className="district-selector" ref={dropdownRef}>
      {inCard ? (
        <div className="search-card gradient-card">{content}</div>
      ) : (
        content
      )}
    </div>
  );
}
