import React, { useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import PropTypes from 'prop-types';
import { twMerge } from 'tailwind-merge';
import { useTheme } from '@mui/material/styles';
import { Close } from '@mui/icons-material';
import { Box, Typography, IconButton, Button } from '@mui/material';

function NotificationModal({ isOpen, onClose, title, message, type = 'info', children }) {
  const theme = useTheme();

  const handleEscape = useCallback(
    (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    } else {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleEscape]);

  const typeStyles = {
    info: { color: theme.palette.info.main, icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
    success: { color: theme.palette.success.main, icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
    error: { color: theme.palette.error.main, icon: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z' },
    warning: { color: theme.palette.warning.main, icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' },
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <Box
          component={motion.div}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(4px)',
            zIndex: 1300, // Higher than MUI Dialog default
            fontFamily: theme.typography.fontFamily,
            p: 2,
          }}
        >
          <Box
            component={motion.div}
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            sx={{
              bgcolor: theme.palette.background.paper,
              color: theme.palette.text.primary,
              borderRadius: 2,
              boxShadow: theme.shadows[10],
              p: 3,
              width: '100%',
              maxWidth: 400,
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <IconButton
              onClick={onClose}
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                color: theme.palette.text.secondary,
                '&:hover': { color: theme.palette.text.primary },
              }}
              aria-label="Close notification"
            >
              <Close sx={{ fontSize: 24 }} />
            </IconButton>

            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 2 }}>
              {typeStyles[type]?.icon && (
                <Box sx={{ color: typeStyles[type].color }}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-10 w-10"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d={typeStyles[type].icon} />
                  </svg>
                </Box>
              )}
              {title && (
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 'bold', color: theme.palette.text.primary, fontSize: { xs: '1rem', sm: '1.25rem' } }}
                >
                  {title}
                </Typography>
              )}
              {message && (
                <Typography
                  variant="body2"
                  sx={{ color: theme.palette.text.secondary, fontSize: { xs: '0.875rem', sm: '1rem' } }}
                >
                  {message}
                </Typography>
              )}
              {children}
              <Button
                onClick={onClose}
                variant="contained"
                sx={{
                  bgcolor: typeStyles[type].color,
                  color: theme.palette.getContrastText(typeStyles[type].color),
                  '&:hover': { bgcolor: theme.palette[type].dark || typeStyles[type].color },
                  borderRadius: 1,
                  px: 3,
                  py: 1,
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                  textTransform: 'none',
                  mt: 1,
                }}
              >
                OK
              </Button>
            </Box>
          </Box>
        </Box>
      )}
    </AnimatePresence>,
    document.body
  );
}

NotificationModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string,
  message: PropTypes.string,
  type: PropTypes.oneOf(['info', 'success', 'error', 'warning']),
  children: PropTypes.node,
};

export default NotificationModal;