import React from 'react';

const JobRecommendationPreview = ({ content, candidateName, projectTitle, projectSummary }) => {
  // Get current date
  const currentDate = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  return (
    <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center">
              <img 
                src="/rv logo.jpeg" 
                alt="RV University Logo" 
                className="w-12 h-12 object-contain"
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold">RV UNIVERSITY</h1>
              <p className="text-emerald-100 text-sm">Go, change the world</p>
              <p className="text-emerald-100 text-xs">an initiative of RV EDUCATIONAL INSTITUTIONS</p>
            </div>
          </div>
          <div className="text-right text-sm">
            <p>RV Vidyaniketan, 8th Mile, Mysuru Road</p>
            <p>Bengaluru, 560059, India</p>
            <p>Ph: +91 80 68199900 | www.rvu.edu.in</p>
          </div>
        </div>
      </div>

      {/* Document Content */}
      <div className="p-8 space-y-6">
        {/* Date - Right Aligned */}
        <div className="text-right">
          <p className="text-gray-700 font-medium">Date: {currentDate}</p>
        </div>

        {/* Letter Title */}
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-900">Letter of Recommendation</h2>
        </div>

        {/* Contact Information */}
        <div className="text-gray-700 space-y-1">
          <p className="font-semibold">Dr. Phani Kumar Pullela</p>
          <p>Professor & Associate Dean</p>
          <p>RV University</p>
          <p>Email: phanikumarp@rvu.edu.in</p>
          <p>Phone: +91-9902005868</p>
        </div>

        {/* Subject Line */}
        <div>
          <p className="text-gray-700">
            <span className="font-bold">Subject:</span> Job Recommendation Letter for {candidateName}
          </p>
        </div>

        {/* Greeting */}
        <div className="text-center">
          <p className="text-gray-700 font-medium">To Whomsoever It May Concern</p>
        </div>

        {/* Main Content */}
        <div className="text-justify space-y-4">
          {content ? (
            content.split('\n').map((paragraph, index) => {
              if (paragraph.trim()) {
                return (
                  <p key={index} className="text-gray-700 leading-relaxed">
                    {paragraph.trim()}
                  </p>
                );
              }
              return null;
            })
          ) : (
            <div className="space-y-4">
              <p className="text-gray-700 leading-relaxed">
                It is my privilege to recommend {candidateName}, who has consistently demonstrated dedication and expertise in their work. I have had the pleasure of mentoring {candidateName}, and their significant contributions to "{projectTitle}" have been truly commendable.
              </p>
              
              <p className="text-gray-700 leading-relaxed">
                {candidateName} has demonstrated exceptional skills and dedication in their project '{projectTitle}'. {projectSummary}
              </p>
              
              <p className="text-gray-700 leading-relaxed">
                In addition to their technical expertise, {candidateName} has shown exceptional professionalism, teamwork, and the ability to manage complex tasks with precision. Their commitment to excellence makes them a standout individual who will undoubtedly excel in any professional endeavor.
              </p>
              
              <p className="text-gray-700 leading-relaxed">
                I am confident that {candidateName} will bring the same level of passion, innovation, and excellence to their future roles. Should you require additional information, please do not hesitate to contact me at +91-9902005868 or via email at phanikumarp@rvu.edu.in.
              </p>
            </div>
          )}
        </div>

        {/* Signature Section */}
        <div className="mt-8 space-y-4">
          <div className="text-right">
            <p className="text-gray-700 font-medium">Sincerely,</p>
          </div>
          
          <div className="text-gray-700 space-y-1">
            <p className="font-semibold">Dr. Phani Kumar Pullela</p>
            <p>Professor & Associate Dean</p>
            <p>RV University</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-50 px-8 py-4 border-t">
        <div className="text-center">
          <p className="text-sm text-gray-500">
            This is a preview of your job recommendation letter. The actual document will be formatted as a professional Word document.
          </p>
        </div>
      </div>
    </div>
  );
};

export default JobRecommendationPreview;
