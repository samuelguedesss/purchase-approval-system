import { useState, useEffect } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  Divider,
  InputAdornment,
  CircularProgress,
  Chip,
} from '@mui/material'
import {
  PersonAddOutlined,
  PeopleOutlined,
} from '@mui/icons-material'
import apiBackend from '../service/apiBackend'

const ROLES = [
  { value: 'USER', label: 'Usuário' },
  { value: 'COORDINATOR', label: 'Coordenador' },
  { value: 'GENERAL_MANAGER', label: 'Gerente Geral' },
  { value: 'COORDINATION_FINANCE', label: 'Coordenação Financeira' },
]

const ROLE_COLOR = {
  USER: { color: '#64748b', bg: '#f1f5f9' },
  COORDINATOR: { color: '#2563eb', bg: '#dbeafe' },
  GENERAL_MANAGER: { color: '#7c3aed', bg: '#ede9fe' },
  COORDINATION_FINANCE: { color: '#059669', bg: '#d1fae5' },
}

const EMPTY_FORM = { name: '', email: '', password: '', role: '', department_id: '' }

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

export default function UserManagement() {
  const [form, setForm] = useState(EMPTY_FORM)
  const [users, setUsers] = useState([])
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(false)
  const [feedback, setFeedback] = useState(null)

  useEffect(() => {
    loadUsers()
    loadDepartments()
  }, [])

  async function loadUsers() {
    try {
      const res = await apiBackend.get('/api/users')
      setUsers(res.data)
    } catch (err) {
      console.error('Erro ao buscar usuários', err)
    }
  }

  async function loadDepartments() {
    try {
      const res = await apiBackend.get('/api/departments')
      setDepartments(res.data)
    } catch (err) {
      console.error('Erro ao buscar departamentos', err)
    }
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setFeedback(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.password || !form.role) {
      setFeedback({ type: 'error', message: 'Preencha todos os campos obrigatórios.' })
      return
    }

    setLoading(true)
    try {
      await apiBackend.post('/api/users', {
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
        department_id: form.department_id || null,
      })
      setFeedback({ type: 'success', message: 'Usuário criado com sucesso!' })
      setForm(EMPTY_FORM)
      loadUsers()
    } catch (err) {
      setFeedback({ type: 'error', message: err.response?.data?.error || 'Erro ao criar usuário.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Formulário */}
      <Card
        elevation={0}
        sx={{
          borderRadius: '20px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 24px rgba(0,0,0,0.05)',
        }}
      >
        <CardContent sx={{ p: { xs: 3, md: 4 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <PersonAddOutlined sx={{ color: '#fff', fontSize: 20 }} />
            </Box>
            <Box>
              <Typography fontWeight={700} fontSize="1rem" color="#0f172a">
                Novo Usuário
              </Typography>
              <Typography variant="body2" color="text.secondary" fontSize="0.8rem">
                Cadastre colaboradores no sistema
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ mb: 3, borderColor: '#f1f5f9' }} />

          {feedback && (
            <Alert
              severity={feedback.type}
              onClose={() => setFeedback(null)}
              sx={{ mb: 2.5, borderRadius: '10px', fontSize: '0.85rem' }}
            >
              {feedback.message}
            </Alert>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2.5 }}>
              <TextField label="Nome completo" name="name" value={form.name} onChange={handleChange} fullWidth sx={fieldStyle} />
              <TextField label="E-mail" name="email" type="email" value={form.email} onChange={handleChange} fullWidth sx={fieldStyle} />
              <TextField label="Senha" name="password" type="password" value={form.password} onChange={handleChange} fullWidth sx={fieldStyle} />
              <TextField select label="Perfil" name="role" value={form.role} onChange={handleChange} fullWidth sx={fieldStyle}>
                {ROLES.map((r) => (
                  <MenuItem key={r.value} value={r.value}>{r.label}</MenuItem>
                ))}
              </TextField>
              <Box sx={{ gridColumn: { xs: '1', sm: '1 / -1' } }}>
                <TextField select label="Departamento" name="department_id" value={form.department_id} onChange={handleChange} fullWidth sx={fieldStyle}>
                  <MenuItem value="">Nenhum</MenuItem>
                  {departments.map((d) => (
                    <MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>
                  ))}
                </TextField>
              </Box>
            </Box>

            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading}
              sx={{
                mt: 3,
                py: 1.4,
                borderRadius: '12px',
                fontWeight: 600,
                fontSize: '0.95rem',
                textTransform: 'none',
                background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
                boxShadow: '0 4px 14px rgba(124, 58, 237, 0.3)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #6d28d9 0%, #5b21b6 100%)',
                },
                '&:disabled': { background: '#e2e8f0', boxShadow: 'none' },
              }}
            >
              {loading ? <CircularProgress size={22} sx={{ color: '#fff' }} /> : 'Cadastrar Usuário'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Tabela */}
      <Card
        elevation={0}
        sx={{
          borderRadius: '20px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 24px rgba(0,0,0,0.05)',
        }}
      >
        <CardContent sx={{ p: { xs: 3, md: 4 }, pb: '0 !important' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <PeopleOutlined sx={{ color: '#fff', fontSize: 20 }} />
            </Box>
            <Box>
              <Typography fontWeight={700} fontSize="1rem" color="#0f172a">
                Usuários Cadastrados
              </Typography>
              <Typography variant="body2" color="text.secondary" fontSize="0.8rem">
                Lista de todos os colaboradores do sistema
              </Typography>
            </Box>
          </Box>
        </CardContent>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                {['Nome', 'E-mail', 'Perfil', 'Departamento'].map((h) => (
                  <TableCell key={h}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((u) => {
                const rc = ROLE_COLOR[u.role] || ROLE_COLOR.USER
                return (
                  <TableRow key={u.id}>
                    <TableCell>{u.name}</TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>
                      <Chip
                        label={ROLES.find((r) => r.value === u.role)?.label || u.role}
                        size="small"
                        sx={{
                          fontWeight: 600,
                          fontSize: '0.72rem',
                          color: rc.color,
                          backgroundColor: rc.bg,
                          borderRadius: '8px',
                          height: 24,
                        }}
                      />
                    </TableCell>
                    <TableCell>{u.department?.name || '—'}</TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </TableContainer>

        <Box sx={{ px: 3, py: 1.5 }}>
          <Typography fontSize="0.75rem" color="#94a3b8">
            {users.length} usuário(s) cadastrado(s)
          </Typography>
        </Box>
      </Card>
    </Box>
  )
}
