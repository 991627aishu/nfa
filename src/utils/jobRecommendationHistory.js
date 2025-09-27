// Job Recommendation History Management Utility

export const addJobRecommendationToHistory = (jobData) => {
  try {
    const savedJobs = localStorage.getItem('jobRecommendationHistory');
    let jobHistory = [];
    
    if (savedJobs) {
      jobHistory = JSON.parse(savedJobs);
    }
    
    // Ensure we have valid data
    if (!jobData || !jobData.candidateName) {
      console.error('Invalid job recommendation data provided:', jobData);
      return null;
    }
    
    const newJob = {
      ...jobData,
      id: Date.now() + Math.random(), // More unique ID generation
      createdAt: new Date().toISOString(),
      status: jobData.status || 'completed', // Use provided status or default
      // Ensure all required fields have default values
      candidateName: jobData.candidateName || 'Unknown Candidate',
      projectTitle: jobData.projectTitle || 'Untitled Project',
      projectSummary: jobData.projectSummary || '',
      filename: jobData.filename || `Job_Recommendation_Letter_${jobData.candidateName.replace(/\s+/g, '_')}.docx`,
      content: jobData.content || '',
      date: jobData.date || new Date().toISOString().split('T')[0]
    };
    
    // Add to beginning of array (most recent first)
    const updatedHistory = [newJob, ...jobHistory];
    
    // Save to localStorage
    localStorage.setItem('jobRecommendationHistory', JSON.stringify(updatedHistory));
    
    // Trigger storage event for real-time updates
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'jobRecommendationHistory',
      newValue: JSON.stringify(updatedHistory)
    }));
    
    console.log('✅ Job recommendation added to history:', newJob);
    
    // Show success notification
    if (typeof window !== 'undefined' && window.dispatchEvent) {
      window.dispatchEvent(new CustomEvent('jobRecommendationAdded', { 
        detail: { 
          message: `Job recommendation for "${newJob.candidateName}" has been added to history!`,
          jobRecommendation: newJob 
        } 
      }));
    }
    
    return newJob;
  } catch (error) {
    console.error('Error adding job recommendation to history:', error);
    return null;
  }
};

export const getJobRecommendationHistory = () => {
  try {
    const savedJobs = localStorage.getItem('jobRecommendationHistory');
    return savedJobs ? JSON.parse(savedJobs) : [];
  } catch (error) {
    console.error('Error getting job recommendation history:', error);
    return [];
  }
};

export const updateJobRecommendationStatus = (id, newStatus) => {
  try {
    const savedJobs = localStorage.getItem('jobRecommendationHistory');
    if (!savedJobs) return false;
    
    const jobHistory = JSON.parse(savedJobs);
    const updatedHistory = jobHistory.map(job => 
      job.id === id ? { ...job, status: newStatus } : job
    );
    
    localStorage.setItem('jobRecommendationHistory', JSON.stringify(updatedHistory));
    
    // Trigger storage event for real-time updates
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'jobRecommendationHistory',
      newValue: JSON.stringify(updatedHistory)
    }));
    
    return true;
  } catch (error) {
    console.error('Error updating job recommendation status:', error);
    return false;
  }
};

export const deleteJobRecommendationFromHistory = (id) => {
  try {
    const savedJobs = localStorage.getItem('jobRecommendationHistory');
    if (!savedJobs) return false;
    
    const jobHistory = JSON.parse(savedJobs);
    const updatedHistory = jobHistory.filter(job => job.id !== id);
    
    localStorage.setItem('jobRecommendationHistory', JSON.stringify(updatedHistory));
    
    // Trigger storage event for real-time updates
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'jobRecommendationHistory',
      newValue: JSON.stringify(updatedHistory)
    }));
    
    return true;
  } catch (error) {
    console.error('Error deleting job recommendation from history:', error);
    return false;
  }
};

export const getJobRecommendationById = (id) => {
  try {
    const savedJobs = localStorage.getItem('jobRecommendationHistory');
    if (!savedJobs) return null;
    
    const jobHistory = JSON.parse(savedJobs);
    return jobHistory.find(job => job.id === id) || null;
  } catch (error) {
    console.error('Error getting job recommendation by ID:', error);
    return null;
  }
};
