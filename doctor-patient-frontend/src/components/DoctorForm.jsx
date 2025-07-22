import React, { useState, useEffect } from 'react';
import axios from 'axios';

const DoctorForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    specialty: '',
    address: ''
  });
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [map, setMap] = useState(null);
  const [marker, setMarker] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
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
  }, []);

  const initializeMap = () => {
    const defaultCenter = { lat: 12.9716, lng: 77.5946 }; // Bangalore
    
    const mapInstance = new window.google.maps.Map(
      document.getElementById('doctor-map'),
      {
        zoom: 12,
        center: defaultCenter,
        mapTypeControl: true,
        streetViewControl: false,
      }
    );

    // Add click listener to drop pin
    mapInstance.addListener('click', (e) => {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      
      // Remove existing marker
      if (marker) {
        marker.setMap(null);
      }

      // Create new marker
      const newMarker = new window.google.maps.Marker({
        position: { lat, lng },
        map: mapInstance,
        draggable: true,
        title: 'Clinic Location'
      });

      // Get address from coordinates
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ location: { lat, lng } }, (results, status) => {
        if (status === 'OK' && results[0]) {
          setFormData(prev => ({
            ...prev,
            address: results[0].formatted_address
          }));
        }
      });

      setMarker(newMarker);
      setSelectedLocation({ lat, lng });

      // Make marker draggable
      newMarker.addListener('dragend', (e) => {
        const newLat = e.latLng.lat();
        const newLng = e.latLng.lng();
        setSelectedLocation({ lat: newLat, lng: newLng });
        
        geocoder.geocode({ location: { lat: newLat, lng: newLng } }, (results, status) => {
          if (status === 'OK' && results[0]) {
            setFormData(prev => ({
              ...prev,
              address: results[0].formatted_address
            }));
          }
        });
      });
    });

    setMap(mapInstance);

    // Add search box
    const searchInput = document.getElementById('address-search');
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

      // Remove existing marker
      if (marker) {
        marker.setMap(null);
      }

      // Create new marker
      const newMarker = new window.google.maps.Marker({
        position: { lat, lng },
        map: mapInstance,
        draggable: true,
        title: 'Clinic Location'
      });

      setMarker(newMarker);
      setSelectedLocation({ lat, lng });
      setFormData(prev => ({
        ...prev,
        address: place.formatted_address || place.name
      }));

      mapInstance.setCenter({ lat, lng });
      mapInstance.setZoom(15);
    });
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedLocation) {
      setMessage('Please select a location on the map');
      return;
    }

    if (!formData.name || !formData.specialty) {
      setMessage('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      const response = await axios.post('http://localhost:5000/api/doctors', {
        name: formData.name,
        specialty: formData.specialty,
        address: formData.address,
        latitude: selectedLocation.lat,
        longitude: selectedLocation.lng
      });

      setMessage('✅ Doctor registered successfully!');
      setFormData({ name: '', specialty: '', address: '' });
      setSelectedLocation(null);
      
      if (marker) {
        marker.setMap(null);
        setMarker(null);
      }
    } catch (error) {
      setMessage('❌ Error registering doctor: ' + (error.response?.data?.error || error.message));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="doctor-form">
      <h2>👨‍⚕️ Register Your Clinic</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Doctor Name *</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Enter doctor name"
            required
          />
        </div>

        <div className="form-group">
          <label>Specialty *</label>
          <input
            type="text"
            name="specialty"
            value={formData.specialty}
            onChange={handleInputChange}
            placeholder="e.g., Cardiologist, Dermatologist"
            required
          />
        </div>

        <div className="form-group">
          <label>Search Address</label>
          <input
            id="address-search"
            type="text"
            placeholder="Search for clinic address..."
          />
        </div>

        <div className="form-group">
          <label>Clinic Address</label>
          <textarea
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            placeholder="Click on map to select location or search above"
            rows="3"
          />
        </div>

        <div className="map-section">
          <label>📍 Select Clinic Location on Map</label>
          <p className="map-instruction">Click on the map to drop a pin at your clinic location</p>
          <div id="doctor-map" style={{ height: '400px', width: '100%' }}></div>
        </div>

        {selectedLocation && (
          <div className="selected-location">
            <p>Selected: {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}</p>
          </div>
        )}

        {message && (
          <div className={`message ${message.includes('✅') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}

        <button type="submit" disabled={isLoading} className="submit-btn">
          {isLoading ? 'Registering...' : 'Register Clinic'}
        </button>
      </form>
    </div>
  );
};

export default DoctorForm;