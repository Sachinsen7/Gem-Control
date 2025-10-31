import { useState } from 'react';
import { Box, Button, Typography, Paper } from '@mui/material';
import { OptimizedImage } from '../utils/imageUtils';

const ImageTest = () => {
    const [testUrls] = useState([
        'https://res.cloudinary.com/demo/image/upload/sample.jpg', // Test Cloudinary URL
        '/fallback-image.png', // Local fallback
        'invalid-url', // Should fail and show fallback
    ]);

    return (
        <Paper sx={{ p: 2, m: 2 }}>
            <Typography variant="h6" gutterBottom>
                Image Loading Test
            </Typography>

            {testUrls.map((url, index) => (
                <Box key={index} sx={{ mb: 2 }}>
                    <Typography variant="body2" gutterBottom>
                        Test {index + 1}: {url}
                    </Typography>
                    <Box sx={{ width: 200, height: 150, border: '1px solid #ccc' }}>
                        <OptimizedImage
                            src={url}
                            alt={`Test image ${index + 1}`}
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'contain',
                            }}
                            debug={true}
                            showSkeleton={true}
                        />
                    </Box>
                </Box>
            ))}
        </Paper>
    );
};

export default ImageTest;