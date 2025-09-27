// MS Recommendation History Management
// Similar to jobRecommendationHistory.js but for MS recommendations

const MS_RECOMMENDATION_STORAGE_KEY = 'msRecommendationHistory';

// Clean content by removing file paths and other unwanted text
const cleanContent = (content) => {
  if (!content) return content;
  
  // Remove file paths (like uploads\generated_letters\ms_reco\MS_Recommendation_Letter_*.docx)
  let cleanedContent = content.replace(/uploads\\generated_letters\\ms_reco\\MS_Recommendation_Letter_.*\.docx/g, '');
  cleanedContent = cleanedContent.replace(/uploads\/generated_letters\/ms_reco\/MS_Recommendation_Letter_.*\.docx/g, '');
  
  // Clean up any extra whitespace or newlines
  cleanedContent = cleanedContent.replace(/\n\s*\n\s*\n/g, '\n\n').trim();
  
  return cleanedContent;
};

// Add new MS recommendation to history
export const addMsRecommendationToHistory = (recommendationData) => {
  try {
    const existingHistory = getMsRecommendationHistory();
    const newRecommendation = {
      id: Date.now(),
      date: new Date().toISOString(),
      ...recommendationData,
      content: cleanContent(recommendationData.content)
    };
    
    const updatedHistory = [newRecommendation, ...existingHistory];
    localStorage.setItem(MS_RECOMMENDATION_STORAGE_KEY, JSON.stringify(updatedHistory));
    
    // Dispatch custom event for real-time updates
    window.dispatchEvent(new CustomEvent('msRecommendationAdded', {
      detail: newRecommendation
    }));
    
    // Also dispatch storage event for cross-tab sync
    window.dispatchEvent(new StorageEvent('storage', {
      key: MS_RECOMMENDATION_STORAGE_KEY,
      newValue: JSON.stringify(updatedHistory),
      oldValue: localStorage.getItem(MS_RECOMMENDATION_STORAGE_KEY)
    }));
    
    console.log('✅ MS recommendation saved to history:', newRecommendation);
    return newRecommendation;
  } catch (error) {
    console.error('❌ Error saving MS recommendation to history:', error);
    return null;
  }
};

// Get all MS recommendations from history
export const getMsRecommendationHistory = () => {
  try {
    const history = localStorage.getItem(MS_RECOMMENDATION_STORAGE_KEY);
    const parsedHistory = history ? JSON.parse(history) : [];
    
    // Clean content for all existing recommendations
    const cleanedHistory = parsedHistory.map(item => ({
      ...item,
      content: cleanContent(item.content)
    }));
    
    // If content was cleaned, save it back to localStorage
    const hasChanges = cleanedHistory.some((item, index) => 
      item.content !== parsedHistory[index].content
    );
    
    if (hasChanges) {
      localStorage.setItem(MS_RECOMMENDATION_STORAGE_KEY, JSON.stringify(cleanedHistory));
      console.log('✅ Cleaned MS recommendation history content');
    }
    
    return cleanedHistory;
  } catch (error) {
    console.error('❌ Error loading MS recommendation history:', error);
    return [];
  }
};

// Delete MS recommendation from history
export const deleteMsRecommendationFromHistory = (id) => {
  try {
    const existingHistory = getMsRecommendationHistory();
    const updatedHistory = existingHistory.filter(item => item.id !== id);
    localStorage.setItem(MS_RECOMMENDATION_STORAGE_KEY, JSON.stringify(updatedHistory));
    
    // Dispatch custom event for real-time updates
    window.dispatchEvent(new CustomEvent('msRecommendationDeleted', {
      detail: { id }
    }));
    
    console.log('✅ MS recommendation deleted from history:', id);
    return true;
  } catch (error) {
    console.error('❌ Error deleting MS recommendation from history:', error);
    return false;
  }
};

// Get MS recommendation by ID
export const getMsRecommendationById = (id) => {
  try {
    const history = getMsRecommendationHistory();
    return history.find(item => item.id === id) || null;
  } catch (error) {
    console.error('❌ Error getting MS recommendation by ID:', error);
    return null;
  }
};

// Clear all MS recommendation history
export const clearMsRecommendationHistory = () => {
  try {
    localStorage.removeItem(MS_RECOMMENDATION_STORAGE_KEY);
    
    // Dispatch custom event for real-time updates
    window.dispatchEvent(new CustomEvent('msRecommendationHistoryCleared'));
    
    console.log('✅ MS recommendation history cleared');
    return true;
  } catch (error) {
    console.error('❌ Error clearing MS recommendation history:', error);
    return false;
  }
};

// Get MS recommendation statistics
export const getMsRecommendationStats = () => {
  try {
    const history = getMsRecommendationHistory();
    const total = history.length;
    const thisMonth = history.filter(item => {
      const itemDate = new Date(item.date);
      const now = new Date();
      return itemDate.getMonth() === now.getMonth() && 
             itemDate.getFullYear() === now.getFullYear();
    }).length;
    
    return {
      total,
      thisMonth,
      lastGenerated: total > 0 ? history[0].date : null
    };
  } catch (error) {
    console.error('❌ Error getting MS recommendation stats:', error);
    return {
      total: 0,
      thisMonth: 0,
      lastGenerated: null
    };
  }
};
