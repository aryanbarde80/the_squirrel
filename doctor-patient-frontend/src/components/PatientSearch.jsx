import React, { useState, useEffect } from 'react';
import axios from 'axios';

const PatientSearch = () => {
  const [searchLocation, setSearchLocation] = useState('');
  const [doctors, setDoctors] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [map, setMap] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Load Google Maps
    const loadGoogleMaps = () => {
      if (window.google) {
        initializeMap();
        return;
      }
      
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = initializeMap;
      document.head.appendChild(script);
    };

    loadGoogleMaps();
    loadAllDoctors(); // Load all doctors initially
  }, []);

  const initializeMap = () => {
    const defaultCenter = { lat: 12.9716, lng: 77.5946 }; // Bangalore
    
    const mapInstance = new window.google.maps.Map(
      document.getElementById('patient-map'),
      {
        zoom: 12,
        center: defaultCenter,
        mapTypeControl: true,
        streetViewControl: false,
      }
    );

    setMap(mapInstance);

    // Add search box
    const searchInput = document.getElementById('location-search');
    const searchBox = new window.google.maps.places.SearchBox(searchInput);
    
    mapInstance.addListener('bounds_changed', () => {
      searchBox.setBounds(mapInstance.getBounds());
    });

    searchBox.addListener('places_changed', () => {
      const places = searchBox.getPlaces();
      if (places.length === 0) return;

      const place = places[0];
      if (!place.geometry || !place.geometry.location) return;

      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();

      mapInstance.setCenter({ lat, lng });
      mapInstance.setZoom(14);

      // Search for doctors near this location
      searchNearbyDoctors(lat, lng);
    });
  };

  const loadAllDoctors = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/doctors');
      setDoctors(response.data);
      displayDoctorsOnMap(response.data);
    } catch (error) {
      console.error('Error loading doctors:', error);
    }
  };

  const searchNearbyDoctors = async (lat, lng, radius = 10000) => {
    setIsLoading(true);
    setMessage('');
    
    try {
      const response = await axios.get('http://localhost:5000/api/doctors/near', {
        params: {
          latitude: lat,
          longitude: lng,
          maxDistance: radius
        }
      });

      setDoctors(response.data);
      displayDoctorsOnMap(response.data);
      
      if (response.data.length === 0) {
        setMessage('No doctors found within 10km of this location');
      } else {
        setMessage(`Found ${response.data.length} doctor(s) nearby`);
      }
    } catch (error) {
      setMessage('Error searching for doctors: ' + (error.response?.data?.error || error.message));
      setDoctors([]);
    } finally {
      setIsLoading(false);
    }
  };

  const displayDoctorsOnMap = (doctorsList) => {
    if (!map) return;

    // Clear existing markers
    markers.forEach(marker => marker.setMap(null));
    setMarkers([]);

    const newMarkers = [];
    const bounds = new window.google.maps.LatLngBounds();

    doctorsList.forEach((doctor, index) => {
      const [lng, lat] = doctor.location.coordinates;
      
      const marker = new window.google.maps.Marker({
        position: { lat, lng },
        map: map,
        title: `${doctor.name} - ${doctor.specialty}`,
        icon: {
          url: 'data:image/svg+xml;base64,' + btoa(`
            <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
              <circle cx="20" cy="20" r="18" fill="#4285F4" stroke="white" stroke-width="2"/>
              <text x="20" y="26" text-anchor="middle" fill="white" font-size="20">🏥</text>
            </svg>
          `),
          scaledSize: new window.google.maps.Size(40, 40)
        }
      });

      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="padding: 10px;">
            <h3 style="margin: 0 0 5px 0;">${doctor.name}</h3>
            <p style="margin: 0 0 5px 0;"><strong>Specialty:</strong> ${doctor.specialty}</p>
            <p style="margin: 0; font-size: 12px;">${doctor.address}</p>
          </div>
        `
      });

      marker.addListener('click', () => {
        // Close all other info windows
        newMarkers.forEach(m => {
          if (m.infoWindow) m.infoWindow.close();
        });
        infoWindow.open(map, marker);
      });

      marker.infoWindow = infoWindow;
      newMarkers.push(marker);
      bounds.extend({ lat, lng });
    });

    setMarkers(newMarkers);

    // Fit map to show all doctors
    if (doctorsList.length > 0) {
      if (doctorsList.length === 1) {
        const [lng, lat] = doctorsList[0].location.coordinates;
        map.setCenter({ lat, lng });
        map.setZoom(15);
      } else {
        map.fitBounds(bounds);
      }
    }
  };

  const handleQuickSearch = (area) => {
    // Predefined coordinates for common Bangalore areas
    const locations = {
      'JP Nagar': { lat: 12.9082, lng: 77.5833 },
      'Koramangala': { lat: 12.9352, lng: 77.6245 },
      'Whitefield': { lat: 12.9698, lng: 77.7500 },
      'Indiranagar': { lat: 12.9784, lng: 77.6408 },
      'BTM Layout': { lat: 12.9166, lng: 77.6101 },
      'Electronic City': { lat: 12.8456, lng: 77.6603 }
    };

    const location = locations[area];
    if (location) {
      map.setCenter(location);
      map.setZoom(14);
      searchNearbyDoctors(location.lat, location.lng);
    }
  };

  return (
    <div className="patient-search">
      <h2>🔍 Find Doctors Near You</h2>
      
      <div className="search-section">
        <div className="search-input-group">
          <input
            id="location-search"
            type="text"
            value={searchLocation}
            onChange={(e) => setSearchLocation(e.target.value)}
            placeholder="Search for a location (e.g., JP Nagar, Koramangala)..."
          />
          <button 
            onClick={loadAllDoctors}
            className="show-all-btn"
          >
            Show All Doctors
          </button>
        </div>

        <div className="quick-search">
          <p>Quick search popular areas:</p>
          <div className="quick-buttons">
            {['JP Nagar', 'Koramangala', 'Whitefield', 'Indiranagar', 'BTM Layout', 'Electronic City'].map(area => (
              <button
                key={area}
                onClick={() => handleQuickSearch(area)}
                className="quick-btn"
              >
                {area}
              </button>
            ))}
          </div>
        </div>
      </div>

      {message && (
        <div className={`message ${message.includes('Error') ? 'error' : 'info'}`}>
          {message}
        </div>
      )}

      <div className="results-section">
        <div className="map-container">
          <div id="patient-map" style={{ height: '400px', width: '100%' }}></div>
        </div>

        <div className="doctors-list">
          <h3>Available Doctors ({doctors.length})</h3>
          {isLoading ? (
            <p>Searching for doctors...</p>
          ) : doctors.length === 0 ? (
            <p>No doctors found. Try searching in a different area.</p>
          ) : (
            <div className="doctors-grid">
              {doctors.map((doctor) => (
                <div key={doctor._id} className="doctor-card">
                  <div className="doctor-info">
                    <h4>{doctor.name}</h4>
                    <p className="specialty">🩺 {doctor.specialty}</p>
                    <p className="address">📍 {doctor.address}</p>
                    <p className="coordinates">
                      📍 {doctor.location.coordinates[1].toFixed(4)}, {doctor.location.coordinates[0].toFixed(4)}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      const [lng, lat] = doctor.location.coordinates;
                      map.setCenter({ lat, lng });
                      map.setZoom(16);
                      
                      // Find and click the corresponding marker
                      const marker = markers.find(m => 
                        Math.abs(m.getPosition().lat() - lat) < 0.0001 &&
                        Math.abs(m.getPosition().lng() - lng) < 0.0001
                      );
                      if (marker && marker.infoWindow) {
                        marker.infoWindow.open(map, marker);
                      }
                    }}
                    className="locate-btn"
                  >
                    📍 Locate on Map
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientSearch;