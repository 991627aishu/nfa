import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Send,
  Download,
  Edit,
  CheckCircle,
  Error as ErrorIcon
} from '@mui/icons-material';
import axios from 'axios';
import MsRecommendationPreview from './MsRecommendationPreview';
import { addMsRecommendationToHistory } from '../utils/msRecommendationHistory';

function MsRecommendationForm() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check if we're in view mode (coming from history)
  const viewMode = location.state?.viewMode || false;
  const viewData = location.state?.data || {};
  
  // Form data state
  const [formData, setFormData] = useState({
    name: viewData.candidateName || '',
    title: viewData.projectTitle || '',
    summary: viewData.projectSummary || ''
  });

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [activeStep, setActiveStep] = useState(0);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState('');

  // Steps for the form
  const steps = ['Personal Information', 'Project Details', 'Preview & Download'];

  // Handle viewMode when coming from history
  useEffect(() => {
    if (viewMode && viewData.content) {
      setGeneratedContent(viewData.content);
      setActiveStep(2); // Go directly to preview step
    }
  }, [viewMode, viewData]);

  // Handle form input changes
  const handleInputChange = (field) => (event) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
    // Clear messages when user starts typing
    if (error) setError('');
    if (success) setSuccess('');
  };

  // Validate form data
  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Please enter the student name');
      return false;
    }
    if (!formData.title.trim()) {
      setError('Please enter the project title');
      return false;
    }
    if (!formData.summary.trim()) {
      setError('Please enter the project summary');
      return false;
    }
    return true;
  };

  // Generate MS recommendation letter
  const generateMsRecommendation = useCallback(async () => {
    if (!validateForm()) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      console.log('🔍 Sending request to generate MS recommendation:', formData);
      
      const response = await axios.post(
        'http://localhost:5000/api/generate-ms-recommendation',
        formData
      );

      console.log('✅ Backend response:', response.data);
      
      if (response.data.success) {
        setGeneratedContent(response.data.content);
        setSuccess('MS recommendation letter generated successfully!');
        setActiveStep(2); // Move to final step
        
        // Save to history
        const msData = {
          candidateName: formData.name,
          projectTitle: formData.title,
          projectSummary: formData.summary,
          content: response.data.content,
          filename: `MS_Recommendation_Letter_${formData.name.replace(/\s+/g, '_')}.docx`,
          status: 'completed'
        };
        
        const savedMs = addMsRecommendationToHistory(msData);
        if (savedMs) {
          console.log('✅ MS recommendation saved to history:', savedMs);
        }
      } else {
        setError(response.data.error || 'Failed to generate recommendation letter');
      }
    } catch (error) {
      console.error('❌ Error generating MS recommendation:', error);
      setError('Failed to generate recommendation letter. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [formData]);

  // Download generated letter
  const handleDownload = useCallback(async () => {
    if (!generatedContent) {
      setError('No content to download. Please generate the letter first.');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const response = await axios.post(
        'http://localhost:5000/api/download-ms-recommendation',
        formData,
        { responseType: 'blob' }
      );

      // Create download link
      const blob = new Blob([response.data], { 
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `MS_Recommendation_Letter_${formData.name.replace(/\s+/g, '_')}.docx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      setSuccess('Letter downloaded successfully!');
    } catch (error) {
      console.error('❌ Error downloading letter:', error);
      setError('Failed to download letter. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [formData, generatedContent]);

  // Handle step navigation
  const handleNext = () => {
    if (activeStep === 0) {
      if (!formData.name.trim()) {
        setError('Please enter the student name');
        return;
      }
    } else if (activeStep === 1) {
      if (!formData.title.trim()) {
        setError('Please enter the project title');
        return;
      }
      if (!formData.summary.trim()) {
        setError('Please enter the project summary');
        return;
      }
    }
    
    setActiveStep(prev => prev + 1);
    setError('');
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
    setError('');
  };

  const handleReset = () => {
    setFormData({
      name: '',
      title: '',
      summary: ''
    });
    setGeneratedContent('');
    setError('');
    setSuccess('');
    setActiveStep(0);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
            MS Recommendation Letter Generator
          </Typography>
        </Box>
        <Typography variant="body1" color="text.secondary">
          Generate professional MS recommendation letters using AI-powered content generation.
        </Typography>
      </Box>

      {/* Progress Stepper */}
      <Box sx={{ mb: 4 }}>
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>

      {/* Error/Success Messages */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {/* Main Content */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, gap: 4 }}>
        {/* Left Column - Form */}
        <Paper sx={{ p: 3 }}>
          {activeStep === 0 && (
            <Box>
              <Typography variant="h6" sx={{ mb: 3, color: 'primary.main' }}>
                Personal Information
              </Typography>
              
              <TextField
                fullWidth
                label="Student Name"
                value={formData.name}
                onChange={handleInputChange('name')}
                disabled={viewMode}
                margin="normal"
                placeholder="Enter the student's full name"
              />
              
              <Box sx={{ mt: 3, textAlign: 'center' }}>
                <Button
                  variant="contained"
                  onClick={handleNext}
                  disabled={!formData.name.trim()}
                  sx={{ minWidth: 200 }}
                >
                  NEXT: PROJECT DETAILS
                </Button>
              </Box>
            </Box>
          )}

          {activeStep === 1 && (
            <Box>
              <Typography variant="h6" sx={{ mb: 3, color: 'primary.main' }}>
                Project Details
              </Typography>
              
              <TextField
                fullWidth
                label="Project/Research Title"
                value={formData.title}
                onChange={handleInputChange('title')}
                disabled={viewMode}
                margin="normal"
                placeholder="Enter the project or research title"
              />
              
              <TextField
                fullWidth
                label="Project Summary"
                value={formData.summary}
                onChange={handleInputChange('summary')}
                disabled={viewMode}
                margin="normal"
                multiline
                rows={4}
                placeholder="Describe the project, research, or academic work..."
              />
              
              <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'center' }}>
                <Button variant="outlined" onClick={handleBack}>
                  BACK
                </Button>
                <Button
                  variant="contained"
                  onClick={handleNext}
                  disabled={!formData.title.trim() || !formData.summary.trim()}
                >
                  NEXT: PREVIEW
                </Button>
              </Box>
            </Box>
          )}

          {activeStep === 2 && (
            <Box>
              <Typography variant="h6" sx={{ mb: 3, color: 'primary.main' }}>
                Generate & Download
              </Typography>
              
              {!generatedContent && (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={generateMsRecommendation}
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={20} /> : <Send />}
                    sx={{ minWidth: 250 }}
                  >
                    {loading ? 'Generating...' : 'Generate Recommendation Letter'}
                  </Button>
                </Box>
              )}
              
              {generatedContent && (
                <Box sx={{ textAlign: 'center', py: 2 }}>
                  <Alert severity="success" sx={{ mb: 2 }}>
                    <CheckCircle sx={{ mr: 1 }} />
                    Letter generated successfully!
                  </Alert>
                  
                  <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                    <Button
                      variant="contained"
                      onClick={handleDownload}
                      disabled={loading}
                      startIcon={loading ? <CircularProgress size={20} /> : <Download />}
                    >
                      {loading ? 'Downloading...' : 'Download Letter'}
                    </Button>
                  </Box>
                </Box>
              )}
              
              <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'center' }}>
                <Button variant="outlined" onClick={handleBack}>
                  BACK
                </Button>
                {!viewMode && (
                  <Button variant="outlined" onClick={handleReset} color="secondary">
                    CREATE NEW
                  </Button>
                )}
              </Box>
            </Box>
          )}
        </Paper>

        {/* Right Column - Preview */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 3, color: 'primary.main', display: 'flex', alignItems: 'center' }}>
            <CheckCircle sx={{ mr: 1 }} />
            Preview
          </Typography>
          
          {generatedContent && activeStep >= 2 ? (
            <MsRecommendationPreview formData={formData} generatedContent={generatedContent} />
          ) : (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1.2rem' }}>
                Preview will appear here
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Complete the form steps and generate your recommendation letter to see the preview
              </Typography>
            </Box>
          )}
        </Paper>
      </Box>
    </Container>
  );
}

export default MsRecommendationForm;
