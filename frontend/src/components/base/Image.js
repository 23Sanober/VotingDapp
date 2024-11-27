import React from 'react';
import { Box } from '@mui/material';

const Image = ({ src, alt, sx, ...rest }) => (
  <Box component="img" src={src} alt={alt} sx={sx} {...rest} />
);

export default Image;