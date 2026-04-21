import * as React from 'react';
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import MuiDrawer from '@mui/material/Drawer';
import MuiAppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import './styles.css';
import BotonesDrawer from './botonesDrawer';
import Bienvenida from './bienvenida';
import KeyIcon from '@mui/icons-material/Key';
import AddHomeIcon from '@mui/icons-material/AddHome';
import AutoAwesomeMosaicIcon from '@mui/icons-material/AutoAwesomeMosaic';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { useNavigate } from 'react-router-dom';
import { InsertChartOutlined } from '@mui/icons-material';
import FooterLogo from './footerLogo';

/** Token, Usuario y Datos van por ruta: evita montar la página completa dentro del home (título y footer duplicados). */
const items: {
  text: string;
  icon: React.ReactNode;
  color: string;
  path?: string;
  component?: React.ReactNode;
}[] = [
  { text: 'Bienvenida', icon: <AddHomeIcon />, component: <Bienvenida />, color: 'var(--color8)' },
  { text: 'Menu', icon: <AutoAwesomeMosaicIcon />, path: '/menu', color: 'var(--color11)' },
  { text: 'Token', icon: <KeyIcon />, path: '/token', color: 'var(--color6)' },
  { text: 'Usuario', icon: <AccountCircleIcon />, path: '/usuario', color: 'var(--color5)' },
  { text: 'Datos', icon: <InsertChartOutlined />, path: '/datos', color: 'var(--color3)' },
];

