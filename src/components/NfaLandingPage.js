import React from 'react';
import { useNavigate } from 'react-router-dom';

const NfaLandingPage = () => {
  const navigate = useNavigate();

  const handleShowHistory = () => {
    navigate('/nfa-history');
  };

  const handleCreateNew = () => {
    navigate('/nfa-form');
  };

  const handleOpenSplitPanel = () => {
    // Open the split-panel HTML file in a new tab
    window.open('/nfa-document-generator.html', '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50 to-orange-100 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-32 w-80 h-80 bg-gradient-to-br from-yellow-400/20 to-orange-500/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-gradient-to-br from-amber-400/20 to-yellow-500/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-orange-400/10 to-yellow-500/10 rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <div className="relative z-10 bg-white/80 backdrop-blur-md shadow-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-xl p-3 transform rotate-3 hover:rotate-0 transition-transform duration-300">
                <img 
                  src="/rv logo.jpeg" 
                  alt="RV University Logo" 
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">RV University</h1>
                <p className="text-gray-600 font-medium">Note For Approval System</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/home')}
              className="group flex items-center space-x-2 bg-gradient-to-r from-gray-600 to-gray-700 text-white px-6 py-3 rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span className="font-medium">Back to Home</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Hero Section */}
        <div className="text-center mb-20">
          <div className="relative inline-block mb-8">
            <div className="w-32 h-32 bg-gradient-to-br from-yellow-500 via-orange-500 to-red-600 rounded-full flex items-center justify-center mx-auto shadow-2xl transform rotate-12 hover:rotate-0 transition-transform duration-500">
              <span className="text-5xl">📝</span>
            </div>
            <div className="absolute -inset-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full opacity-20 blur-xl animate-pulse"></div>
          </div>
          
          <h2 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-yellow-600 via-orange-600 to-red-600 bg-clip-text text-transparent">
              Note For Approval
            </span>
          </h2>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Manage your NFA requests and track their approval status with our advanced system. 
            Create professional approval documents and monitor their progress seamlessly.
          </p>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto mb-20">
          {/* Create New NFA Card */}
          <div
            onClick={handleCreateNew}
            className="group relative bg-white/70 backdrop-blur-md rounded-3xl p-8 cursor-pointer hover:bg-white/90 transition-all duration-500 transform hover:-translate-y-4 hover:scale-105 shadow-xl hover:shadow-2xl border border-white/20 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <div className="text-center">
                <div className="relative inline-block mb-8">
                  <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 shadow-lg">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <div className="absolute -inset-2 bg-gradient-to-r from-green-400 to-emerald-500 rounded-2xl opacity-0 group-hover:opacity-30 blur-lg transition-opacity duration-500"></div>
                </div>
                
                <h3 className="text-3xl font-bold text-gray-900 mb-4 group-hover:text-green-600 transition-colors duration-300">
                  Create New NFA
                </h3>
                
                <p className="text-gray-600 mb-8 leading-relaxed">
                  Generate a new Note For Approval document with our automated system. 
                  Create professional approval requests with AI-powered content generation.
                </p>
                
                <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-4 rounded-xl font-semibold group-hover:from-green-600 group-hover:to-emerald-700 transition-all duration-300 shadow-lg group-hover:shadow-xl">
                  <span>Create NFA</span>
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Show History Card */}
          <div
            onClick={handleShowHistory}
            className="group relative bg-white/70 backdrop-blur-md rounded-3xl p-8 cursor-pointer hover:bg-white/90 transition-all duration-500 transform hover:-translate-y-4 hover:scale-105 shadow-xl hover:shadow-2xl border border-white/20 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <div className="text-center">
                <div className="relative inline-block mb-8">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 shadow-lg">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="absolute -inset-2 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-2xl opacity-0 group-hover:opacity-30 blur-lg transition-opacity duration-500"></div>
                </div>
                
                <h3 className="text-3xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors duration-300">
                  Show History
                </h3>
                
                <p className="text-gray-600 mb-8 leading-relaxed">
                  View all your previous NFA requests with advanced filtering and search capabilities. 
                  Track approval status and manage your documents efficiently.
                </p>
                
                <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-cyan-600 text-white px-8 py-4 rounded-xl font-semibold group-hover:from-blue-600 group-hover:to-cyan-700 transition-all duration-300 shadow-lg group-hover:shadow-xl">
                  <span>View History</span>
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Split Panel NFA Generator Card */}
          <div
            onClick={handleOpenSplitPanel}
            className="group relative bg-white/70 backdrop-blur-md rounded-3xl p-8 cursor-pointer hover:bg-white/90 transition-all duration-500 transform hover:-translate-y-4 hover:scale-105 shadow-xl hover:shadow-2xl border border-white/20 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <div className="text-center">
                <div className="relative inline-block mb-8">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 shadow-lg">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="absolute -inset-2 bg-gradient-to-r from-purple-400 to-pink-500 rounded-2xl opacity-0 group-hover:opacity-30 blur-lg transition-opacity duration-500"></div>
                </div>
                
                <h3 className="text-3xl font-bold text-gray-900 mb-4 group-hover:text-purple-600 transition-colors duration-300">
                  Split Panel Generator
                </h3>
                
                <p className="text-gray-600 mb-8 leading-relaxed">
                  Advanced NFA generator with AI assistant chat panel. Create documents with real-time AI assistance, interactive tables, and formula support.
                </p>
                
                <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white px-8 py-4 rounded-xl font-semibold group-hover:from-purple-600 group-hover:to-pink-700 transition-all duration-300 shadow-lg group-hover:shadow-xl">
                  <span>Open Generator</span>
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="text-center mb-16">
          <h3 className="text-4xl font-bold text-gray-900 mb-4">
            Why Choose Our 
            <span className="bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent"> NFA System?</span>
          </h3>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Streamline your approval process with our cutting-edge document management system
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="group bg-white/60 backdrop-blur-md rounded-2xl p-8 hover:bg-white/80 transition-all duration-300 transform hover:-translate-y-2 shadow-lg hover:shadow-xl border border-white/20">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
                <span className="text-2xl">🤖</span>
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-3">AI-Powered Generation</h4>
              <p className="text-gray-600 leading-relaxed">
                Advanced AI creates personalized, compelling approval documents tailored to your specific requirements and institutional standards.
              </p>
            </div>
          </div>

          <div className="group bg-white/60 backdrop-blur-md rounded-2xl p-8 hover:bg-white/80 transition-all duration-300 transform hover:-translate-y-2 shadow-lg hover:shadow-xl border border-white/20">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
                <span className="text-2xl">⚡</span>
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-3">Lightning Fast</h4>
              <p className="text-gray-600 leading-relaxed">
                Generate professional NFA documents in minutes, not hours. Perfect for urgent approval requests and tight deadlines.
              </p>
            </div>
          </div>

          <div className="group bg-white/60 backdrop-blur-md rounded-2xl p-8 hover:bg-white/80 transition-all duration-300 transform hover:-translate-y-2 shadow-lg hover:shadow-xl border border-white/20">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
                <span className="text-2xl">🎯</span>
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-3">Institution-Specific</h4>
              <p className="text-gray-600 leading-relaxed">
                Documents are customized for specific institutional requirements and approval processes, highlighting relevant details and compliance standards.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10 bg-white/80 backdrop-blur-md border-t border-white/20 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-gray-600 font-medium">
              © 2024 RV University. Streamlining approval processes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NfaLandingPage;
