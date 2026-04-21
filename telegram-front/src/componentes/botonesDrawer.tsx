import React from 'react';
import { ListItem, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';

interface ListButtonProps {
    text: string;
    index: number;
    open: boolean;
    icon: React.ReactNode;
    onClick: () => void;
    color: string;
}

const BotonesDrawer: React.FC<ListButtonProps> = ({ text, open, icon, onClick, color }) => {
    return (
        <ListItem
            sx={{
                minWidth: open ? 'auto' : '50px',
                transition: (theme) => theme.transitions.create('min-width', {
                    easing: theme.transitions.easing.sharp,
                    duration: theme.transitions.duration.leavingScreen,
                }),
                width: '100%',
                textAlign: 'center',
                py: 0.5,
                justifyContent: 'center',
            }}
            key={text}
            disablePadding
        >
            <ListItemButton
                sx={{
                    color: 'var(--pba-texto-menu)',
                    minHeight: 52,
                    justifyContent: open ? 'center' : 'center',
                    px: 2,
                    py: 1.5,
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    borderRadius: 1,
                    gap: open ? 2 : 0,
                    fontSize: '1rem',
                    maxWidth: open ? 420 : undefined,
                    mx: open ? 'auto' : undefined,
                    '&:hover': {
                        backgroundColor: 'var(--pba-primary) !important',
                        color: '#fff',
                        '& .MuiListItemIcon-root': {
                            color: '#fff !important',
                        },
                    },
                    '&:focus-visible': {
                        outline: '2px solid var(--pba-primary)',
                        outlineOffset: 2,
                    },
                }}
                onClick={onClick}
            >
                <ListItemIcon
                    sx={{
                        minWidth: 0,
                        justifyContent: 'center',
                        color: color,
                    }}
                >
                    {icon}
                </ListItemIcon>
                <ListItemText
                    primary={text}
                    primaryTypographyProps={{
                        fontFamily: 'var(--font-primary)',
                        fontWeight: 600,
                        fontSize: '1rem',
                        sx: {
                            color: 'inherit',
                            textAlign: open ? 'center' : 'left',
                        },
                    }}
                    sx={{
                        opacity: open ? 1 : 0,
                        width: open ? 'auto' : 0,
                        overflow: 'hidden',
                        flex: open ? '0 1 auto' : 0,
                        m: 0,
                    }}
                />
            </ListItemButton>
        </ListItem>
    );
};

export default BotonesDrawer;