export default function DrawerN() {
    const theme = useTheme();
    const [open, setOpen] = React.useState(false);
    const [selectedComponent, setSelectedComponent] = React.useState<React.ReactNode>(<Bienvenida />);
    const [titulos, setTitulos] = React.useState<string>('Bienvenida');
    const navigate = useNavigate();

    const handleDrawerOpen = () => {
        setOpen(true);
    };

    const handleDrawerClose = () => {
        setOpen(false);
    };

    const handleListItemClick = (text: string, component?: React.ReactNode, path?: string) => {
        setTitulos(text);
        if (path) {
            navigate(path);
        } else if (component) {
            setSelectedComponent(component);
        }
        handleDrawerClose();
    };

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', maxHeight: '100vh', background: 'var(--pba-bg-pagina)' }}>
            <MuiAppBar
                position="fixed"
                elevation={0}
                sx={{
                    backgroundColor: 'var(--pba-header-bg)',
                    borderBottom: '1px solid var(--pba-gris-claro)',
                    color: 'var(--pba-secondary)',
                    zIndex: theme.zIndex.drawer + 1,
                }}
            >
                <Toolbar sx={{ justifyContent: 'space-between', minHeight: { xs: 56, sm: 64 }, px: { xs: 1, sm: 2 } }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1, minWidth: 0 }}>
                        <IconButton
                            aria-label="Abrir menú de navegación"
                            onClick={handleDrawerOpen}
                            edge="start"
                            sx={{
                                color: 'var(--pba-secondary)',
                                '&:hover': { backgroundColor: 'var(--pba-secondary)', color: '#fff' },
                                ...(open && { display: 'none' }),
                            }}
                        >
                            <MenuIcon />
                        </IconButton>
                        <Box sx={{ display: 'flex', alignItems: 'center',justifyContent: 'center', gap: 1.5, minWidth: 0 }}>
                          
                            <Typography variant="h6" component="span" noWrap sx={{ fontFamily: 'var(--font-primary)', fontWeight: 800, color: 'var(--pba-primary)', fontSize: { xs: '1rem', sm: '1.125rem' } }}>
                                Telegram Bot
                            </Typography>
                        </Box>
                    </Box>
                </Toolbar>
            </MuiAppBar>

            <MuiDrawer
                variant="temporary"
                anchor="left"
                open={open}
                onClose={handleDrawerClose}
                ModalProps={{
                    keepMounted: true,
                }}
                PaperProps={{
                    sx: {
                        width: '100vw',
                        maxWidth: '100%',
                        minWidth: '100%',
                        height: '100%',
                        minHeight: '100vh',
                        maxHeight: 'none',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'stretch',
                        bgcolor: 'var(--pba-header-bg)',
                        boxSizing: 'border-box',
                        overflow: 'hidden',
                    },
                }}
                sx={{
                    zIndex: theme.zIndex.modal,
                    '& .MuiDrawer-paper': {
                        width: '100vw',
                        maxWidth: '100vw',
                    },
                    '& .MuiBackdrop-root': {
                        backgroundColor: 'rgba(65, 64, 66, 0.5)',
                    },
                }}
            >
                {/* Franja superior: todo el ancho en cyan + safe area (evita banda blanca en iOS) */}
                <Box
                    sx={{
                        width: '100%',
                        flexShrink: 0,
                        bgcolor: 'var(--pba-primary)',
                        pt: 'env(safe-area-inset-top, 0px)',
                    }}
                >
                    <Box
                        component="header"
                        sx={{
                            minHeight: { xs: 56, sm: 64 },
                            width: '100%',
                            maxWidth: '100%',
                            px: { xs: 1, sm: 2 },
                            bgcolor: 'var(--pba-primary)',
                            color: '#fff',
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: 1,
                            boxSizing: 'border-box',
                            borderBottom: '1px solid rgba(255,255,255,0.2)',
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0, flex: '1 1 auto' }}>
                            <Box
                                sx={{
                                    height: 40,
                                    display: 'flex',
                                    alignItems: 'center',
                                    flexShrink: 0,
                                }}
                            >
                            </Box>
                            <Typography
                                variant="subtitle1"
                                noWrap
                                sx={{
                                    color: '#fff',
                                    fontWeight: 700,
                                    fontFamily: 'var(--font-primary)',
                                    fontSize: { xs: '1rem', sm: '1.0625rem' },
                                }}
                            >
                                Telegram Bot
                            </Typography>
                        </Box>
                        <IconButton
                            aria-label="Cerrar menú"
                            onClick={handleDrawerClose}
                            size="medium"
                            sx={{
                                flexShrink: 0,
                                color: '#fff',
                                bgcolor: 'rgba(255,255,255,0.12)',
                                border: '1px solid rgba(255,255,255,0.35)',
                                '&:hover': { bgcolor: 'rgba(255,255,255,0.25)' },
                            }}
                        >
                            <CloseIcon />
                        </IconButton>
                    </Box>
                </Box>

                <Box
                    sx={{
                        flex: 1,
                        minHeight: 0,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        px: 2,
                        py: 3,
                    }}
                >
                    <List
                        sx={{
                            width: '100%',
                            maxWidth: 420,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'stretch',
                            justifyContent: 'space-around',
                            height: '100%',
                            
                            gap: 0.5,
                        }}
                    >
                        {items.map((item, index) => (
                            <BotonesDrawer
                                color={item.color}
                                key={item.text}
                                text={item.text}
                                index={index}
                                open={open}
                                icon={item.icon}
                                onClick={() =>
                                    handleListItemClick(item.text, item.component, item.path)
                                }
                            />
                        ))}
                    </List>
                </Box>
                <Divider />
            </MuiDrawer>

            <Box
                component="main"
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    flex: 1,
                    minHeight: 0,
                    overflow: 'hidden',
                    width: '100%',
                    alignItems: 'stretch',
                    transition: theme.transitions.create('margin', {
                        easing: theme.transitions.easing.sharp,
                        duration: theme.transitions.duration.enteringScreen,
                    }),
                }}
            >
                <Box
                    sx={{
                        flex: 1,
                        minHeight: 0,
                        overflow: 'auto',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        px: { xs: 1.5, sm: 3 },
                        pb: 1,
                    }}
                >
                    <Box sx={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',marginTop:'4rem' }}>
                        <Typography variant="h4" component="h2" marginTop={'4rem'} sx={{ fontFamily: 'var(--font-primary)', fontWeight: 700, color: 'var(--pba-primary)' }}>
                            {titulos}
                        </Typography>
                    </Box>
                    <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto', display: 'flex', justifyContent: 'center', marginLeft: 2, marginRight: 2, width: '100%' }}>
                        {selectedComponent}
                    </Box>
                </Box>
                <FooterLogo />
            </Box>
        </Box>
    );
}
