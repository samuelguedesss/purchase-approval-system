import { useState, useEffect } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  Divider,
  CircularProgress,
} from '@mui/material'
import {
  BusinessOutlined,
  AddBusinessOutlined,
} from '@mui/icons-material'
import apiBackend from '../service/apiBackend'

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

export default function DepartmentManagement() {
  const [name, setName] = useState('')
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(false)
  const [feedback, setFeedback] = useState(null)

  useEffect(() => {
    loadDepartments()
  }, [])

  async function loadDepartments() {
    try {
      const res = await apiBackend.get('/api/departments')
      setDepartments(res.data)
    } catch (err) {
      console.error('Erro ao buscar departamentos', err)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim()) {
      setFeedback({ type: 'error', message: 'Informe o nome do departamento.' })
      return
    }

    setLoading(true)
    try {
      await apiBackend.post('/api/departments', { name: name.trim() })
      setFeedback({ type: 'success', message: 'Departamento criado com sucesso!' })
      setName('')
      loadDepartments()
    } catch (err) {
      setFeedback({ type: 'error', message: err.response?.data?.error || 'Erro ao criar departamento.' })
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
                background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <AddBusinessOutlined sx={{ color: '#fff', fontSize: 20 }} />
            </Box>
            <Box>
              <Typography fontWeight={700} fontSize="1rem" color="#0f172a">
                Novo Departamento
              </Typography>
              <Typography variant="body2" color="text.secondary" fontSize="0.8rem">
                Cadastre os departamentos da empresa
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
            <TextField
              label="Nome do Departamento"
              value={name}
              onChange={(e) => { setName(e.target.value); setFeedback(null) }}
              fullWidth
              placeholder="Ex: Tecnologia da Informação"
              sx={fieldStyle}
            />

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
                background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                boxShadow: '0 4px 14px rgba(5, 150, 105, 0.3)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #047857 0%, #065f46 100%)',
                },
                '&:disabled': { background: '#e2e8f0', boxShadow: 'none' },
              }}
            >
              {loading ? <CircularProgress size={22} sx={{ color: '#fff' }} /> : 'Cadastrar Departamento'}
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
              <BusinessOutlined sx={{ color: '#fff', fontSize: 20 }} />
            </Box>
            <Box>
              <Typography fontWeight={700} fontSize="1rem" color="#0f172a">
                Departamentos
              </Typography>
              <Typography variant="body2" color="text.secondary" fontSize="0.8rem">
                Lista de departamentos cadastrados
              </Typography>
            </Box>
          </Box>
        </CardContent>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                {['#', 'Nome'].map((h) => (
                  <TableCell key={h}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {departments.map((d) => (
                <TableRow key={d.id}>
                  <TableCell>{d.id}</TableCell>
                  <TableCell>{d.name}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Box sx={{ px: 3, py: 1.5 }}>
          <Typography fontSize="0.75rem" color="#94a3b8">
            {departments.length} departamento(s)
          </Typography>
        </Box>
      </Card>
    </Box>
  )
}
