import { useState } from 'react';
import { Box, Typography, Paper, Button } from '@mui/material';
import { OptimizedImage } from '../utils/imageUtils';
import { getImageUrl } from '../utils/imageUtils';

const ImageDebugger = ({ src, alt = "Debug Image", title = "Image Debug" }) => {
    const [showDetails, setShowDetails] = useState(false);

    if (!src) return null;

    const processedUrl = getImageUrl(src);

    return (
        <Paper sx={{ p: 2, m: 1, border: '1px solid #ddd' }}>
            <Typography variant="h6" gutterBottom>
                {title}
            </Typography>

            <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                {/* Image Display */}
                <Box sx={{ minWidth: 200 }}>
                    <Typography variant="subtitle2" gutterBottom>
                        Rendered Image:
                    </Typography>
                    <Box sx={{
                        width: 150,
                        height: 150,
                        border: '1px solid #ccc',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: '#f5f5f5'
                    }}>
                        <OptimizedImage
                            src={src}
                            alt={alt}
                            style={{
                                maxWidth: '100%',
                                maxHeight: '100%',
                                objectFit: 'contain',
                            }}
                            debug={true}
                        />
                    </Box>
                </Box>

                {/* Debug Info */}
                <Box sx={{ flex: 1 }}>
                    <Button
                        variant="outlined"
                        size="small"
                        onClick={() => setShowDetails(!showDetails)}
                        sx={{ mb: 1 }}
                    >
                        {showDetails ? 'Hide' : 'Show'} Details
                    </Button>

                    {showDetails && (
                        <Box sx={{ fontSize: '0.8rem', fontFamily: 'monospace' }}>
                            <Typography variant="subtitle2">Original src:</Typography>
                            <Typography sx={{
                                wordBreak: 'break-all',
                                backgroundColor: '#f0f0f0',
                                p: 1,
                                borderRadius: 1,
                                mb: 1
                            }}>
                                {src}
                            </Typography>

                            <Typography variant="subtitle2">Processed URL:</Typography>
                            <Typography sx={{
                                wordBreak: 'break-all',
                                backgroundColor: '#f0f0f0',
                                p: 1,
                                borderRadius: 1,
                                mb: 1
                            }}>
                                {processedUrl}
                            </Typography>

                            <Typography variant="subtitle2">URL Type:</Typography>
                            <Typography sx={{ mb: 1 }}>
                                {src.startsWith('https://res.cloudinary.com/') ? 'Cloudinary URL' :
                                    src.startsWith('http') ? 'Full HTTP URL' :
                                        'Relative Path'}
                            </Typography>

                            <Button
                                variant="outlined"
                                size="small"
                                onClick={() => window.open(processedUrl, '_blank')}
                            >
                                Test URL in New Tab
                            </Button>
                        </Box>
                    )}
                </Box>
            </Box>
        </Paper>
    );
};

export default ImageDebugger;