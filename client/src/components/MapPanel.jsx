import { MapContainer, TileLayer, Marker, Popup, Polyline, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useState, useRef } from "react";

// Fix for default markers in Vite
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Custom icons with clear visual distinction
const userLocationIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTYiIGN5PSIxNiIgcj0iMTQiIGZpbGw9IiMxMEI5ODEiIHN0cm9rZT0iI0ZGRkZGRiIgc3Ryb2tlLXdpZHRoPSI0Ii8+CjxjaXJjbGUgY3g9IjE2IiBjeT0iMTYiIHI9IjYiIGZpbGw9IiNGRkZGRkYiLz4KPC9zdmc+',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16]
});

const searchMarkerIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iNDIiIHZpZXdCb3g9IjAgMCAzMiA0MiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTE2IDQyTDI2IDI2SDE2VjE2SDE2VjI2SDZMMTYgNDJaIiBmaWxsPSIjOEI1Q0Y2Ii8+CjxjaXJjbGUgY3g9IjE2IiBjeT0iMTYiIHI9IjE0IiBmaWxsPSIjOEI1Q0Y2IiBzdHJva2U9IiNGRkZGRkYiIHN0cm9rZS13aWR0aD0iMyIvPgo8cGF0aCBkPSJNMTYgOEMxMy4yMzg2IDggMTEgMTAuMjM4NiAxMSAxM0MxMSAxNS43NjE0IDEzLjIzODYgMTggMTYgMThDMTguNzYxNCAxOCAyMSAxNS43NjE0IDIxIDEzQzIxIDEwLjIzODYgMTguNzYxNCA4IDE2IDhaIiBmaWxsPSIjRkZGRkZGIi8+Cjwvc3ZnPg==',
  iconSize: [32, 42],
  iconAnchor: [16, 42],
  popupAnchor: [0, -42]
});

const petCenterIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzYiIGhlaWdodD0iNDYiIHZpZXdCb3g9IjAgMCAzNiA0NiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTE4IDQ2TDMwIDI4SDE4VjE4SDE4VjI4SDZMMTggNDZaIiBmaWxsPSIjRUY0NDQ0Ii8+CjxjaXJjbGUgY3g9IjE4IiBjeT0iMTgiIHI9IjE2IiBmaWxsPSIjRUY0NDQ0IiBzdHJva2U9IiNGRkZGRkYiIHN0cm9rZS13aWR0aD0iNCIvPgo8cGF0aCBkPSJNMTggOEMxNS4yMzg2IDggMTMgMTAuMjM4NiAxMyAxM0MxMyAxNS43NjE0IDE1LjIzODYgMTggMTggMThDMjAuNzYxNCAxOCAyMyAxNS43NjE0IDIzIDEzQzIzIDEwLjIzODYgMjAuNzYxNCA4IDE4IDhaIiBmaWxsPSIjRkZGRkZGIi8+CjxwYXRoIGQ9Ik0xOCAyMkMxNi4zNDMxIDIyIDE1IDIzLjM0MzEgMTUgMjVDMTUgMjYuNjU2OSAxNi4zNDMxIDI4IDE4IDI4QzE5LjY1NjkgMjggMjEgMjYuNjU2OSAyMSAyNUMyMSAyMy4zNDMxIDE5LjY1NjkgMjIgMTggMjJaIiBmaWxsPSIjRkZGRkZGIi8+Cjwvc3ZnPg==',
  iconSize: [36, 46],
  iconAnchor: [18, 46],
  popupAnchor: [0, -46]
});

const selectedCenterIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNTAiIHZpZXdCb3g9IjAgMCA0MCA1MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTIwIDUwTDMzIDMwSDIwVjIwSDIwVjMwSDdMMjAgNTBaIiBmaWxsPSIjRkY5NTAwIi8+CjxjaXJjbGUgY3g9IjIwIiBjeT0iMjAiIHI9IjE4IiBmaWxsPSIjRkY5NTAwIiBzdHJva2U9IiNGRkZGRkYiIHN0cm9rZS13aWR0aD0iNCIvPgo8cGF0aCBkPSJNMjAgOEMxNi42ODYzIDggMTQgMTAuNjg2MyAxNCAxNEMxNCAxNy4zMTM3IDE2LjY4NjMgMjAgMjAgMjBDMjMuMzEzNyAyMCAyNiAxNy4zMTM3IDI2IDE0QzI2IDEwLjY4NjMgMjMuMzEzNyA4IDIwIDhaIiBmaWxsPSIjRkZGRkZGIi8+CjxwYXRoIGQ9Ik0yMCAyNEMxOC4zNDMxIDI0IDE3IDI1LjM0MzEgMTcgMjdDMTcgMjguNjU2OSAxOC4zNDMxIDMwIDIwIDMwQzIxLjY1NjkgMzAgMjMgMjguNjU2OSAyMyAyN0MyMyAyNS4zNDMxIDIxLjY1NjkgMjQgMjAgMjRaIiBmaWxsPSIjRkZGRkZGIi8+Cjwvc3ZnPg==',
  iconSize: [40, 50],
  iconAnchor: [20, 50],
  popupAnchor: [0, -50]
});

