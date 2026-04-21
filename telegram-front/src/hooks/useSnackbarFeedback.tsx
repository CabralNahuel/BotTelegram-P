import { useCallback, useState } from 'react';
import Snackbar from '@mui/material/Snackbar';
import Alert, { AlertColor } from '@mui/material/Alert';

export function useSnackbarFeedback() {
  const [state, setState] = useState({
    open: false,
    message: '',
    severity: 'info' as AlertColor,
  });

  const notify = useCallback((message: string, severity: AlertColor = 'info') => {
    setState({ open: true, message, severity });
  }, []);

  const close = useCallback(() => {
    setState((s) => ({ ...s, open: false }));
  }, []);

  const SnackbarOutlet = () => (
    <Snackbar
      open={state.open}
      autoHideDuration={6000}
      onClose={close}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      <Alert onClose={close} severity={state.severity} variant="filled" sx={{ width: '100%' }}>
        {state.message}
      </Alert>
    </Snackbar>
  );

  return { notify, SnackbarOutlet };
}
