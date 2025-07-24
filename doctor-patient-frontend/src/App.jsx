import React, { useState } from 'react';
import { Search, MapPin, User, Stethoscope, Building2, Loader2, CheckCircle, AlertCircle, Navigation } from 'lucide-react';

// API Configuration
const API_BASE_URL = 'https://the-squirrel-assignment-backend.onrender.com/api';
const DEFAULT_LOCATION = { lat: 12.9716, lng: 77.5946 }; // Bangalore coordinates

// Mock Google Maps API key (since we can't use real one in this environment)
const GOOGLE_MAPS_API_KEY = 'YOUR_GOOGLE_MAPS_API_KEY';

// Map Component (Simplified for this environment)
const Map = ({ center, onMapClick, selectedLocation }) => {
  const handleClick = (e) => {
    // Simulate map click with random coordinates near Bangalore
    const randomLat = 12.9716 + (Math.random() - 0.5) * 0.1;
    const randomLng = 77.5946 + (Math.random() - 0.5) * 0.1;
    
    if (onMapClick) {
      onMapClick({
        lat: randomLat,
        lng: randomLng
      });
    }
  };

  return (
    <div 
      className="h-[400px] bg-gray-100 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors"
      onClick={handleClick}
    >
      <MapPin className="w-12 h-12 text-gray-400 mb-2" />
      <p className="text-gray-600 font-medium">Click anywhere to select location</p>
      <p className="text-gray-500 text-sm">Map integration placeholder</p>
      {selectedLocation && (
        <div className="mt-4 px-4 py-2 bg-blue-100 rounded-lg">
          <p className="text-blue-800 text-sm font-medium">
            Selected: {selectedLocation.lat.toFixed(4)}, {selectedLocation.lng.toFixed(4)}
          </p>
        </div>
      )}
    </div>
  );
};

