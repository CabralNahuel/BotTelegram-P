import { Box, IconButton, Stack, Typography } from '@mui/material';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import GitHubIcon from '@mui/icons-material/GitHub';
import EmailIcon from '@mui/icons-material/Email';
import logoPrincipal from '../assets/Logo/logoPrincipal.png';

const LINKEDIN_URL = 'https://www.linkedin.com/in/cabralnahuel';
const GITHUB_URL = 'https://github.com/cabralnahuel';
const EMAIL = 'cabralnahuel.dev@gmail.com';

export default function FooterLogo() {
  return (
    <Box
      component="footer"
      sx={{
        display: 'flex',
        flexShrink: 0,
        width: '100%',
        minHeight: { xs: '120px', sm: '100px' },
        alignItems: 'center',
        justifyContent: 'center',
        px: 2,
        py: 2.5,
        mt: 'auto',
        borderTop: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
      }}
    >
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={{ xs: 2, sm: 3 }}
        alignItems="center"
        justifyContent="center"
        sx={{ maxWidth: 720, width: '100%' }}
      >
        <Box
          sx={{
            width: 72,
            height: 72,
            flexShrink: 0,
            borderRadius: '50%',
            overflow: 'hidden',
            bgcolor: 'background.default',
            border: '2px solid',
            borderColor: 'divider',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 1px 3px rgba(0,0,0,0.35)',
          }}
        >
          <Box
            component="img"
            src={logoPrincipal}
            alt="Logo"
            sx={{
              width: '78%',
              height: '78%',
              objectFit: 'contain',
            }}
          />
        </Box>

        <Stack spacing={1} alignItems={{ xs: 'center', sm: 'flex-start' }} sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
          <Typography variant="caption" color="text.secondary" sx={{ letterSpacing: '0.02em' }}>
            © {new Date().getFullYear()} Cabral Nahuel
          </Typography>
          <Stack direction="row" spacing={0.5} justifyContent={{ xs: 'center', sm: 'flex-start' }}>
            <IconButton
              component="a"
              href={LINKEDIN_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn de Cabral Nahuel"
              size="small"
              sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main' } }}
            >
              <LinkedInIcon fontSize="small" />
            </IconButton>
            <IconButton
              component="a"
              href={`mailto:${EMAIL}`}
              aria-label={`Enviar correo a ${EMAIL}`}
              size="small"
              sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main' } }}
            >
              <EmailIcon fontSize="small" />
            </IconButton>
            <IconButton
              component="a"
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub de Cabral Nahuel"
              size="small"
              sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main' } }}
            >
              <GitHubIcon fontSize="small" />
            </IconButton>
          </Stack>
        </Stack>
      </Stack>
    </Box>
  );
}
