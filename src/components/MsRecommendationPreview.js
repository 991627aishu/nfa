import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const MsRecommendationPreview = ({ formData, generatedContent }) => {
  if (!generatedContent && !formData.name) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center', minHeight: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1.2rem' }}>
          Preview will appear here
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          Complete the form steps and generate your recommendation letter to see the preview
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 4, minHeight: 600, backgroundColor: '#fafafa' }}>
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2, color: 'primary.main' }}>
          Letter of Recommendation
        </Typography>
      </Box>

      {/* Contact Information */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
          Dr. Phani Kumar Pullela<br />
          Professor & Associate Dean<br />
          RV University<br />
          Email: phanikumarp@rvu.edu.in<br />
          Phone: +91-9902005868
        </Typography>
      </Box>

      {/* Subject */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
          <strong>Subject:</strong> Recommendation Letter for {formData.name || '[Student Name]'}
        </Typography>
      </Box>

      {/* Greeting */}
      <Box sx={{ textAlign: 'center', mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          To Whomsoever It May Concern
        </Typography>
      </Box>

      {/* Main Content */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="body1" sx={{ 
          lineHeight: 1.8, 
          textAlign: 'justify',
          fontSize: '1rem',
          fontFamily: 'Times New Roman, serif'
        }}>
          {generatedContent || (
            <>
              I am writing to wholeheartedly recommend {formData.name || '[Student Name]'} for admission to your esteemed Master's program. Having had the privilege of working closely with {formData.name || 'this student'} during their academic journey at RV University, I can confidently attest to their exceptional academic abilities, strong work ethic, and potential for success in graduate studies.
              <br /><br />
              Their significant contributions to "{formData.title || '[Project Title]'}" have been commendable. {formData.name || 'This student'} demonstrated remarkable dedication, analytical thinking, and problem-solving skills throughout the project. Their ability to work independently while also contributing effectively to team efforts has been impressive.
              <br /><br />
              {formData.summary || '[Project Summary - AI-generated content will appear here]'}
              <br /><br />
              In summary, {formData.name || 'this student'} is a student of exceptional talent and dedication who would be a valuable addition to your Master's program. I have no doubt that they will excel in their graduate studies and make significant contributions to their field.
            </>
          )}
        </Typography>
      </Box>

      {/* Signature */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="body1" sx={{ lineHeight: 1.6, textAlign: 'justify' }}>
          Sincerely,<br />
          Dr. Phani Kumar Pullela<br />
          Professor & Associate Dean<br />
          RV University
        </Typography>
      </Box>

      {/* Footer Note */}
      <Box sx={{ mt: 4, pt: 2, borderTop: '1px solid #e0e0e0' }}>
        <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center', display: 'block' }}>
          This is a preview of the generated recommendation letter. The actual document will include proper formatting and institutional branding.
        </Typography>
      </Box>
    </Paper>
  );
};

export default MsRecommendationPreview;
