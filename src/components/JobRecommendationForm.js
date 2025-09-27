import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
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
import JobRecommendationPreview from './JobRecommendationPreview';
import { addJobRecommendationToHistory } from '../utils/jobRecommendationHistory';

function JobRecommendationForm() {
  const navigate = useNavigate();
  
  // Form data state
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    summary: ''
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
      setError('Please enter the candidate name');
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

  // Generate job recommendation letter
  const generateJobRecommendation = useCallback(async () => {
    if (!validateForm()) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      console.log('🔍 Sending request to generate job recommendation:', formData);
      
      const response = await axios.post(
        'http://localhost:5000/api/generate-job-recommendation',
        formData
      );

      console.log('✅ Backend response:', response.data);
      
      if (response.data.success) {
        setGeneratedContent(response.data.content);
        setSuccess('Job recommendation letter generated successfully!');
        setActiveStep(2);
        
        // Save to history
        const jobData = {
          candidateName: formData.name,
          projectTitle: formData.title,
          projectSummary: formData.summary,
          content: response.data.content,
          filename: `Job_Recommendation_Letter_${formData.name.replace(/\s+/g, '_')}.docx`,
          status: 'completed'
        };
        
        const savedJob = addJobRecommendationToHistory(jobData);
        if (savedJob) {
          console.log('✅ Job recommendation saved to history:', savedJob);
        }
      } else {
        setError(response.data.error || 'Failed to generate recommendation letter');
      }
    } catch (error) {
      console.error('❌ Error generating job recommendation:', error);
      setError(error.response?.data?.error || 'Failed to generate recommendation letter. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [formData]);

  // Download the generated document
  const handleDownload = async () => {
    if (!generatedContent) return;

    setLoading(true);
    setError('');

    try {
      console.log('🔍 Downloading job recommendation document...');
      
      const response = await axios.post(
        'http://localhost:5000/api/download-job-recommendation',
        {
          name: formData.name,
          title: formData.title,
          summary: formData.summary,
          content: generatedContent
        },
        {
          responseType: 'blob'
        }
      );

      // Create download link
      const blob = new Blob([response.data], { 
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
      });
      const url = window.URL.createObjectURL(blob);
      
      // Create temporary download link
      const link = document.createElement('a');
      link.href = url;
      link.download = `Job_Recommendation_Letter_${formData.name.replace(/\s+/g, '_')}.docx`;
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      setSuccess('Job recommendation letter downloaded successfully!');
    } catch (error) {
      console.error('❌ Error downloading document:', error);
      setError('Failed to download document. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Reset form
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
            Job Recommendation Letter Generator
          </Typography>
        </Box>
        <Typography variant="body1" color="text.secondary">
          Generate professional job recommendation letters using AI-powered content generation.
        </Typography>
      </Box>

      {/* Progress Stepper */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Paper>

      {/* Main Content - Two Column Layout */}
      <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', lg: 'row' } }}>
        {/* Left Column - Form */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          {/* Form Content Based on Current Step */}
      {activeStep === 0 && (
        <Paper sx={{ p: 4, mb: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
            Personal Information
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Candidate Name */}
            <TextField
              fullWidth
              label="Candidate Name"
              value={formData.name}
              onChange={handleInputChange('name')}
              placeholder="Enter the candidate's full name"
              variant="outlined"
              required
            />
          </Box>

          {/* Next Button */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Button
              variant="contained"
              onClick={() => {
                if (formData.name.trim()) {
                  setActiveStep(1);
                } else {
                  setError('Please enter the candidate name');
                }
              }}
              sx={{ minWidth: 150 }}
            >
              Next: Project Details
            </Button>
          </Box>
        </Paper>
      )}

      {activeStep === 1 && (
        <Paper sx={{ p: 4, mb: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
            Project Details
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Project Title */}
            <TextField
              fullWidth
              label="Project/Work Title"
              value={formData.title}
              onChange={handleInputChange('title')}
              placeholder="Enter the project or work title"
              variant="outlined"
              required
            />

            {/* Project Summary */}
            <TextField
              fullWidth
              label="Project Summary"
              value={formData.summary}
              onChange={handleInputChange('summary')}
              placeholder="Describe the candidate's project, achievements, and contributions..."
              variant="outlined"
              multiline
              rows={4}
              required
            />
          </Box>

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 2, mt: 4, justifyContent: 'center' }}>
            <Button
              variant="outlined"
              onClick={() => setActiveStep(0)}
              startIcon={<Edit />}
            >
              Back: Personal Info
            </Button>
            
            <Button
              variant="contained"
              onClick={() => {
                if (formData.title.trim() && formData.summary.trim()) {
                  setActiveStep(2);
                } else {
                  setError('Please fill in all project details');
                }
              }}
              sx={{ minWidth: 150 }}
            >
              Next: Generate & Download
            </Button>
          </Box>
        </Paper>
      )}

      {activeStep === 2 && (
        <Paper sx={{ p: 4, mb: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
            Review Information & Generate
          </Typography>

          {/* Review Section */}
          <Box sx={{ mb: 4, p: 3, bgcolor: 'grey.50', borderRadius: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
              Review Details:
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              <strong>Candidate Name:</strong> {formData.name}
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              <strong>Project Title:</strong> {formData.title}
            </Typography>
            <Typography variant="body2">
              <strong>Project Summary:</strong> {formData.summary}
            </Typography>
          </Box>

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button
              variant="outlined"
              onClick={() => setActiveStep(1)}
              disabled={loading}
            >
              Back: Project Details
            </Button>
            
            <Button
              variant="contained"
              onClick={generateJobRecommendation}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Send />}
              sx={{ minWidth: 200 }}
            >
              {loading ? 'Generating...' : 'Generate Recommendation'}
            </Button>
          </Box>
        </Paper>
      )}

        </Box>

        {/* Right Column - Preview */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          {/* Preview Section */}
          <Paper sx={{ p: 3, position: 'sticky', top: 20 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 3, display: 'flex', alignItems: 'center' }}>
              <CheckCircle sx={{ mr: 1, color: 'primary.main' }} />
              Preview
            </Typography>
            
            {generatedContent && activeStep >= 2 && (
              <Box sx={{ maxHeight: '70vh', overflow: 'auto' }}>
                <JobRecommendationPreview
                  content={generatedContent}
                  candidateName={formData.name}
                  projectTitle={formData.title}
                  projectSummary={formData.summary}
                />
              </Box>
            )}
            
            {/* Show placeholder when no content generated yet */}
            {!generatedContent && (
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center', 
                minHeight: 400,
                textAlign: 'center',
                p: 3
              }}>
                <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                  Preview will appear here
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Complete the form steps and generate your recommendation letter to see the preview
                </Typography>
              </Box>
            )}
          </Paper>
        </Box>
      </Box>

      {/* Generated Content Actions - Only show after step 2 completion */}
      {generatedContent && activeStep >= 2 && (
        <Paper sx={{ p: 4, mb: 3, mt: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 3, display: 'flex', alignItems: 'center' }}>
            <Download sx={{ mr: 1, color: 'success.main' }} />
            Download Your Recommendation Letter
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button
              variant="contained"
              color="success"
              onClick={handleDownload}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Download />}
              sx={{ minWidth: 200 }}
            >
              {loading ? 'Preparing Download...' : 'Download Word Document'}
            </Button>
          </Box>
        </Paper>
      )}

      {/* Messages */}
      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 2 }}
          icon={<ErrorIcon />}
        >
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert 
          severity="success" 
          sx={{ mb: 2 }}
          icon={<CheckCircle />}
        >
          {success}
        </Alert>
      )}

      {/* Preview Dialog */}
      <Dialog 
        open={previewOpen} 
        onClose={() => setPreviewOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Job Recommendation Letter Preview
        </DialogTitle>
        <DialogContent>
          <Box sx={{ 
            p: 2, 
            bgcolor: 'grey.50', 
            borderRadius: 1,
            border: '1px solid',
            borderColor: 'grey.200'
          }}>
            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
              {generatedContent}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewOpen(false)}>
            Close
          </Button>
          <Button 
            variant="contained" 
            onClick={handleDownload}
            disabled={loading}
            startIcon={<Download />}
          >
            Download
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default JobRecommendationForm;
