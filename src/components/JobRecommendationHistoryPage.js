import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material';
import {
  Home,
  Download,
  Visibility,
  Delete,
  Add,
  ArrowBack,
  CheckCircle
} from '@mui/icons-material';
import { 
  getJobRecommendationHistory, 
  deleteJobRecommendationFromHistory,
  getJobRecommendationById 
} from '../utils/jobRecommendationHistory';

const JobRecommendationHistoryPage = () => {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [viewJob, setViewJob] = useState(null);
  const [downloadLoading, setDownloadLoading] = useState(null);
  const [downloadSuccess, setDownloadSuccess] = useState(null);

  // Load job recommendation history from localStorage
  useEffect(() => {
    const loadHistory = () => {
      try {
        const jobHistory = getJobRecommendationHistory();
        setHistory(jobHistory);
        setLoading(false);
      } catch (error) {
        console.error('Error loading job recommendation history:', error);
        setError('Failed to load job recommendation history');
        setLoading(false);
      }
    };

    loadHistory();

    // Listen for storage changes to update in real-time
    const handleStorageChange = (e) => {
      if (e.key === 'jobRecommendationHistory') {
        loadHistory();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for custom events (for same-tab updates)
    const handleJobRecommendationAdded = () => {
      loadHistory();
    };

    window.addEventListener('jobRecommendationAdded', handleJobRecommendationAdded);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('jobRecommendationAdded', handleJobRecommendationAdded);
    };
  }, []);

  const handleBackToHome = () => {
    navigate('/home');
  };

  // Filter and search functionality
  const filteredData = useMemo(() => {
    console.log('Filtering job recommendations with:', { searchTerm, dateFilter, totalJobs: history.length });
    
    // If both filters are empty, show all jobs
    if ((searchTerm === '' || searchTerm === null) && (dateFilter === 'all' || dateFilter === '' || dateFilter === null)) {
      console.log('No filters applied - showing all job recommendations');
      return history;
    }
    
    const filtered = history.filter(item => {
      const matchesSearch = searchTerm === '' || searchTerm === null || 
                           item.candidateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.projectTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.projectSummary.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesDate = (() => {
        if (dateFilter === 'all' || dateFilter === '' || dateFilter === null) return true;
        
        try {
          const itemDate = new Date(item.date);
          const filterDate = new Date(dateFilter);
          
          // Check if dates are valid
          if (isNaN(itemDate.getTime()) || isNaN(filterDate.getTime())) {
            console.log('Invalid date:', { itemDate: item.date, filterDate: dateFilter });
            return false;
          }
          
          // Compare dates (ignore time)
          const itemDateString = itemDate.toDateString();
          const filterDateString = filterDate.toDateString();
          const matches = itemDateString === filterDateString;
          
          console.log('Date comparison:', {
            itemDateString,
            filterDateString,
            matches,
            originalItemDate: item.date,
            originalFilterDate: dateFilter
          });
          return matches;
        } catch (error) {
          console.error('Error comparing dates:', error);
          return false;
        }
      })();
      
      // If user has entered search term, show results that match search
      // If user has selected date, show results that match date
      // If both are provided, show results that match either
      const hasSearchFilter = searchTerm && searchTerm !== '';
      const hasDateFilter = dateFilter && dateFilter !== 'all' && dateFilter !== '';
      
      let result;
      if (hasSearchFilter && hasDateFilter) {
        // Both filters applied - show items that match BOTH
        result = matchesSearch && matchesDate;
      } else if (hasSearchFilter) {
        // Only search filter - show items that match search
        result = matchesSearch;
      } else if (hasDateFilter) {
        // Only date filter - show items that match date
        result = matchesDate;
      } else {
        // No filters - show all
        result = true;
      }
      
      return result;
    });
    
    console.log('Filtered results:', filtered.length);
    return filtered;
  }, [searchTerm, dateFilter, history]);

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString;
    }
  };

  const handleDownload = async (item) => {
    setDownloadLoading(item.id);
    setDownloadSuccess(null);
    
    try {
      console.log('Downloading job recommendation:', item.filename);
      
      const response = await fetch('http://localhost:5000/api/download-job-recommendation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: item.candidateName,
          title: item.projectTitle,
          summary: item.projectSummary
        })
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = item.filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        setDownloadSuccess(item.id);
        setTimeout(() => setDownloadSuccess(null), 3000);
      } else {
        setError('Failed to download job recommendation letter');
      }
    } catch (error) {
      console.error('Download error:', error);
      setError('Failed to download job recommendation letter');
    } finally {
      setDownloadLoading(null);
    }
  };

  const handleView = (item) => {
    setViewJob(item);
  };

  const handleDelete = (item) => {
    setDeleteConfirm(item);
  };

  const confirmDelete = () => {
    if (deleteConfirm) {
      const success = deleteJobRecommendationFromHistory(deleteConfirm.id);
      if (success) {
        setHistory(prev => prev.filter(item => item.id !== deleteConfirm.id));
        console.log('✅ Job recommendation deleted from history');
      } else {
        setError('Failed to delete job recommendation');
      }
      setDeleteConfirm(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
      case 'Completed':
        return 'success';
      case 'in_progress':
      case 'In Progress':
        return 'warning';
      case 'failed':
      case 'Failed':
        return 'error';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
          <CircularProgress />
          <Typography variant="h6" sx={{ ml: 2 }}>
            Loading job recommendation history...
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center shadow-lg p-2">
                <img 
                  src="/rv logo.jpeg" 
                  alt="RV University Logo" 
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Job Recommendation History</h1>
                <p className="text-sm text-gray-600">View and manage all your generated job recommendation letters</p>
              </div>
            </div>
            <button
              onClick={handleBackToHome}
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Back</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Container maxWidth="lg" sx={{ py: 0 }}>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
          Filters
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Search Filter */}
          <Box sx={{ flex: 1, minWidth: 200 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search by candidate name, project title, or summary..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <Box sx={{ mr: 1, color: 'text.secondary' }}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </Box>
                )
              }}
            />
          </Box>

          {/* Date Filter */}
          <Box sx={{ minWidth: 150 }}>
            <TextField
              fullWidth
              size="small"
              type="date"
              value={dateFilter === 'all' ? '' : dateFilter}
              onChange={(e) => setDateFilter(e.target.value || 'all')}
              InputLabelProps={{ shrink: true }}
            />
          </Box>

          {/* Clear Filters */}
          {(searchTerm || (dateFilter && dateFilter !== 'all')) && (
            <Button
              variant="outlined"
              size="small"
              onClick={() => {
                setSearchTerm('');
                setDateFilter('all');
              }}
            >
              Clear Filters
            </Button>
          )}
        </Box>

        {/* Filter Results Info */}
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Showing {filteredData.length} of {history.length} job recommendations
          </Typography>
          {(searchTerm || (dateFilter && dateFilter !== 'all')) && (
            <Typography variant="body2" color="primary.main" sx={{ mt: 0.5 }}>
              Filtering by: {searchTerm && `"${searchTerm}"`} {searchTerm && dateFilter && dateFilter !== 'all' && ' and '} {dateFilter && dateFilter !== 'all' && `date: ${new Date(dateFilter).toLocaleDateString('en-IN')}`}
            </Typography>
          )}
        </Box>
      </Paper>


      {/* History Table */}
      <Paper sx={{ overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.50' }}>
                <TableCell sx={{ fontWeight: 'bold' }}>Candidate Name</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Project Title</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body1" color="text.secondary">
                      {history.length === 0 
                        ? 'No job recommendation letters found. Create your first one!'
                        : 'No job recommendations match your current filters.'
                      }
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredData.map((item) => (
                  <TableRow key={item.id} hover>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                        {item.candidateName}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {item.projectTitle}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatDate(item.date)}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ textAlign: 'center' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                        <IconButton
                          size="small"
                          onClick={() => handleView(item)}
                          color="primary"
                          title="View"
                        >
                          <Visibility />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDownload(item)}
                          color={downloadSuccess === item.id ? 'success' : 'success'}
                          title="Download"
                          disabled={downloadLoading === item.id}
                        >
                          {downloadLoading === item.id ? (
                            <CircularProgress size={16} />
                          ) : downloadSuccess === item.id ? (
                            <CheckCircle />
                          ) : (
                            <Download />
                          )}
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(item)}
                          color="error"
                          title="Delete"
                        >
                          <Delete />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Empty State */}
      {history.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
            No job recommendation letters yet
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Start by creating your first job recommendation letter
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate('/job-recommendation-form')}
            size="large"
          >
            Create First Letter
          </Button>
        </Box>
      )}


      {/* View Dialog */}
      {viewJob && (
        <Dialog
          open={Boolean(viewJob)}
          onClose={() => setViewJob(null)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            Job Recommendation Letter - {viewJob.candidateName}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                <strong>Candidate:</strong> {viewJob.candidateName}
              </Typography>
              <Typography variant="subtitle2" color="text.secondary">
                <strong>Project:</strong> {viewJob.projectTitle}
              </Typography>
              <Typography variant="subtitle2" color="text.secondary">
                <strong>Date:</strong> {formatDate(viewJob.date)}
              </Typography>
            </Box>
            <Box sx={{ 
              p: 2, 
              bgcolor: 'grey.50', 
              borderRadius: 1,
              border: '1px solid',
              borderColor: 'grey.200',
              maxHeight: 400,
              overflow: 'auto'
            }}>
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
                {viewJob.content}
              </Typography>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setViewJob(null)}>
              Close
            </Button>
            <Button 
              variant="contained" 
              onClick={() => {
                setViewJob(null);
                handleDownload(viewJob);
              }}
              startIcon={<Download />}
            >
              Download
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteConfirm && (
        <Dialog
          open={Boolean(deleteConfirm)}
          onClose={() => setDeleteConfirm(null)}
        >
          <DialogTitle>
            Confirm Delete
          </DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete the job recommendation letter for <strong>{deleteConfirm.candidateName}</strong>?
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteConfirm(null)}>
              Cancel
            </Button>
            <Button 
              onClick={confirmDelete}
              color="error"
              variant="contained"
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      )}
        </Container>
      </div>
    </div>
  );
};

export default JobRecommendationHistoryPage;
