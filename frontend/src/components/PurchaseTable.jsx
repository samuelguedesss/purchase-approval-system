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
  Modal,
  Divider,
  Button,
} from '@mui/material'
import {
  VisibilityOutlined,
  ReceiptLongOutlined,
  CloseRounded,
  CalendarMonthOutlined,
} from '@mui/icons-material'
import StatusChip from './StatusChip'
import apiBackend from '../service/apiBackend'

// ── Labels de pagamento ─────────────────────────────────────────
const PAYMENT_LABEL = {
  PIX: 'Pix',
  BOLETO: 'Boleto Bancário',
  CARTAO: 'Cartão Corporativo',
  TRANSFERENCIA: 'Transferência Bancária',
}

function formatCurrency(val) {
  return Number(val).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function formatDate(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

// normaliza status para garantir cor correta
function normalizeStatus(status) {
  if (!status) return 'PENDING'
  return status.toUpperCase()
}

// ── Mini-detalhe de etapa no modal ─────────────────────────────
function StageRow({ label, status, decidedAt }) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        py: 1.2,
        px: 2,
        borderRadius: '10px',
        backgroundColor: '#f8fafc',
        border: '1px solid #f1f5f9',
      }}
    >
      <Typography fontSize="0.83rem" fontWeight={600} color="#475569">
        {label}
      </Typography>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        {decidedAt && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <CalendarMonthOutlined sx={{ fontSize: 13, color: '#94a3b8' }} />
            <Typography fontSize="0.75rem" color="#94a3b8">
              {formatDate(decidedAt)}
            </Typography>
          </Box>
        )}

        <StatusChip status={normalizeStatus(status)} />
      </Box>
    </Box>
  )
}

// ── Modal de detalhes ─────────────────────────────────────────
function DetailModal({ order, onClose }) {
  if (!order) return null

  return (
    <Modal open={!!order} onClose={onClose}>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: { xs: '95vw', sm: 580 },
          maxHeight: '90vh',
          overflowY: 'auto',
          bgcolor: '#fff',
          borderRadius: '20px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
          outline: 'none',
          p: 0,
        }}
      >

        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 3.5,
            pt: 3,
            pb: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 38,
                height: 38,
                borderRadius: '11px',
                background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ReceiptLongOutlined sx={{ color: '#fff', fontSize: 19 }} />
            </Box>

            <Box>
              <Typography fontWeight={700} fontSize="0.95rem" color="#0f172a">
                Termo #{String(order.id).padStart(4, '0')}
              </Typography>

              <Typography variant="body2" color="text.secondary" fontSize="0.75rem">
                Detalhes da solicitação de compra
              </Typography>
            </Box>
          </Box>

          <IconButton onClick={onClose} size="small" sx={{ color: '#94a3b8' }}>
            <CloseRounded />
          </IconButton>
        </Box>

        <Divider sx={{ borderColor: '#f1f5f9' }} />

        <Box sx={{ px: 3.5, py: 3, display: 'flex', flexDirection: 'column', gap: 2.5 }}>

          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography fontSize="0.8rem" color="#64748b" fontWeight={500}>
              Status Geral
            </Typography>

            <StatusChip status={normalizeStatus(order.status)} />
          </Box>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 1.5,
            }}
          >
            {[
              { label: 'Produto', value: order.product_name },
              { label: 'Valor Total', value: formatCurrency(order.amount) },
              { label: 'Pagamento', value: PAYMENT_LABEL[order.payment_method] ?? order.payment_method },
            ].map((item) => (
              <Box
                key={item.label}
                sx={{
                  p: 1.5,
                  borderRadius: '12px',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #f1f5f9',
                }}
              >
                <Typography fontSize="0.72rem" color="#94a3b8" fontWeight={600} mb={0.3}>
                  {item.label.toUpperCase()}
                </Typography>

                <Typography fontSize="0.88rem" fontWeight={700} color="#1e293b">
                  {item.value}
                </Typography>
              </Box>
            ))}
          </Box>

          <Box
            sx={{
              p: 2,
              borderRadius: '12px',
              backgroundColor: '#f8fafc',
              border: '1px solid #f1f5f9',
            }}
          >
            <Typography fontSize="0.72rem" color="#94a3b8" fontWeight={600} mb={0.5}>
              DESCRIÇÃO / JUSTIFICATIVA
            </Typography>

            <Typography fontSize="0.87rem" color="#334155" lineHeight={1.6}>
              {order.description}
            </Typography>
          </Box>

          <Box>
            <Typography fontSize="0.78rem" color="#64748b" fontWeight={600} mb={1}>
              FLUXO DE APROVAÇÃO
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <StageRow label="Coordenador" status={order.coordinator_status} />
              <StageRow label="Gerente Geral" status={order.general_manager_status} />
              <StageRow label="Financeiro" status={order.finance_status} />
            </Box>
          </Box>

        </Box>

        <Divider sx={{ borderColor: '#f1f5f9' }} />

        <Box sx={{ px: 3.5, py: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <Button onClick={onClose}>Fechar</Button>
        </Box>
      </Box>
    </Modal>
  )
}

// ── Tabela principal ─────────────────────────────────────────
export default function PurchaseTable({ refresh }) {

  const [orders, setOrders] = useState([])
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    loadOrders()
  }, [])

  async function loadOrders() {
    try {
      const response = await apiBackend.get('/api/purchase-requests')
      setOrders(response.data)
    } catch (error) {
      console.error('Erro ao buscar requisições', error)
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

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
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
              <ReceiptLongOutlined sx={{ color: '#fff', fontSize: 20 }} />
            </Box>

            <Box>
              <Typography fontWeight={700} fontSize="1rem" color="#0f172a">
                Meus Termos
              </Typography>

              <Typography variant="body2" color="text.secondary" fontSize="0.8rem">
                Acompanhe o status das suas solicitações
              </Typography>
            </Box>
          </Box>

        </CardContent>

        <TableContainer>
          <Table>

            <TableHead>
              <TableRow>
                {['#', 'Produto', 'Coordenador', 'Gerente', 'Financeiro', 'Ações'].map((h) => (
                  <TableCell key={h}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>

            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>

                  <TableCell>
                    #{String(order.id).padStart(4, '0')}
                  </TableCell>

                  <TableCell>{order.product_name}</TableCell>

                  <TableCell>
                    <StatusChip status={normalizeStatus(order.coordinator_status)} />
                  </TableCell>

                  <TableCell>
                    <StatusChip status={normalizeStatus(order.general_manager_status)} />
                  </TableCell>

                  <TableCell>
                    <StatusChip status={normalizeStatus(order.finance_status)} />
                  </TableCell>

                  <TableCell>
                    <Tooltip title="Ver detalhes">
                      <IconButton onClick={() => setSelected(order)}>
                        <VisibilityOutlined />
                      </IconButton>
                    </Tooltip>
                  </TableCell>

                </TableRow>
              ))}
            </TableBody>

          </Table>
        </TableContainer>

        <Box sx={{ px: 3, py: 1.5 }}>
          <Typography fontSize="0.75rem" color="#94a3b8">
            {orders.length} solicitações encontradas
          </Typography>
        </Box>

      </Card>

      <DetailModal order={selected} onClose={() => setSelected(null)} />
    </>
  )
}