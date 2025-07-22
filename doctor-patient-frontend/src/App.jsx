import React, { useState } from 'react';
import DoctorForm from './components/DoctorForm';
import PatientSearch from './components/PatientSearch';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('doctor');

  return (
    <div className="App">
      <header className="app-header">
        <h1>🏥 Doctor-Patient Platform</h1>
        <div className="tab-buttons">
          <button 
            className={activeTab === 'doctor' ? 'active' : ''}
            onClick={() => setActiveTab('doctor')}
          >
            👨‍⚕️ Doctor Registration
          </button>
          <button 
            className={activeTab === 'patient' ? 'active' : ''}
            onClick={() => setActiveTab('patient')}
          >
            👤 Find Doctors
          </button>
        </div>
      </header>

      <main className="main-content">
        {activeTab === 'doctor' ? <DoctorForm /> : <PatientSearch />}
      </main>
    </div>
  );
}

export default App;