// Emergency vet icon
const emergencyVetIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNTAiIHZpZXdCb3g9IjAgMCA0MCA1MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTIwIDUwTDMzIDMwSDIwVjIwSDIwVjMwSDdMMjAgNTBaIiBmaWxsPSIjREMxOTE3Ii8+CjxjaXJjbGUgY3g9IjIwIiBjeT0iMjAiIHI9IjE4IiBmaWxsPSIjREMxOTE3IiBzdHJva2U9IiNGRkZGRkYiIHN0cm9rZS13aWR0aD0iNCIvPgo8cGF0aCBkPSJNMjAgOEMxNi42ODYzIDggMTQgMTAuNjg2MyAxNCAxNEMxNCAxNy4zMTM3IDE2LjY4NjMgMjAgMjAgMjBDMjMuMzEzNyAyMCAyNiAxNy4zMTM3IDI2IDE0QzI2IDEwLjY4NjMgMjMuMzEzNyA4IDIwIDhaIiBmaWxsPSIjRkZGRkZGIi8+CjxwYXRoIGQ9Ik0xNiAxNkgxOFYxOEgyMlYxNkgyNFYxMkgyMlYxMEgxOFYxMkgxNlYxNloiIGZpbGw9IiNEQzE5MTciLz4KPC9zdmc+',
  iconSize: [40, 50],
  iconAnchor: [20, 50],
  popupAnchor: [0, -50]
});