// Doctor Registration Form
const DoctorRegistrationForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    specialty: '',
    address: '',
    phone: '',
    email: ''
  });
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Doctor name is required';
    if (!formData.specialty.trim()) newErrors.specialty = 'Specialty is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!selectedLocation) newErrors.location = 'Please select a location on the map';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setMessage('Please fix the errors in the form');
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      const response = await fetch(`${API_BASE_URL}/doctors`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          specialty: formData.specialty,
          address: formData.address || 'Selected location on map',
          phone: formData.phone,
          email: formData.email,
          lat: selectedLocation.lat,
          lng: selectedLocation.lng
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed');
      }

      const data = await response.json();
      
      setMessage('Doctor registered successfully!');
      setFormData({ name: '', specialty: '', address: '', phone: '', email: '' });
      setSelectedLocation(null);
      setErrors({});
    } catch (error) {
      setMessage(error.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-white/20 rounded-xl">
              <Stethoscope className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-white">Doctor Registration</h2>
              <p className="text-blue-100 mt-1">Join our healthcare network</p>
            </div>
          </div>
        </div>

        <div className="p-8 space-y-6">
          <form onSubmit={handleSubmit}>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                  <User className="w-4 h-4" />
                  <span>Doctor Name</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 focus:outline-none ${
                    errors.name 
                      ? 'border-red-300 focus:border-red-500 bg-red-50' 
                      : 'border-gray-200 focus:border-blue-500 hover:border-gray-300'
                  }`}
                  placeholder="Enter your full name"
                />
                {errors.name && (
                  <p className="flex items-center space-x-1 text-sm text-red-600">
                    <AlertCircle className="w-4 h-4" />
                    <span>{errors.name}</span>
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                  <Stethoscope className="w-4 h-4" />
                  <span>Specialty</span>
                </label>
                <input
                  type="text"
                  name="specialty"
                  value={formData.specialty}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 focus:outline-none ${
                    errors.specialty 
                      ? 'border-red-300 focus:border-red-500 bg-red-50' 
                      : 'border-gray-200 focus:border-blue-500 hover:border-gray-300'
                  }`}
                  placeholder="e.g., Cardiologist, Pediatrician"
                />
                {errors.specialty && (
                  <p className="flex items-center space-x-1 text-sm text-red-600">
                    <AlertCircle className="w-4 h-4" />
                    <span>{errors.specialty}</span>
                  </p>
                )}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mt-6">
              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                  <span>📱</span>
                  <span>Phone Number</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 focus:outline-none ${
                    errors.phone 
                      ? 'border-red-300 focus:border-red-500 bg-red-50' 
                      : 'border-gray-200 focus:border-blue-500 hover:border-gray-300'
                  }`}
                  placeholder="+91 XXXXX XXXXX"
                />
                {errors.phone && (
                  <p className="flex items-center space-x-1 text-sm text-red-600">
                    <AlertCircle className="w-4 h-4" />
                    <span>{errors.phone}</span>
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                  <span>✉️</span>
                  <span>Email Address</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 focus:outline-none ${
                    errors.email 
                      ? 'border-red-300 focus:border-red-500 bg-red-50' 
                      : 'border-gray-200 focus:border-blue-500 hover:border-gray-300'
                  }`}
                  placeholder="doctor@example.com"
                />
                {errors.email && (
                  <p className="flex items-center space-x-1 text-sm text-red-600">
                    <AlertCircle className="w-4 h-4" />
                    <span>{errors.email}</span>
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-4 mt-6">
              <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                <MapPin className="w-4 h-4" />
                <span>Clinic Location</span>
              </label>
              
              <div className="rounded-xl overflow-hidden">
                <Map 
                  center={DEFAULT_LOCATION}
                  onMapClick={(location) => {
                    setSelectedLocation(location);
                    setFormData(prev => ({ 
                      ...prev, 
                      address: 'Selected location (click on map to change)' 
                    }));
                    if (errors.location) {
                      setErrors(prev => ({ ...prev, location: '' }));
                    }
                  }}
                  selectedLocation={selectedLocation}
                />
              </div>

              {selectedLocation && (
                <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="text-green-800 font-medium">Location Selected</p>
                      <p className="text-green-700 text-sm mt-1">{formData.address}</p>
                      <p className="text-green-600 text-xs mt-1">
                        Coordinates: {selectedLocation.lat.toFixed(4)}, {selectedLocation.lng.toFixed(4)}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {errors.location && (
                <p className="flex items-center space-x-1 text-sm text-red-600">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errors.location}</span>
                </p>
              )}
            </div>

            {message && (
              <div className={`rounded-xl p-4 mt-6 ${
                message.includes('successfully') 
                  ? 'bg-green-50 border border-green-200' 
                  : 'bg-red-50 border border-red-200'
              }`}>
                <div className="flex items-center space-x-2">
                  {message.includes('successfully') ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-600" />
                  )}
                  <span className={message.includes('successfully') ? 'text-green-800' : 'text-red-800'}>
                    {message}
                  </span>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Registering...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  <span>Register Doctor</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

// Patient Search Form
const PatientSearchForm = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [doctors, setDoctors] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedArea, setSelectedArea] = useState('');
  const [error, setError] = useState('');

  const popularAreas = [
    'JP Nagar', 'Koramangala', 'Whitefield', 
    'Indiranagar', 'BTM Layout', 'Electronic City'
  ];

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1); 
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    const d = R * c; // Distance in km
    return d < 1 ? `${Math.round(d * 1000)}m` : `${d.toFixed(1)}km`;
  };

  const deg2rad = (deg) => {
    return deg * (Math.PI/180);
  };

  // Predefined coordinates for popular areas (fallback if geocoding fails)
  const areaCoordinates = {
    'JP Nagar': { lat: 12.9082, lng: 77.5903 },
    'Koramangala': { lat: 12.9352, lng: 77.6245 },
    'Whitefield': { lat: 12.9698, lng: 77.7500 },
    'Indiranagar': { lat: 12.9719, lng: 77.6412 },
    'BTM Layout': { lat: 12.9165, lng: 77.6101 },
    'Electronic City': { lat: 12.8456, lng: 77.6603 }
  };

  const handleSearch = async (location = searchQuery) => {
    if (!location.trim()) {
      setError('Please enter a location to search');
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      let lat, lng;

      // Check if it's a predefined area
      if (areaCoordinates[location]) {
        lat = areaCoordinates[location].lat;
        lng = areaCoordinates[location].lng;
      } else {
        // For demo purposes, use Bangalore coordinates
        // In real implementation, you would use Google Geocoding API
        lat = 12.9716 + (Math.random() - 0.5) * 0.1;
        lng = 77.5946 + (Math.random() - 0.5) * 0.1;
        console.log(`Geocoding ${location} to coordinates:`, { lat, lng });
      }

      console.log('Searching for doctors near:', { lat, lng, location });
      
      // Search for doctors near these coordinates
      const doctorsResponse = await fetch(
        `${API_BASE_URL}/doctors/nearby?lat=${lat}&lng=${lng}&maxDistance=5000`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      console.log('API Response status:', doctorsResponse.status);
      
      if (!doctorsResponse.ok) {
        const errorText = await doctorsResponse.text();
        console.error('API Error:', errorText);
        throw new Error(`Failed to fetch doctors: ${doctorsResponse.status} ${doctorsResponse.statusText}`);
      }
      
      const doctorsData = await doctorsResponse.json();
      console.log('Doctors data received:', doctorsData);
      
      if (!Array.isArray(doctorsData)) {
        console.error('Invalid data format received:', doctorsData);
        throw new Error('Invalid data format received from server');
      }
      
      // Process the doctors data
      const processedDoctors = doctorsData.map(doctor => {
        console.log('Processing doctor:', doctor);
        
        // Handle different possible location formats
        let doctorLat, doctorLng;
        
        if (doctor.location && doctor.location.coordinates) {
          // MongoDB GeoJSON format: [lng, lat]
          doctorLng = doctor.location.coordinates[0];
          doctorLat = doctor.location.coordinates[1];
        } else if (doctor.lat && doctor.lng) {
          // Direct lat/lng format
          doctorLat = doctor.lat;
          doctorLng = doctor.lng;
        } else {
          console.warn('No location data found for doctor:', doctor);
          doctorLat = lat; // fallback to search location
          doctorLng = lng;
        }
        
        const distance = calculateDistance(lat, lng, doctorLat, doctorLng);
        
        return {
          ...doctor,
          doctorLat,
          doctorLng,
          distance
        };
      });
      
      console.log('Processed doctors:', processedDoctors);
      setDoctors(processedDoctors);
      
      if (processedDoctors.length === 0) {
        setError(`No doctors found in ${location}. Try searching in a different area.`);
      }
      
    } catch (error) {
      console.error('Search failed:', error);
      setError(error.message || 'Failed to search for doctors. Please try again.');
      setDoctors([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickSearch = (area) => {
    setSelectedArea(area);
    setSearchQuery(area);
    setError('');
    handleSearch(area);
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-green-600 to-teal-600 p-8">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-white/20 rounded-xl">
              <Search className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-white">Find Doctors Near You</h2>
              <p className="text-green-100 mt-1">Discover healthcare professionals in your area</p>
            </div>
          </div>
        </div>

        <div className="p-8">
          <div className="space-y-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (error) setError('');
                }}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-12 pr-4 py-4 text-lg border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 transition-colors duration-200"
                placeholder="Search by location (e.g., JP Nagar, Koramangala)"
              />
              <button
                onClick={() => handleSearch()}
                disabled={isLoading || !searchQuery.trim()}
                className="absolute inset-y-0 right-0 pr-2 flex items-center"
              >
                <div className="bg-green-600 text-white p-3 rounded-lg hover:bg-green-700 transition-colors duration-200 disabled:opacity-50">
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Search className="w-5 h-5" />
                  )}
                </div>
              </button>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-700 mb-3">Quick search popular areas:</p>
              <div className="flex flex-wrap gap-2">
                {popularAreas.map(area => (
                  <button
                    key={area}
                    onClick={() => handleQuickSearch(area)}
                    disabled={isLoading}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 disabled:opacity-50 ${
                      selectedArea === area
                        ? 'bg-green-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {area}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {error && (
            <div className="mt-6 bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <span className="text-red-800">{error}</span>
              </div>
            </div>
          )}

          {doctors.length > 0 && (
            <div className="mt-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800">
                  Available Doctors ({doctors.length})
                </h3>
                <div className="text-sm text-gray-600">
                  Showing results for "{searchQuery}"
                </div>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {doctors.map((doctor) => (
                  <div key={doctor._id} className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-200">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                          <User className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-800">{doctor.name}</h4>
                          <p className="text-gray-600 text-sm">{doctor.specialty}</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-start space-x-2 text-gray-600">
                        <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{doctor.address}</span>
                      </div>

                      <div className="flex items-center space-x-2 text-gray-600">
                        <span className="text-sm">📞</span>
                        <span className="text-sm">{doctor.phone}</span>
                      </div>

                      <div className="flex items-center space-x-2 text-gray-600">
                        <span className="text-sm">✉️</span>
                        <span className="text-sm">{doctor.email}</span>
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <span className="text-green-600 font-semibold text-sm">
                          📍 {doctor.distance}
                        </span>
                        <button 
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors duration-200"
                          onClick={() => {
                            const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${doctor.doctorLat},${doctor.doctorLng}`;
                            window.open(googleMapsUrl, '_blank');
                          }}
                        >
                          Get Directions
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {isLoading && (
            <div className="mt-8 text-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-green-600 mx-auto mb-4" />
              <p className="text-gray-600">Searching for doctors in your area...</p>
              <p className="text-gray-500 text-sm mt-1">This may take a few moments...</p>
            </div>
          )}

          {!isLoading && doctors.length === 0 && searchQuery && !error && (
            <div className="mt-8 text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-600">No doctors found in "{searchQuery}"</p>
              <p className="text-gray-500 text-sm mt-1">Try searching for a different location</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Main App Component
const App = () => {
  const [activeTab, setActiveTab] = useState('doctor');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl">
                <Building2 className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">HealthConnect</h1>
                <p className="text-gray-600 text-sm">Connecting patients with healthcare professionals</p>
              </div>
            </div>

            <div className="flex space-x-1 bg-gray-100 rounded-xl p-1">
              <button
                onClick={() => setActiveTab('doctor')}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === 'doctor'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                👨‍⚕️ Doctor Registration
              </button>
              <button
                onClick={() => setActiveTab('patient')}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === 'patient'
                    ? 'bg-white text-green-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                🔍 Find Doctors
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="py-8">
        {activeTab === 'doctor' ? <DoctorRegistrationForm /> : <PatientSearchForm />}
      </main>
    </div>
  );
};

export default App;