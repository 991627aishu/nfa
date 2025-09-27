// NFA History Management Utility

export const addNfaToHistory = (nfaData) => {
  try {
    const savedNfas = localStorage.getItem('nfaHistory');
    let nfaHistory = [];
    
    if (savedNfas) {
      nfaHistory = JSON.parse(savedNfas);
    }
    
    // Ensure we have valid data
    if (!nfaData || !nfaData.subject) {
      console.error('Invalid NFA data provided:', nfaData);
      return null;
    }
    
    const newNfa = {
      ...nfaData,
      id: Date.now() + Math.random(), // More unique ID generation
      createdAt: new Date().toISOString(),
      status: nfaData.status || 'pending', // Use provided status or default
      // Ensure all required fields have default values
      subject: nfaData.subject || 'Untitled NFA',
      type: nfaData.type || 'Advance',
      amount: nfaData.amount || '₹0',
      createdBy: nfaData.createdBy || 'Unknown User',
      description: nfaData.description || '',
      date: nfaData.date || new Date().toISOString().split('T')[0]
    };
    
    // Add to beginning of array (most recent first)
    const updatedHistory = [newNfa, ...nfaHistory];
    
    // Save to localStorage
    localStorage.setItem('nfaHistory', JSON.stringify(updatedHistory));
    
    // Trigger storage event for real-time updates
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'nfaHistory',
      newValue: JSON.stringify(updatedHistory)
    }));
    
    console.log('✅ NFA added to history:', newNfa);
    
    // Show success notification
    if (typeof window !== 'undefined' && window.dispatchEvent) {
      window.dispatchEvent(new CustomEvent('nfaAdded', { 
        detail: { 
          message: `NFA "${newNfa.subject}" has been added to history!`,
          nfa: newNfa 
        } 
      }));
    }
    
    return newNfa;
  } catch (error) {
    console.error('Error adding NFA to history:', error);
    return null;
  }
};

export const getNfaHistory = () => {
  try {
    const savedNfas = localStorage.getItem('nfaHistory');
    return savedNfas ? JSON.parse(savedNfas) : [];
  } catch (error) {
    console.error('Error getting NFA history:', error);
    return [];
  }
};

export const updateNfaStatus = (id, newStatus) => {
  try {
    const savedNfas = localStorage.getItem('nfaHistory');
    if (!savedNfas) return false;
    
    const nfaHistory = JSON.parse(savedNfas);
    const updatedHistory = nfaHistory.map(nfa => 
      nfa.id === id ? { ...nfa, status: newStatus } : nfa
    );
    
    localStorage.setItem('nfaHistory', JSON.stringify(updatedHistory));
    
    // Trigger storage event for real-time updates
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'nfaHistory',
      newValue: JSON.stringify(updatedHistory)
    }));
    
    return true;
  } catch (error) {
    console.error('Error updating NFA status:', error);
    return false;
  }
};

export const deleteNfaFromHistory = (id) => {
  try {
    const savedNfas = localStorage.getItem('nfaHistory');
    if (!savedNfas) return false;
    
    const nfaHistory = JSON.parse(savedNfas);
    const updatedHistory = nfaHistory.filter(nfa => nfa.id !== id);
    
    localStorage.setItem('nfaHistory', JSON.stringify(updatedHistory));
    
    // Trigger storage event for real-time updates
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'nfaHistory',
      newValue: JSON.stringify(updatedHistory)
    }));
    
    return true;
  } catch (error) {
    console.error('Error deleting NFA from history:', error);
    return false;
  }
};