export default function MapPanel({ services = [], selected, onSelect }) {
  const [userLocation, setUserLocation] = useState(null);
  const [mapCenter, setMapCenter] = useState([11.1271, 78.6569]); // Tamil Nadu center
  const [mapZoom, setMapZoom] = useState(8);
  const [routeCoords, setRouteCoords] = useState([]);
  const [routeDistance, setRouteDistance] = useState(null);
  const [routeDuration, setRouteDuration] = useState(null);
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);
  const [locationStatus, setLocationStatus] = useState('Getting your location...');
  const [locationAccuracy, setLocationAccuracy] = useState(null);
  const [isGettingQuickLocation, setIsGettingQuickLocation] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchMarker, setSearchMarker] = useState(null);
  const [emergencyMode, setEmergencyMode] = useState(false);
  const mapRef = useRef(null);
  const searchTimeoutRef = useRef(null);
  const routeControllerRef = useRef(null); // abort controller for in-flight route requests
  const lastRouteRef = useRef({ start: null, end: null }); // cache last computed route endpoints

  // Component to handle map clicks for manual location setting
  function LocationSetter() {
    useMapEvents({
      click(e) {
        if (userLocation && locationAccuracy > 1000) {
          const clickedLocation = {
            lat: e.latlng.lat,
            lng: e.latlng.lng,
            accuracy: 10, // Very accurate since manually set
            manual: true,
            timestamp: Date.now()
          };
          
          console.log('Manual location set:', clickedLocation);
          setUserLocation(clickedLocation);
          setLocationAccuracy(10);
          setLocationStatus('✅ Location set manually - Very accurate!');
          
          // Center map on clicked location
          setMapCenter([clickedLocation.lat, clickedLocation.lng]);
          setMapZoom(16);
        }
        // Hide search results when clicking on map
        setShowSearchResults(false);
      }
    });
    return null;
  }

  // Search for places using Nominatim API
  const searchPlaces = async (query) => {
    if (!query || query.length < 3) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    setIsSearching(true);
    
    try {
      // Use Nominatim API for place search with bias towards India
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=in&limit=8&addressdetails=1&extratags=1`,
        {
          headers: {
            'User-Agent': 'PetServiceApp/1.0'
          }
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        const formattedResults = data.map(place => ({
          id: place.place_id,
          name: place.display_name,
          lat: parseFloat(place.lat),
          lng: parseFloat(place.lon),
          type: place.type,
          importance: place.importance || 0
        }));
        
        setSearchResults(formattedResults);
        setShowSearchResults(formattedResults.length > 0);
      }
    } catch (error) {
      console.error('Search failed:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Filter services for emergency mode
  const getFilteredServices = () => {
    if (!emergencyMode) return services;
    
    // Filter for 24/7 vet hospitals - check for keywords indicating emergency/24-hour service
    return services.filter(service => {
      const name = service.name?.toLowerCase() || '';
      const description = service.description?.toLowerCase() || '';
      const serviceType = service.serviceType?.toLowerCase() || '';
      
      // Look for emergency/24-hour indicators
      const emergencyKeywords = ['24', 'emergency', 'urgent', 'hospital', 'veterinary hospital', '24/7', '24 hours', 'round the clock'];
      const text = `${name} ${description} ${serviceType}`;
      
      return emergencyKeywords.some(keyword => text.includes(keyword));
    });
  };

  // Emergency call function
  const makeEmergencyCall = (phoneNumber) => {
    if (phoneNumber) {
      // Remove any non-numeric characters except +
      const cleanNumber = phoneNumber.replace(/[^+\d]/g, '');
      window.location.href = `tel:${cleanNumber}`;
    }
  };

  // Handle search input change with debouncing
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    // Debounce search by 500ms
    searchTimeoutRef.current = setTimeout(() => {
      searchPlaces(query);
    }, 500);
  };

  // Handle search result selection
  const handleSearchResultSelect = (result) => {
    console.log('Selected search result:', result);
    
    // Set search marker
    setSearchMarker({
      lat: result.lat,
      lng: result.lng,
      name: result.name
    });
    
    // Center map on selected location
    setMapCenter([result.lat, result.lng]);
    setMapZoom(15);
    
    // Clear search
    setSearchQuery('');
    setSearchResults([]);
    setShowSearchResults(false);
  };

  // Clear search results when clicking outside
  const handleSearchBlur = () => {
    setTimeout(() => {
      setShowSearchResults(false);
    }, 200); // Delay to allow result click
  };

  // Quick location options for Tamil Nadu
  const quickLocations = [
    { name: 'Erode', lat: 11.3410, lng: 77.7172, zoom: 13 },
    { name: 'Coimbatore', lat: 11.0168, lng: 76.9558, zoom: 13 },
    { name: 'Tiruppur', lat: 11.1085, lng: 77.3411, zoom: 13 },
    { name: 'Salem', lat: 11.6643, lng: 78.1460, zoom: 13 },
    { name: 'Namakkal', lat: 11.2189, lng: 78.1677, zoom: 13 },
    { name: 'Dharmapuri', lat: 12.1211, lng: 78.1583, zoom: 13 },
    { name: 'Karur', lat: 10.9601, lng: 78.0766, zoom: 13 },
    { name: 'Chennai', lat: 13.0827, lng: 80.2707, zoom: 13 },
    { name: 'Madurai', lat: 9.9252, lng: 78.1198, zoom: 13 }
  ];

  // Get user's precise location with improved error handling
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationStatus('Geolocation not supported. Please select your city manually.');
      return;
    }

    // Check if location permission is already denied
    navigator.permissions?.query({name: 'geolocation'}).then((result) => {
      if (result.state === 'denied') {
        setLocationStatus('Location access denied. Please enable location in browser settings or select your city manually.');
        return;
      }
    }).catch(() => {
      // Permissions API not supported, continue with location request
    });

    setLocationStatus('Getting your location...');

    let attempts = 0;
    const maxAttempts = 3; // Reduced for faster fallback
    let bestLocation = null;
    let watchId = null;

    const tryGetLocation = () => {
      attempts++;
      console.log(`Location attempt ${attempts}/${maxAttempts}`);

      // Progressive timeout - start with shorter timeout, increase if needed
      const timeout = attempts === 1 ? 5000 : attempts === 2 ? 10000 : 15000;
      
      const options = {
        enableHighAccuracy: attempts <= 2, // Use high accuracy for first 2 attempts
        timeout: timeout,
        maximumAge: attempts === 1 ? 0 : 60000 // Allow cached location after first attempt
      };

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: Date.now()
          };

          console.log(`Attempt ${attempts} - Location:`, location, `Accuracy: ±${Math.round(location.accuracy)}m`);

          // Validate coordinates are reasonable for India
          if (location.lat < 6 || location.lat > 38 || location.lng < 68 || location.lng > 98) {
            console.warn('Location seems outside India:', location);
            setLocationStatus('Location detected outside expected region. Please select your city manually.');
            return;
          }

          // Keep the most accurate location
          if (!bestLocation || location.accuracy < bestLocation.accuracy) {
            bestLocation = location;
            console.log('New best location:', bestLocation);
          }

          // Use location if accuracy is good enough or we've tried enough
          if (location.accuracy <= 100 || attempts >= maxAttempts) {
            console.log('Using final location:', bestLocation);
            setUserLocation(bestLocation);
            setLocationAccuracy(Math.round(bestLocation.accuracy));
            setMapCenter([bestLocation.lat, bestLocation.lng]);
            setMapZoom(bestLocation.accuracy <= 100 ? 16 : bestLocation.accuracy <= 1000 ? 14 : 12);

            if (bestLocation.accuracy <= 50) {
              setLocationStatus('✅ Excellent GPS accuracy');
            } else if (bestLocation.accuracy <= 100) {
              setLocationStatus(`✅ Good GPS (±${Math.round(bestLocation.accuracy)}m)`);
            } else if (bestLocation.accuracy <= 1000) {
              setLocationStatus(`⚠️ Fair GPS (±${Math.round(bestLocation.accuracy)}m)`);
            } else {
              setLocationStatus(`❌ Poor GPS (±${Math.round(bestLocation.accuracy/1000).toFixed(1)}km) - Try "Get Better Location"`);
            }
            return;
          }

          // Try again for better accuracy
          if (attempts < maxAttempts) {
            setLocationStatus(`Improving accuracy... (${attempts}/${maxAttempts})`);
            setTimeout(tryGetLocation, 1500);
          }
        },
        (error) => {
          console.error(`Location attempt ${attempts} failed:`, error);
          
          // Handle specific error types
          let errorMessage = 'Location failed.';
          switch(error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location access denied. Please enable location in browser settings.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location unavailable. Check your internet connection.';
              break;
            case error.TIMEOUT:
              errorMessage = `Location timeout (attempt ${attempts}/${maxAttempts})`;
              break;
          }

          if (attempts >= maxAttempts) {
            if (bestLocation) {
              // Use the best location we got
              console.log('Using best available location:', bestLocation);
              setUserLocation(bestLocation);
              setLocationAccuracy(Math.round(bestLocation.accuracy));
              setMapCenter([bestLocation.lat, bestLocation.lng]);
              setMapZoom(bestLocation.accuracy <= 1000 ? 14 : 12);
              setLocationStatus(`⚠️ Best available (±${Math.round(bestLocation.accuracy)}m)`);
            } else {
              setLocationStatus(errorMessage + ' Please select your city manually.');
            }
          } else {
            setLocationStatus(errorMessage + ` Retrying...`);
            // Try again with different settings
            setTimeout(tryGetLocation, 2000);
          }
        },
        options
      );
    };

    // Start location attempts
    tryGetLocation();

    // Cleanup function
    return () => {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, []);

  // Enhanced location function with better accuracy and user guidance
  const getQuickLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus('Geolocation not supported');
      return;
    }

    setIsGettingQuickLocation(true);
    setLocationStatus('🎯 Getting precise location... Please wait up to 30 seconds');

    // Use watchPosition for continuous updates until we get good accuracy
    let watchId;
    let bestLocation = null;
    let attempts = 0;
    const maxWatchTime = 25000; // 25 seconds max
    
    const startTime = Date.now();
    
    const options = {
      enableHighAccuracy: true,
      timeout: 8000,
      maximumAge: 0
    };

    watchId = navigator.geolocation.watchPosition(
      (position) => {
        attempts++;
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: Date.now()
        };

        console.log(`Watch attempt ${attempts} - Location:`, location, `Accuracy: ±${Math.round(location.accuracy)}m`);

        // Validate coordinates
        if (location.lat < 6 || location.lat > 38 || location.lng < 68 || location.lng > 98) {
          console.warn('Location outside expected region:', location);
          return;
        }

        // Keep the most accurate location
        if (!bestLocation || location.accuracy < bestLocation.accuracy) {
          bestLocation = location;
          setLocationStatus(`🎯 Improving... Best accuracy: ±${Math.round(bestLocation.accuracy)}m`);
        }

        // Stop if we get excellent accuracy or time runs out
        const elapsed = Date.now() - startTime;
        if (location.accuracy <= 30 || elapsed > maxWatchTime) {
          navigator.geolocation.clearWatch(watchId);
          
          const finalLocation = bestLocation || location;
          console.log('Final location selected:', finalLocation);
          
          setUserLocation(finalLocation);
          setLocationAccuracy(Math.round(finalLocation.accuracy));
          setMapCenter([finalLocation.lat, finalLocation.lng]);
          setMapZoom(finalLocation.accuracy <= 50 ? 17 : finalLocation.accuracy <= 200 ? 15 : 13);

          if (finalLocation.accuracy <= 30) {
            setLocationStatus('✅ Excellent GPS accuracy!');
          } else if (finalLocation.accuracy <= 100) {
            setLocationStatus(`✅ Very good GPS (±${Math.round(finalLocation.accuracy)}m)`);
          } else if (finalLocation.accuracy <= 500) {
            setLocationStatus(`✅ Good GPS (±${Math.round(finalLocation.accuracy)}m)`);
          } else if (finalLocation.accuracy <= 2000) {
            setLocationStatus(`⚠️ Fair GPS (±${Math.round(finalLocation.accuracy)}m)`);
          } else {
            setLocationStatus(`❌ Poor GPS (±${Math.round(finalLocation.accuracy/1000).toFixed(1)}km) - Consider manual selection`);
          }
          
          setIsGettingQuickLocation(false);
        }
      },
      (error) => {
        console.error('Watch location failed:', error);
        if (watchId) {
          navigator.geolocation.clearWatch(watchId);
        }
        
        if (bestLocation) {
          // Use best location we managed to get
          setUserLocation(bestLocation);
          setLocationAccuracy(Math.round(bestLocation.accuracy));
          setMapCenter([bestLocation.lat, bestLocation.lng]);
          setMapZoom(bestLocation.accuracy <= 200 ? 15 : 13);
          setLocationStatus(`⚠️ Used best available (±${Math.round(bestLocation.accuracy)}m)`);
        } else {
          let errorMsg = 'Location failed. ';
          switch(error.code) {
            case error.PERMISSION_DENIED:
              errorMsg += 'Please enable location access in browser settings.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMsg += 'GPS unavailable. Try moving to an open area.';
              break;
            case error.TIMEOUT:
              errorMsg += 'GPS timeout. Try again or select city manually.';
              break;
          }
          setLocationStatus(errorMsg);
        }
        
        setIsGettingQuickLocation(false);
      },
      options
    );

    // Safety timeout to stop watching after max time
    setTimeout(() => {
      if (watchId && isGettingQuickLocation) {
        navigator.geolocation.clearWatch(watchId);
        if (bestLocation) {
          setUserLocation(bestLocation);
          setLocationAccuracy(Math.round(bestLocation.accuracy));
          setMapCenter([bestLocation.lat, bestLocation.lng]);
          setMapZoom(bestLocation.accuracy <= 200 ? 15 : 13);
          setLocationStatus(`⏰ Timeout - Used best available (±${Math.round(bestLocation.accuracy)}m)`);
        } else {
          setLocationStatus('⏰ Location timeout. Please select your city manually.');
        }
        setIsGettingQuickLocation(false);
      }
    }, maxWatchTime);
  };

  // Calculate accurate route when service is selected
  useEffect(() => {
    if (selected && userLocation) {
      const destination = {
        lat: parseFloat(selected.latitude ?? selected.lat),
        lng: parseFloat(selected.longitude ?? selected.lng)
      };

      if (!Number.isNaN(destination.lat) && !Number.isNaN(destination.lng)) {
        calculateAccurateRoute(userLocation, destination);
      }
    } else {
      clearRoute();
    }
  }, [selected, userLocation]);

  // Calculate route using OSRM for accurate road-based routing
  const calculateAccurateRoute = async (start, end) => {
    if (!start?.lat || !start?.lng || !end?.lat || !end?.lng) {
      console.error('Invalid coordinates for route calculation');
      return;
    }

    // Validate coordinates are reasonable
    if (Math.abs(start.lat) > 90 || Math.abs(start.lng) > 180 ||
        Math.abs(end.lat) > 90 || Math.abs(end.lng) > 180) {
      console.error('Invalid coordinate ranges');
      return;
    }

    // Avoid redundant recalculations for the same endpoints within small deltas
    const round6 = (n) => Math.round(n * 1e6) / 1e6;
    const normStart = { lat: round6(start.lat), lng: round6(start.lng) };
    const normEnd = { lat: round6(end.lat), lng: round6(end.lng) };
    if (
      lastRouteRef.current.start &&
      lastRouteRef.current.end &&
      lastRouteRef.current.start.lat === normStart.lat &&
      lastRouteRef.current.start.lng === normStart.lng &&
      lastRouteRef.current.end.lat === normEnd.lat &&
      lastRouteRef.current.end.lng === normEnd.lng
    ) {
      console.log('Skipping route recalculation (same endpoints)');
      return;
    }

    // Cancel any in-flight route request
    if (routeControllerRef.current) {
      try { routeControllerRef.current.abort(); } catch (e) {}
    }

    setIsCalculatingRoute(true);
    console.log('🚗 Calculating accurate route from:',
      `${start.lat.toFixed(6)}, ${start.lng.toFixed(6)}`,
      'to:',
      `${end.lat.toFixed(6)}, ${end.lng.toFixed(6)}`
    );

    try {
      // Use OSRM routing service for real road routes with more options
      const url = `https://router.project-osrm.org/route/v1/driving/${start.lng.toFixed(6)},${start.lat.toFixed(6)};${end.lng.toFixed(6)},${end.lat.toFixed(6)}?overview=full&geometries=geojson&steps=true&alternatives=false`;

      const controller = new AbortController();
      routeControllerRef.current = controller;
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'PetServiceApp/1.0'
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`OSRM API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('OSRM Response:', data);

      if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        const coordinates = route.geometry.coordinates;
        const distance = (route.distance / 1000).toFixed(1); // Convert to km
        const duration = Math.round(route.duration / 60); // Convert to minutes

        console.log('✅ Real route calculated:', distance + 'km', duration + 'min', coordinates.length + ' points');

        // Convert [lng, lat] to [lat, lng] for Leaflet and validate
        const leafletCoords = coordinates
          .map(coord => [coord[1], coord[0]])
          .filter(coord =>
            coord[0] >= -90 && coord[0] <= 90 &&
            coord[1] >= -180 && coord[1] <= 180
          );

        if (leafletCoords.length > 1) {
          setRouteCoords(leafletCoords);
          setRouteDistance(distance);
          setRouteDuration(duration);

          // cache last successful endpoints
          lastRouteRef.current = { start: normStart, end: normEnd };

          // Notify parent component
          if (onSelect) {
            onSelect(selected, distance, duration);
          }

          console.log('✅ Route set successfully');
          return;
        } else {
          throw new Error('Invalid route coordinates received');
        }
      } else {
        throw new Error(`OSRM error: ${data.code} - ${data.message || 'No route found'}`);
      }
    } catch (error) {
      console.error('❌ Route calculation failed:', error.message);
      // Fallback to straight-line distance
      useStraightLineRoute(start, end);
    } finally {
      setIsCalculatingRoute(false);
      // clear controller reference
      routeControllerRef.current = null;
    }
  };

  // Fallback straight-line route calculation
  const useStraightLineRoute = (start, end) => {
    console.log('Using straight-line distance calculation');

    const R = 6371; // Earth's radius in kilometers
    const dLat = (end.lat - start.lat) * Math.PI / 180;
    const dLng = (end.lng - start.lng) * Math.PI / 180;

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(start.lat * Math.PI / 180) * Math.cos(end.lat * Math.PI / 180) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = (R * c).toFixed(1);
    const estimatedDuration = Math.round((parseFloat(distance) / 40) * 60); // Assume 40km/h average

    const straightLineCoords = [[start.lat, start.lng], [end.lat, end.lng]];

    setRouteCoords(straightLineCoords);
    setRouteDistance(distance);
    setRouteDuration(estimatedDuration);

    console.log('Straight-line route:', distance + 'km (estimated)');

    if (onSelect) {
      onSelect(selected, distance, estimatedDuration);
    }
  };

  // Clear route
  const clearRoute = () => {
    setRouteCoords([]);
    setRouteDistance(null);
    setRouteDuration(null);
    setIsCalculatingRoute(false);
  };

  // Set quick location
  const setQuickLocation = (location) => {
    const newLocation = {
      lat: location.lat,
      lng: location.lng,
      accuracy: 1000,
      manual: true
    };

    setUserLocation(newLocation);
    setLocationAccuracy(1000);
    setMapCenter([location.lat, location.lng]);
    setMapZoom(location.zoom);
    setLocationStatus(`Location set to ${location.name}`);

    console.log('Quick location set:', location.name, newLocation);
  };

  // Handle service marker click
  const handleServiceClick = (service) => {
    console.log('Service selected:', service.name);
    if (onSelect) {
      onSelect(service);
    }
  };

  return (
    <div style={{
      height: "500px",
      width: "100%",
      position: "relative",
      border: "2px solid #e5e7eb",
      borderRadius: "12px",
      overflow: "hidden",
      boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)"
    }}>
      {/* Emergency Mode Toggle */}
      <div style={{
        position: 'absolute',
        top: '15px',
        right: '15px',
        zIndex: 1000,
        display: 'flex',
        gap: '10px',
        alignItems: 'center'
      }}>
        <button
          onClick={() => setEmergencyMode(!emergencyMode)}
          style={{
            padding: '10px 16px',
            borderRadius: '8px',
            border: 'none',
            fontSize: '14px',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            background: emergencyMode 
              ? 'linear-gradient(135deg, #DC1917, #B91C1C)' 
              : 'rgba(255, 255, 255, 0.95)',
            color: emergencyMode ? 'white' : '#374151',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            backdropFilter: 'blur(10px)'
          }}
        >
          {emergencyMode ? '🚨 Emergency Mode ON' : '🏥 Emergency Mode'}
        </button>
        
        {emergencyMode && (
          <div style={{
            background: 'rgba(220, 25, 23, 0.95)',
            color: 'white',
            padding: '8px 12px',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: 'bold',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
          }}>
            🏥 Showing 24/7 Vets Only
          </div>
        )}
      </div>

      {/* Search Box */}
      <div style={{
        position: 'absolute',
        top: '15px',
        left: '15px',
        zIndex: 1000,
        width: '300px'
      }}>
        <div style={{ position: 'relative' }}>
          <input
            type="text"
            placeholder="🔍 Search places, cities, landmarks..."
            value={searchQuery}
            onChange={handleSearchChange}
            onFocus={(e) => {
              e.target.style.borderColor = '#3B82F6';
              e.target.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.2)';
              if (searchResults.length > 0) setShowSearchResults(true);
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#e5e7eb';
              e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
              handleSearchBlur();
            }}
            style={{
              width: '100%',
              padding: '12px 16px',
              border: '2px solid #e5e7eb',
              borderRadius: '10px',
              fontSize: '14px',
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
              outline: 'none',
              transition: 'all 0.2s ease'
            }}
          />
          
          {/* Loading indicator */}
          {isSearching && (
            <div style={{
              position: 'absolute',
              right: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '16px',
              height: '16px',
              border: '2px solid #e5e7eb',
              borderTop: '2px solid #3B82F6',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}></div>
          )}
        </div>
        
        {/* Search Results Dropdown */}
        {showSearchResults && searchResults.length > 0 && (
          <div style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            border: '2px solid #e5e7eb',
            borderTop: 'none',
            borderRadius: '0 0 10px 10px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            maxHeight: '300px',
            overflowY: 'auto',
            zIndex: 1001
          }}>
            {searchResults.map((result, index) => (
              <div
                key={result.id}
                onClick={() => handleSearchResultSelect(result)}
                style={{
                  padding: '12px 16px',
                  borderBottom: index < searchResults.length - 1 ? '1px solid #f3f4f6' : 'none',
                  cursor: 'pointer',
                  fontSize: '13px',
                  lineHeight: '1.4',
                  transition: 'background-color 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#f8fafc';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                }}
              >
                <div style={{ fontWeight: 'bold', color: '#374151', marginBottom: '2px' }}>
                  📍 {result.name.split(',')[0]}
                </div>
                <div style={{ color: '#6b7280', fontSize: '12px' }}>
                  {result.name}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        style={{ height: "100%", width: "100%" }}
        ref={mapRef}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />
        
        {/* Location setter component for manual location */}
        <LocationSetter />

        {/* User location marker - Green circle with white center */}
        {userLocation && (
          <Marker position={[userLocation.lat, userLocation.lng]} icon={userLocationIcon}>
            <Popup>
              <div style={{ textAlign: 'center', minWidth: '200px' }}>
                <h4 style={{ margin: '0 0 8px 0', color: '#10B981' }}>📍 Your Location</h4>
                <p style={{ margin: '4px 0', fontSize: '12px' }}>
                  Lat: {userLocation.lat.toFixed(6)}<br/>
                  Lng: {userLocation.lng.toFixed(6)}
                </p>
                {locationAccuracy && (
                  <p style={{
                    margin: '4px 0',
                    fontSize: '11px',
                    color: locationAccuracy <= 100 ? '#10B981' : locationAccuracy <= 500 ? '#F59E0B' : '#EF4444',
                    fontWeight: 'bold'
                  }}>
                    Accuracy: ±{locationAccuracy}m
                  </p>
                )}
              </div>
            </Popup>
          </Marker>
        )}

        {/* Search result marker - Purple pin */}
        {searchMarker && (
          <Marker position={[searchMarker.lat, searchMarker.lng]} icon={searchMarkerIcon}>
            <Popup>
              <div style={{ textAlign: 'center', minWidth: '200px' }}>
                <h4 style={{ margin: '0 0 8px 0', color: '#8B5CF6' }}>🔍 Search Result</h4>
                <p style={{ margin: '4px 0', fontSize: '13px', fontWeight: 'bold' }}>
                  {searchMarker.name.split(',')[0]}
                </p>
                <p style={{ margin: '4px 0', fontSize: '11px', color: '#666' }}>
                  {searchMarker.name}
                </p>
                <button
                  onClick={() => setSearchMarker(null)}
                  style={{
                    marginTop: '8px',
                    padding: '4px 8px',
                    background: '#f3f4f6',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    fontSize: '11px',
                    cursor: 'pointer'
                  }}
                >
                  Clear
                </button>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Route polyline - Blue line showing path */}
        {routeCoords.length > 0 && (
          <Polyline
            positions={routeCoords}
            pathOptions={{
              color: "#2563EB",
              weight: 6,
              opacity: 0.8,
              dashArray: routeCoords.length === 2 ? "15, 10" : null // Dashed for straight line
            }}
          />
        )}

        {/* Pet center markers - Red pins with animal icons */}
        {getFilteredServices().map((service) => {
          const lat = service.latitude ?? service.lat;
          const lng = service.longitude ?? service.lng;

          if (!lat || !lng) return null;

          const serviceId = service.id || service._id;
          const selectedId = selected && (selected.id || selected._id);
          const isSelected = selected && selectedId === serviceId;
          const isEmergencyService = emergencyMode;
          
          return (
            <Marker
              key={service.id}
              position={[parseFloat(service.latitude ?? service.lat), parseFloat(service.longitude ?? service.lng)]}
              icon={isSelected ? selectedCenterIcon : (isEmergencyService ? emergencyVetIcon : petCenterIcon)}
              eventHandlers={{
                click: () => handleServiceClick(service)
              }}
            >
              <Popup>
                <div style={{ minWidth: "250px", textAlign: 'center' }}>
                  <h4 style={{
                    margin: '0 0 12px 0',
                    color: isSelected ? '#FF9500' : '#EF4444',
                    fontSize: '16px'
                  }}>
                    🏥 {service.name}
                  </h4>

                  {service.address && (
                    <p style={{ margin: '6px 0', fontSize: '13px', color: '#666' }}>
                      📍 {service.address}
                    </p>
                  )}

                  {service.phone && (
                    <p style={{ margin: '6px 0', fontSize: '13px', color: '#666' }}>
                      📞 {service.phone}
                    </p>
                  )}

                  {service.services && (
                    <p style={{ margin: '6px 0', fontSize: '13px', color: '#666' }}>
                      🩺 {service.services}
                    </p>
                  )}

                  {service.rating && (
                    <p style={{ margin: '6px 0', fontSize: '13px', fontWeight: 'bold', color: '#F59E0B' }}>
                      ⭐ {service.rating}/5 Rating
                    </p>
                  )}

                  {/* Emergency Call Button - Only show in emergency mode */}
                  {emergencyMode && service.phone && (
                    <button
                      onClick={() => makeEmergencyCall(service.phone)}
                      style={{
                        width: '100%',
                        marginTop: '10px',
                        padding: '12px',
                        background: 'linear-gradient(135deg, #DC1917, #B91C1C)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        transition: 'all 0.2s ease',
                        boxShadow: '0 4px 12px rgba(220, 25, 23, 0.3)'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = 'scale(1.02)';
                        e.target.style.boxShadow = '0 6px 16px rgba(220, 25, 23, 0.4)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = 'scale(1)';
                        e.target.style.boxShadow = '0 4px 12px rgba(220, 25, 23, 0.3)';
                      }}
                    >
                      📞 EMERGENCY CALL: {service.phone}
                    </button>
                  )}

                  {isSelected && routeDistance && (
                    <div style={{
                      marginTop: '12px',
                      padding: '10px',
                      background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)',
                      borderRadius: '8px',
                      color: 'white'
                    }}>
                      <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '6px' }}>
                        🚗 Route Information
                      </div>
                      <div style={{ fontSize: '13px', marginBottom: '2px' }}>
                        📏 Distance: {routeDistance} km
                      </div>
                      {routeDuration && (
                        <div style={{ fontSize: '13px', marginBottom: '6px' }}>
                          ⏱️ Duration: {routeDuration} minutes
                        </div>
                      )}
                      <div style={{ fontSize: '11px', opacity: 0.9, marginBottom: '8px' }}>
                        {routeCoords.length === 2 ? '(Straight line estimate)' : '(Road route)'}
                      </div>
                      
                      {/* Navigation buttons */}
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        <button
                          onClick={() => {
                            const lat = service.latitude ?? service.lat;
                            const lng = service.longitude ?? service.lng;
                            const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;
                            window.open(url, '_blank');
                          }}
                          style={{
                            background: 'rgba(255, 255, 255, 0.2)',
                            border: '1px solid rgba(255, 255, 255, 0.3)',
                            color: 'white',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '10px',
                            fontWeight: 'bold',
                            flex: '1'
                          }}
                        >
                          📱 Google Maps
                        </button>
                        <button
                          onClick={() => {
                            const lat = service.latitude ?? service.lat;
                            const lng = service.longitude ?? service.lng;
                            const url = `https://waze.com/ul?ll=${lat}%2C${lng}&navigate=yes`;
                            window.open(url, '_blank');
                          }}
                          style={{
                            background: 'rgba(255, 255, 255, 0.2)',
                            border: '1px solid rgba(255, 255, 255, 0.3)',
                            color: 'white',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '10px',
                            fontWeight: 'bold',
                            flex: '1'
                          }}
                        >
                          🚗 Waze
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Route calculation status overlay */}
        {isCalculatingRoute && (
          <div style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'rgba(59, 130, 246, 0.95)',
            color: 'white',
            padding: '12px 16px',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 'bold',
            zIndex: 1000,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <div style={{
              width: '16px',
              height: '16px',
              border: '2px solid rgba(255, 255, 255, 0.3)',
              borderTop: '2px solid white',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}></div>
            🚗 Calculating route...
          </div>
        )}

        {/* Distance display overlay */}
        {routeDistance && !isCalculatingRoute && (
          <div style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'linear-gradient(135deg, #10B981, #059669)',
            color: 'white',
            padding: '12px 16px',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 'bold',
            zIndex: 1000,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
          }}>
            <div style={{ marginBottom: '2px' }}>📏 {routeDistance} km</div>
            {routeDuration && (
              <div style={{ fontSize: '12px', opacity: 0.9 }}>⏱️ {routeDuration} min</div>
            )}
          </div>
        )}
      </MapContainer>

      {/* Location status and quick selection */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '20px',
        background: userLocation ?
          'linear-gradient(135deg, #10B981, #059669)' :
          'linear-gradient(135deg, #F59E0B, #D97706)',
        color: 'white',
        padding: '12px 16px',
        borderRadius: '8px',
        fontSize: '13px',
        zIndex: 1000,
        maxWidth: '300px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
      }}>
        <div style={{ fontWeight: 'bold', marginBottom: '6px' }}>
          {userLocation ? '✅ Location Found' : '📍 Location Status'}
        </div>
        <div style={{ fontSize: '12px', marginBottom: '8px' }}>
          {locationStatus}
        </div>

        {/* Manual location picker for when GPS is poor */}
        {userLocation && locationAccuracy > 1000 && (
          <div style={{ 
            marginBottom: '8px',
            padding: '8px',
            background: 'rgba(255, 107, 107, 0.2)',
            borderRadius: '6px',
            border: '1px solid rgba(255, 107, 107, 0.4)'
          }}>
            <div style={{ fontSize: '11px', marginBottom: '4px', color: '#ffffff', fontWeight: 'bold' }}>
              🎯 GPS accuracy is poor! Click on the map to set your exact location:
            </div>
            <div style={{ fontSize: '10px', opacity: 0.9, color: '#ffffff' }}>
              1. Zoom in to your exact location
              2. Click precisely where you are
              3. Your location will be updated instantly
            </div>
          </div>
        )}

        {/* Quick location button for better accuracy */}
        {userLocation && locationAccuracy > 50 && (
          <button
            onClick={getQuickLocation}
            disabled={isGettingQuickLocation}
            style={{
              background: isGettingQuickLocation ? 'rgba(255, 255, 255, 0.3)' : 'rgba(59, 130, 246, 0.9)',
              border: '1px solid rgba(255, 255, 255, 0.4)',
              color: 'white',
              padding: '6px 12px',
              borderRadius: '6px',
              cursor: isGettingQuickLocation ? 'not-allowed' : 'pointer',
              fontSize: '11px',
              fontWeight: 'bold',
              marginBottom: '8px',
              width: '100%',
              opacity: isGettingQuickLocation ? 0.7 : 1
            }}
          >
            {isGettingQuickLocation ? '🔄 Getting Better Location...' : '🎯 Get Better Location'}
          </button>
        )}

        {!userLocation && (
          <div>
            <div style={{ fontSize: '11px', marginBottom: '6px', opacity: 0.9 }}>
              Quick select your city:
            </div>
            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
              {quickLocations.map(location => (
                <button
                  key={location.name}
                  onClick={() => setQuickLocation(location)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.25)',
                    border: '1px solid rgba(255, 255, 255, 0.4)',
                    color: 'white',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '10px',
                    fontWeight: 'bold'
                  }}
                >
                  {location.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* CSS for spinner animation */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}