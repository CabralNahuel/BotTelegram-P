import React from 'react';
import { ListItem, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';

interface ListButtonProps {
  text: string;
  /** Conservado por compatibilidad con otras pantallas que reutilizan el componente. */
  index?: number;
  open: boolean;
  icon: React.ReactNode;
  onClick: () => void;
  color: string;
}

const BotonesDrawer: React.FC<ListButtonProps> = ({ text, open, icon, onClick, color }) => {
  return (
    <ListItem
      disablePadding
      sx={{
        width: '100%',
        minWidth: 0,
        height: '100%',
        display: 'flex',
        alignItems: 'stretch',
        justifyContent: 'center',
      }}
    >
      <ListItemButton
        onClick={onClick}
        sx={{
          width: '100%',
          maxWidth: { xs: '100%', md: 200, lg: 220 },
          height: '100%',
          minHeight: 0,
          aspectRatio: 1,
          textAlign: 'center',
          mx: 'auto',
          display: 'grid',
          gridAutoFlow: 'row',
          alignContent: 'center',
          justifyContent: 'center',
          rowGap: 1,
          px: 1.5,
          py: 1.5,
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.default',
          boxSizing: 'border-box',
          boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
          '&:hover': {
            borderColor: 'primary.main',
            bgcolor: (theme) => theme.palette.action.hover,
            '& .MuiListItemIcon-root': {
              color: `${color} !important`,
            },
          },
          '&:focus-visible': {
            outline: '2px solid',
            outlineColor: 'primary.main',
            outlineOffset: 2,
          },
          '& .MuiListItemIcon-root, & .MuiListItemText-root': {
            m: 0,
          },
        }}
      >
        <ListItemIcon
          sx={{
            minWidth: 0,
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            color,
            '& .MuiSvgIcon-root': {
              fontSize: { xs: 28, sm: 32 },
            },
          }}
        >
          {icon}
        </ListItemIcon>
        <ListItemText
          primary={text}
          primaryTypographyProps={{
            fontFamily: 'var(--font-primary)',
            fontWeight: 600,
            fontSize: { xs: '0.8125rem', sm: '0.875rem' },
            textAlign: 'center',
            lineHeight: 1.25,
            sx: {
              width: '100%',
              display: 'block',
              color: 'text.primary',
              opacity: open ? 1 : 0,
              maxHeight: open ? 'none' : 0,
              overflow: 'hidden',
            },
          }}
          sx={{ m: 0, width: '100%', display: 'flex', justifyContent: 'center' }}
        />
      </ListItemButton>
    </ListItem>
  );
};

export default BotonesDrawer;
