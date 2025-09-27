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
  Download,
  Visibility,
  Delete,
  ArrowBack,
  CheckCircle
} from '@mui/icons-material';
import { 
  getMsRecommendationHistory, 
  deleteMsRecommendationFromHistory,
  getMsRecommendationById 
} from '../utils/msRecommendationHistory';
import MsRecommendationPreview from './MsRecommendationPreview';

const MsRecommendationHistoryPage = () => {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [viewMs, setViewMs] = useState(null);
  const [downloadLoading, setDownloadLoading] = useState(null);
  const [downloadSuccess, setDownloadSuccess] = useState(null);

  // Load history on component mount
  useEffect(() => {
    loadHistory();
  }, []);

  // Listen for real-time updates
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'msRecommendationHistory') {
        loadHistory();
      }
    };

    const handleMsRecommendationAdded = () => {
      loadHistory();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('msRecommendationAdded', handleMsRecommendationAdded);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('msRecommendationAdded', handleMsRecommendationAdded);
    };
  }, []);

  const loadHistory = () => {
    try {
      const msHistory = getMsRecommendationHistory();
      setHistory(msHistory);
      console.log('✅ Loaded MS recommendation history:', msHistory.length, 'items');
    } catch (error) {
      console.error('❌ Error loading MS recommendation history:', error);
      setError('Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToHome = () => {
    navigate('/home');
  };

  // Filter and search functionality
  const filteredData = useMemo(() => {
    console.log('Filtering MS recommendations with:', { searchTerm, dateFilter, totalMs: history.length });
    
    // If both filters are empty, show all MS recommendations
    if ((searchTerm === '' || searchTerm === null) && (dateFilter === 'all' || dateFilter === '' || dateFilter === null)) {
      console.log('No filters applied - showing all MS recommendations');
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
      console.log('Downloading MS recommendation:', item.filename);
      
      const response = await fetch('http://localhost:5000/api/download-ms-recommendation', {
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

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

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
    } catch (error) {
      console.error('Download error:', error);
      setError('Failed to download file');
    } finally {
      setDownloadLoading(null);
    }
  };

  const handleView = (item) => {
    setViewMs(item);
  };

  const handleDelete = (item) => {
    setDeleteConfirm(item);
  };

  const confirmDelete = () => {
    if (deleteConfirm) {
      const success = deleteMsRecommendationFromHistory(deleteConfirm.id);
      if (success) {
        loadHistory();
        setDeleteConfirm(null);
      } else {
        setError('Failed to delete recommendation');
      }
    }
  };

  const handleEdit = (item) => {
    navigate('/ms-recommendation-form', {
      state: {
        viewMode: true,
        data: {
          candidateName: item.candidateName,
          projectTitle: item.projectTitle,
          projectSummary: item.projectSummary
        }
      }
    });
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
          <CircularProgress />
          <Typography variant="h6" sx={{ ml: 2 }}>
            Loading MS recommendation history...
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
                <h1 className="text-2xl font-bold text-gray-900">MS Recommendation History</h1>
                <p className="text-sm text-gray-600">View and manage all your generated MS recommendation letters</p>
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
        <Typography variant="h6" sx={{ mb: 2 }}>
          Filters
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            label="Search MS Recommendations"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by student name, project title, or summary..."
            sx={{ minWidth: 300 }}
            InputProps={{
              startAdornment: (
                <Box sx={{ mr: 1, display: 'flex', alignItems: 'center' }}>
                  🔍
                </Box>
              ),
            }}
          />
          <TextField
            label="Filter by Date"
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            sx={{ minWidth: 200 }}
            InputLabelProps={{
              shrink: true,
            }}
          />
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Showing {filteredData.length} of {history.length} MS recommendations
        </Typography>
      </Paper>

      {/* History Table */}
      {filteredData.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
            No MS recommendations found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {history.length === 0 
              ? "You haven't generated any MS recommendation letters yet."
              : "Try adjusting your search or date filters."
            }
          </Typography>
          {history.length === 0 && (
            <Button
              variant="contained"
              onClick={() => navigate('/ms-recommendation-form')}
              sx={{ mt: 2 }}
            >
              Create First Letter
            </Button>
          )}
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Student Name</strong></TableCell>
                <TableCell><strong>Project Title</strong></TableCell>
                <TableCell><strong>Date</strong></TableCell>
                <TableCell><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredData.map((item) => (
                <TableRow key={item.id} hover>
                  <TableCell>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
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
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton
                        size="small"
                        onClick={() => handleView(item)}
                        color="primary"
                        title="View Letter"
                      >
                        <Visibility />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDownload(item)}
                        color="success"
                        title="Download Letter"
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
                        title="Delete Letter"
                      >
                        <Delete />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}


      {/* View Dialog */}
      {viewMs && (
        <Dialog
          open={Boolean(viewMs)}
          onClose={() => setViewMs(null)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            MS Recommendation Letter - {viewMs.candidateName}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                <strong>Student:</strong> {viewMs.candidateName}
              </Typography>
              <Typography variant="subtitle2" color="text.secondary">
                <strong>Project:</strong> {viewMs.projectTitle}
              </Typography>
              <Typography variant="subtitle2" color="text.secondary">
                <strong>Date:</strong> {formatDate(viewMs.date)}
              </Typography>
            </Box>
            <Box sx={{ 
              maxHeight: 500,
              overflow: 'auto',
              border: '1px solid #e0e0e0',
              borderRadius: 1
            }}>
              <MsRecommendationPreview 
                formData={{
                  name: viewMs.candidateName,
                  title: viewMs.projectTitle,
                  summary: viewMs.projectSummary
                }}
                generatedContent={viewMs.content}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setViewMs(null)}>
              Close
            </Button>
            <Button 
              variant="contained" 
              onClick={() => {
                setViewMs(null);
                handleDownload(viewMs);
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
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete the MS recommendation letter for "{deleteConfirm.candidateName}"?
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

export default MsRecommendationHistoryPage;
