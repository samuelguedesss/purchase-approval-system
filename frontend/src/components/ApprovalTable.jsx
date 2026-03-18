import { useState, useEffect } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Alert,
  Chip,
} from '@mui/material'
import {
  CheckCircleOutline,
  CancelOutlined,
  VisibilityOutlined,
  AssignmentTurnedInOutlined,
} from '@mui/icons-material'
import StatusChip from './StatusChip'
import apiBackend from '../service/apiBackend'

function formatCurrency(val) {
  return Number(val).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export default function ApprovalTable() {
  const [orders, setOrders] = useState([])
  const [confirmAction, setConfirmAction] = useState(null) // { id, type: 'approve' | 'reject' }
  const [loading, setLoading] = useState(false)
  const [feedback, setFeedback] = useState(null) // { type: 'success' | 'error', message }

  useEffect(() => {
    loadPending()
  }, [])

  async function loadPending() {
    try {
      const response = await apiBackend.get('/api/purchase-requests/pending')
      setOrders(response.data)
    } catch (error) {
      console.error('Erro ao buscar aprovações pendentes', error)
    }
  }

  async function handleConfirm() {
    if (!confirmAction) return
    setLoading(true)
    setFeedback(null)

    try {
      await apiBackend.patch(`/api/purchase-requests/${confirmAction.id}/${confirmAction.type}`)
      setFeedback({
        type: 'success',
        message: confirmAction.type === 'approve'
          ? 'Solicitação aprovada com sucesso!'
          : 'Solicitação rejeitada.',
      })
      setConfirmAction(null)
      loadPending()
    } catch (error) {
      setFeedback({
        type: 'error',
        message: error.response?.data?.error || 'Erro ao processar a ação.',
      })
      setConfirmAction(null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
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
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <AssignmentTurnedInOutlined sx={{ color: '#fff', fontSize: 20 }} />
            </Box>
            <Box>
              <Typography fontWeight={700} fontSize="1rem" color="#0f172a">
                Aprovações Pendentes
              </Typography>
              <Typography variant="body2" color="text.secondary" fontSize="0.8rem">
                Avalie as solicitações aguardando sua aprovação
              </Typography>
            </Box>
          </Box>

          {feedback && (
            <Alert
              severity={feedback.type}
              onClose={() => setFeedback(null)}
              sx={{ mb: 2, borderRadius: '10px', fontSize: '0.85rem' }}
            >
              {feedback.message}
            </Alert>
          )}
        </CardContent>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                {['#', 'Solicitante', 'Departamento', 'Produto', 'Valor', 'Ações'].map((h) => (
                  <TableCell key={h}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>

            <TableBody>
              {orders.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary" fontSize="0.9rem">
                      Nenhuma solicitação pendente.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}

              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>#{String(order.id).padStart(4, '0')}</TableCell>
                  <TableCell>{order.user?.name || '—'}</TableCell>
                  <TableCell>{order.department?.name || '—'}</TableCell>
                  <TableCell>{order.product_name}</TableCell>
                  <TableCell>
                    <Typography fontWeight={600} fontSize="0.88rem" color="#1e293b">
                      {formatCurrency(order.amount)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <Tooltip title="Aprovar">
                        <IconButton
                          size="small"
                          onClick={() => setConfirmAction({ id: order.id, type: 'approve' })}
                          sx={{ color: '#10b981' }}
                        >
                          <CheckCircleOutline />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Rejeitar">
                        <IconButton
                          size="small"
                          onClick={() => setConfirmAction({ id: order.id, type: 'reject' })}
                          sx={{ color: '#ef4444' }}
                        >
                          <CancelOutlined />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Box sx={{ px: 3, py: 1.5 }}>
          <Typography fontSize="0.75rem" color="#94a3b8">
            {orders.length} solicitação(ões) pendente(s)
          </Typography>
        </Box>
      </Card>

      {/* Dialog de confirmação */}
      <Dialog
        open={!!confirmAction}
        onClose={() => setConfirmAction(null)}
        PaperProps={{ sx: { borderRadius: '16px', p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 700, fontSize: '1.05rem' }}>
          {confirmAction?.type === 'approve' ? 'Confirmar Aprovação' : 'Confirmar Rejeição'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText fontSize="0.9rem">
            {confirmAction?.type === 'approve'
              ? 'Tem certeza que deseja aprovar esta solicitação de compra?'
              : 'Tem certeza que deseja rejeitar esta solicitação de compra?'}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setConfirmAction(null)}
            sx={{ textTransform: 'none', color: '#64748b' }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={loading}
            variant="contained"
            sx={{
              textTransform: 'none',
              borderRadius: '10px',
              fontWeight: 600,
              background: confirmAction?.type === 'approve'
                ? 'linear-gradient(135deg, #10b981, #059669)'
                : 'linear-gradient(135deg, #ef4444, #dc2626)',
              '&:hover': {
                background: confirmAction?.type === 'approve'
                  ? 'linear-gradient(135deg, #059669, #047857)'
                  : 'linear-gradient(135deg, #dc2626, #b91c1c)',
              },
            }}
          >
            {loading ? 'Processando...' : 'Confirmar'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
