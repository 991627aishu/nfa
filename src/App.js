import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import HomePage from './components/HomePage';
import SectionPage from './components/SectionPage';
import NfaAutomationForm from './components/NfaAutomationForm';
import NfaLandingPage from './components/NfaLandingPage';
import NfaHistoryPage from './components/NfaHistoryPage';
import MsRecommendationLandingPage from './components/MsRecommendationLandingPage';
import MsRecommendationForm from './components/MsRecommendationForm';
import MsRecommendationHistoryPage from './components/MsRecommendationHistoryPage';
import JobRecommendationLandingPage from './components/JobRecommendationLandingPage';
import JobRecommendationForm from './components/JobRecommendationForm';
import JobRecommendationHistoryPage from './components/JobRecommendationHistoryPage';
// import SectionLanding from './components/SectionLanding'; // Uncomment if you actually have this file

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Landing Page */}
          <Route path="/" element={<LandingPage />} />

          {/* Home Page */}
          <Route path="/home" element={<HomePage />} />

          {/* Section Page */}
          <Route path="/section/:sectionId" element={<SectionPage />} />

          {/* Note for Approval Landing Page */}
          <Route path="/nfa-landing" element={<NfaLandingPage />} />

          {/* NFA History Page */}
          <Route path="/nfa-history" element={<NfaHistoryPage />} />

          {/* Note for Approval → NFA Form */}
          <Route path="/nfa-form" element={<NfaAutomationForm />} />

          {/* MS Recommendation Letter Landing Page */}
          <Route path="/ms-recommendation-landing" element={<MsRecommendationLandingPage />} />

          {/* MS Recommendation Form */}
          <Route path="/ms-recommendation-form" element={<MsRecommendationForm />} />

          {/* MS Recommendation History */}
          <Route path="/ms-recommendation-history" element={<MsRecommendationHistoryPage />} />

          {/* Job Recommendation Letter Landing Page */}
          <Route path="/job-recommendation-landing" element={<JobRecommendationLandingPage />} />

          {/* Job Recommendation Form */}
          <Route path="/job-recommendation-form" element={<JobRecommendationForm />} />

          {/* Job Recommendation History */}
          <Route path="/job-recommendation-history" element={<JobRecommendationHistoryPage />} />

          {/* If you really need SectionLanding, keep it. Otherwise, remove */}
          {/* <Route path="/section" element={<SectionLanding />} /> */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
