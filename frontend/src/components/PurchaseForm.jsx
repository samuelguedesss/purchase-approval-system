import { useState } from 'react'
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  MenuItem,
  InputAdornment,
  CircularProgress,
  Alert,
  Divider,
} from '@mui/material'
import {
  ShoppingCartOutlined,
  DescriptionOutlined,
  AttachMoneyOutlined,
  Inventory2Outlined,
  PaymentOutlined,
  AddCircleOutline,
} from '@mui/icons-material'
import apiBackend from '../service/apiBackend'

const PAYMENT_METHODS = [
  { value: 'PIX', label: 'Pix' },
  { value: 'CREDIT_CARD', label: 'Cartão de Crédito' },
  { value: 'DEBIT_CARD', label: 'Cartão Corporativo' },
  { value: 'BOLETO', label: 'Boleto Bancário' },
  { value: 'TRANSFER', label: 'Transferência Bancária' },
]

const EMPTY_FORM = {
  product_name: '',
  quantity: '',
  unit_price: '',
  payment_method: '',
  description: '',
}

export default function PurchaseForm({ onCreated }) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const totalAmount = (Number(form.unit_price) || 0) * (Number(form.quantity) || 0)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError('')
    setSuccess(false)
  }



  const validate = () => {
    if (!form.product_name.trim()) return 'Informe o nome do produto.'
    if (!form.quantity || Number(form.quantity) < 1) return 'Informe uma quantidade válida.'
    if (!form.unit_price || Number(form.unit_price) <= 0) return 'Informe o valor unitário.'
    if (!form.payment_method) return 'Selecione a forma de pagamento.'
    if (!form.description.trim()) return 'Informe a descrição da solicitação.'
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const err = validate()
    if (err) { setError(err); return }

    setLoading(true)
    setError('')

    try {
      const token = localStorage.getItem('token')

      await apiBackend.post('/api/purchase-requests', {
        product_name: form.product_name,
        quantity: Number(form.quantity),
        unit_price: Number(form.unit_price),
        payment_method: form.payment_method,
        description: form.description,
      })

      setSuccess(true)
      setForm(EMPTY_FORM)
      if (onCreated) onCreated()

    } catch (error) {
      const message = error.response?.data?.error || 'Erro ao criar solicitação'
      setError(message)
    } finally {
      setLoading(false)
    }
  }


  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: '20px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 4px 24px rgba(0,0,0,0.05)',
      }}
    >
      <CardContent sx={{ p: { xs: 3, md: 4 } }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 10px rgba(37,99,235,0.25)',
            }}
          >
            <ShoppingCartOutlined sx={{ color: '#fff', fontSize: 20 }} />
          </Box>
          <Box>
            <Typography fontWeight={700} fontSize="1rem" color="#0f172a" lineHeight={1.2}>
              Nova Solicitação
            </Typography>
            <Typography variant="body2" color="text.secondary" fontSize="0.8rem">
              Preencha os dados para gerar o termo de aprovação
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ mb: 3, borderColor: '#f1f5f9' }} />

        {success && (
          <Alert severity="success" sx={{ mb: 2.5, borderRadius: '10px', fontSize: '0.85rem' }}>
            Solicitação gerada com sucesso! Aguarde a aprovação.
          </Alert>
        )}
        {error && (
          <Alert severity="error" sx={{ mb: 2.5, borderRadius: '10px', fontSize: '0.85rem' }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2.5 }}>

            {/* Nome do Produto */}
            <Box sx={{ gridColumn: { xs: '1', sm: '1 / -1' } }}>
              <TextField
                label="Nome do Produto"
                name="product_name"
                value={form.product_name}
                onChange={handleChange}
                fullWidth
                placeholder="Ex: Notebook Dell Inspiron 15"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Inventory2Outlined sx={{ color: '#94a3b8', fontSize: 20 }} />
                    </InputAdornment>
                  ),
                }}
                sx={fieldStyle}
              />
            </Box>

            {/* Quantidade */}
            <TextField
              label="Quantidade"
              name="quantity"
              type="number"
              value={form.quantity}
              onChange={handleChange}
              fullWidth
              inputProps={{ min: 1 }}
              placeholder="1"
              sx={fieldStyle}
            />

            {/* Valor Unitário */}
            <TextField
              label="Valor Unitário (R$)"
              name="unit_price"
              type="number"
              value={form.unit_price}
              onChange={handleChange}
              fullWidth
              placeholder="0,00"
              inputProps={{ min: 0, step: '0.01' }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <AttachMoneyOutlined sx={{ color: '#94a3b8', fontSize: 20 }} />
                  </InputAdornment>
                ),
              }}
              sx={fieldStyle}
            />

            {/* Valor Total (calculado) */}
            <Box sx={{ gridColumn: { xs: '1', sm: '1 / -1' } }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  px: 2.5,
                  py: 1.8,
                  borderRadius: '12px',
                  backgroundColor: totalAmount > 0 ? '#eff6ff' : '#f8fafc',
                  border: `1.5px ${totalAmount > 0 ? 'solid #bfdbfe' : 'dashed #e2e8f0'}`,
                  transition: 'all 0.2s',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AttachMoneyOutlined sx={{ fontSize: 18, color: totalAmount > 0 ? '#2563eb' : '#94a3b8' }} />
                  <Typography fontSize="0.85rem" fontWeight={600} color={totalAmount > 0 ? '#2563eb' : '#94a3b8'}>
                    Valor Total
                  </Typography>
                </Box>
                <Typography fontSize="1.1rem" fontWeight={800} color={totalAmount > 0 ? '#1d4ed8' : '#cbd5e1'}>
                  {totalAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </Typography>
              </Box>
            </Box>

            {/* Forma de Pagamento */}
            <Box sx={{ gridColumn: { xs: '1', sm: '1 / -1' } }}>
              <TextField
                select
                label="Forma de Pagamento"
                name="payment_method"
                value={form.payment_method}
                onChange={handleChange}
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PaymentOutlined sx={{ color: '#94a3b8', fontSize: 20 }} />
                    </InputAdornment>
                  ),
                }}
                sx={fieldStyle}
              >
                {PAYMENT_METHODS.map((m) => (
                  <MenuItem key={m.value} value={m.value}>
                    {m.label}
                  </MenuItem>
                ))}
              </TextField>
            </Box>

            {/* Descrição */}
            <Box sx={{ gridColumn: { xs: '1', sm: '1 / -1' } }}>
              <TextField
                label="Descrição / Justificativa"
                name="description"
                value={form.description}
                onChange={handleChange}
                fullWidth
                multiline
                rows={3}
                placeholder="Descreva o motivo da compra e como ela será utilizada..."
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1.5 }}>
                      <DescriptionOutlined sx={{ color: '#94a3b8', fontSize: 20 }} />
                    </InputAdornment>
                  ),
                }}
                sx={fieldStyle}
              />
            </Box>

          </Box>

          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={loading}
            startIcon={loading ? null : <AddCircleOutline />}
            sx={{
              mt: 3,
              py: 1.4,
              borderRadius: '12px',
              fontWeight: 600,
              fontSize: '0.95rem',
              textTransform: 'none',
              background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
              boxShadow: '0 4px 14px rgba(37, 99, 235, 0.3)',
              '&:hover': {
                background: 'linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)',
                boxShadow: '0 6px 18px rgba(37, 99, 235, 0.38)',
              },
              '&:disabled': { background: '#e2e8f0', boxShadow: 'none' },
            }}
          >
            {loading
              ? <CircularProgress size={22} sx={{ color: '#fff' }} />
              : 'Gerar Termo de Aprovação'}
          </Button>
        </form>
      </CardContent>
    </Card>
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
