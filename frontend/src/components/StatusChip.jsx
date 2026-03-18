import { Chip } from '@mui/material'

const STATUS_MAP = {
  APPROVED:  { label: 'Aprovado',   color: '#10b981', bg: '#d1fae5' },
  REJECTED:  { label: 'Cancelado',  color: '#ef4444', bg: '#fee2e2' },
  PENDING:   { label: 'Pendente',   color: '#64748b', bg: '#f1f5f9' },
  SKIPPED:   { label: 'Pulado',     color: '#8b5cf6', bg: '#ede9fe' },
}

export default function StatusChip({ status }) {
  const config = STATUS_MAP[status] ?? { label: status, color: '#64748b', bg: '#f1f5f9' }

  return (
    <Chip
      label={config.label}
      size="small"
      sx={{
        fontWeight: 600,
        fontSize: '0.72rem',
        letterSpacing: '0.3px',
        color: config.color,
        backgroundColor: config.bg,
        border: `1px solid ${config.color}22`,
        borderRadius: '8px',
        height: 24,
      }}
    />
  )
}
