import { useState } from 'react'
import apiBackend from '../service/apiBackend';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  InputAdornment,
  IconButton,
  Divider,
  Alert,
  CircularProgress,
} from '@mui/material'
import {
  Visibility,
  VisibilityOff,
  LockOutlined,
  EmailOutlined,
} from '@mui/icons-material'

export default function Login({ onSuccess }) {
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ email: '', password: '' })

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await apiBackend.post('/api/login', {
        email: form.email,
        password: form.password,
      })

      const data = response.data
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data))

      if (onSuccess) onSuccess(data)
        
    } catch (error) {
      const message = error.response?.data?.message || 'Erro ao realizar login'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #e8edf2 100%)',
        px: 2,
      }}
    >
      <Box sx={{ width: '100%', maxWidth: 420 }}>
        {/* Logo / Marca */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Box
            sx={{
              width: 52,
              height: 52,
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 2,
              boxShadow: '0 4px 14px rgba(37, 99, 235, 0.3)',
            }}
          >
            <LockOutlined sx={{ color: '#fff', fontSize: 26 }} />
          </Box>
          <Typography
            variant="h5"
            fontWeight={700}
            color="#0f172a"
            letterSpacing="-0.5px"
          >
            Sistema de Aprovação
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={0.5}>
            Entre com suas credenciais para continuar
          </Typography>
        </Box>

        {/* Card */}
        <Card
          elevation={0}
          sx={{
            borderRadius: '20px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <form onSubmit={handleSubmit} noValidate>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>

                {error && (
                  <Alert
                    severity="error"
                    sx={{ borderRadius: '10px', fontSize: '0.85rem' }}
                  >
                    {error}
                  </Alert>
                )}

                <TextField
                  label="E-mail"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  autoComplete="email"
                  fullWidth
                  size="medium"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailOutlined sx={{ color: '#94a3b8', fontSize: 20 }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={fieldStyle}
                />

                <TextField
                  label="Senha"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                  fullWidth
                  size="medium"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockOutlined sx={{ color: '#94a3b8', fontSize: 20 }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          size="small"
                          tabIndex={-1}
                        >
                          {showPassword ? (
                            <VisibilityOff sx={{ fontSize: 20, color: '#94a3b8' }} />
                          ) : (
                            <Visibility sx={{ fontSize: 20, color: '#94a3b8' }} />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={fieldStyle}
                />

                <Box sx={{ textAlign: 'right', mt: -1 }}>
                  <Typography
                    variant="body2"
                    color="#2563eb"
                    sx={{
                      cursor: 'pointer',
                      fontWeight: 500,
                      '&:hover': { textDecoration: 'underline' },
                    }}
                  >
                    Esqueceu a senha?
                  </Typography>
                </Box>

                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={loading}
                  sx={{
                    mt: 0.5,
                    py: 1.4,
                    borderRadius: '12px',
                    fontWeight: 600,
                    fontSize: '0.95rem',
                    textTransform: 'none',
                    background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                    boxShadow: '0 4px 14px rgba(37, 99, 235, 0.35)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)',
                      boxShadow: '0 6px 18px rgba(37, 99, 235, 0.4)',
                    },
                    '&:disabled': {
                      background: '#e2e8f0',
                      boxShadow: 'none',
                    },
                  }}
                >
                  {loading ? (
                    <CircularProgress size={22} sx={{ color: '#fff' }} />
                  ) : (
                    'Entrar'
                  )}
                </Button>
              </Box>
            </form>

            <Divider sx={{ my: 3, borderColor: '#f1f5f9' }} />

            <Typography
              variant="body2"
              color="text.secondary"
              textAlign="center"
              fontSize="0.8rem"
            >
              Problemas para acessar?{' '}
              <Typography
                component="span"
                variant="body2"
                color="#2563eb"
                fontWeight={500}
                fontSize="0.8rem"
                sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
              >
                Fale com o suporte
              </Typography>
            </Typography>
          </CardContent>
        </Card>

        <Typography
          variant="body2"
          color="#94a3b8"
          textAlign="center"
          mt={3}
          fontSize="0.75rem"
        >
          © {new Date().getFullYear()} Sistema de Aprovação. Todos os direitos reservados.
        </Typography>
      </Box>
    </Box>
  )
}

const fieldStyle = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '12px',
    backgroundColor: '#fafafa',
    '& fieldset': { borderColor: '#e2e8f0' },
    '&:hover fieldset': { borderColor: '#cbd5e1' },
    '&.Mui-focused fieldset': { borderColor: '#2563eb', borderWidth: '1.5px' },
  },
  '& .MuiInputLabel-root.Mui-focused': { color: '#2563eb' },
}
