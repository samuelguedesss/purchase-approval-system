import { useState } from 'react'
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Avatar,
  IconButton,
  Tooltip,
  Divider,
  Menu,
  MenuItem,
  ListItemIcon,
  Tabs,
  Tab,
} from '@mui/material'
import {
  LockOutlined,
  LogoutOutlined,
  PersonOutlined,
  NotificationsOutlined,
  ShoppingCartOutlined,
  AssignmentTurnedInOutlined,
  PeopleOutlined,
  BusinessOutlined,
} from '@mui/icons-material'
import PurchaseForm from '../components/PurchaseForm'
import PurchaseTable from '../components/PurchaseTable'
import ApprovalTable from '../components/ApprovalTable'
import UserManagement from './UserManagement'
import DepartmentManagement from './DepartmentManagement'

const ROLE_CONFIG = {
  USER: {
    title: 'Painel de Compras',
    subtitle: 'Gere novos termos e acompanhe o status das suas aprovações',
    tabs: [
      { label: 'Minhas Solicitações', icon: <ShoppingCartOutlined /> },
    ],
  },
  COORDINATOR: {
    title: 'Painel do Coordenador',
    subtitle: 'Gerencie solicitações e aprove termos do seu departamento',
    tabs: [
      { label: 'Minhas Solicitações', icon: <ShoppingCartOutlined /> },
      { label: 'Aprovações Pendentes', icon: <AssignmentTurnedInOutlined /> },
    ],
  },
  GENERAL_MANAGER: {
    title: 'Painel do Gerente Geral',
    subtitle: 'Aprove solicitações acima de R$500 e gerencie o sistema',
    tabs: [
      { label: 'Aprovações', icon: <AssignmentTurnedInOutlined /> },
      { label: 'Usuários', icon: <PeopleOutlined /> },
      { label: 'Departamentos', icon: <BusinessOutlined /> },
    ],
  },
  COORDINATION_FINANCE: {
    title: 'Painel Financeiro',
    subtitle: 'Aprovação final das solicitações de compra',
    tabs: [
      { label: 'Aprovações Pendentes', icon: <AssignmentTurnedInOutlined /> },
    ],
  },
}

export default function Dashboard({ onLogout }) {
  const [refreshKey, setRefreshKey] = useState(0)
  const [anchorEl, setAnchorEl] = useState(null)
  const [activeTab, setActiveTab] = useState(0)

  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const initials = user.name
    ? user.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
    : 'US'

  const config = ROLE_CONFIG[user.role] || ROLE_CONFIG.USER

  const handleCreated = () => setRefreshKey((k) => k + 1)

  const handleLogout = () => {
    setAnchorEl(null)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    onLogout()
  }

  const renderContent = () => {
    const role = user.role

    if (role === 'USER') {
      return (
        <>
          <PurchaseForm onCreated={handleCreated} />
          <PurchaseTable key={refreshKey} />
        </>
      )
    }

    if (role === 'COORDINATOR') {
      if (activeTab === 0) {
        return (
          <>
            <PurchaseForm onCreated={handleCreated} />
            <PurchaseTable key={refreshKey} />
          </>
        )
      }
      return <ApprovalTable key={refreshKey} />
    }

    if (role === 'GENERAL_MANAGER') {
      if (activeTab === 0) return <ApprovalTable key={refreshKey} />
      if (activeTab === 1) return <UserManagement />
      if (activeTab === 2) return <DepartmentManagement />
    }

    if (role === 'COORDINATION_FINANCE') {
      return <ApprovalTable key={refreshKey} />
    }

    return null
  }

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f5f7fa' }}>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          backgroundColor: '#fff',
          borderBottom: '1px solid #e2e8f0',
          color: '#0f172a',
        }}
      >
        <Toolbar sx={{ px: { xs: 2, md: 4 }, gap: 1 }}>
          {/* Logo */}
          <Box
            sx={{
              width: 34,
              height: 34,
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mr: 1.5,
              boxShadow: '0 3px 8px rgba(37,99,235,0.3)',
            }}
          >
            <LockOutlined sx={{ color: '#fff', fontSize: 17 }} />
          </Box>

          <Typography
            fontWeight={700}
            fontSize="0.97rem"
            color="#0f172a"
            letterSpacing="-0.3px"
            sx={{ flexGrow: 1 }}
          >
            Sistema de Aprovação
          </Typography>

          {/* Notificações */}
          <Tooltip title="Notificações">
            <IconButton size="small" sx={{ color: '#64748b' }}>
              <NotificationsOutlined fontSize="small" />
            </IconButton>
          </Tooltip>

          {/* Avatar do usuário */}
          <Tooltip title="Minha conta">
            <Avatar
              onClick={(e) => setAnchorEl(e.currentTarget)}
              sx={{
                width: 34,
                height: 34,
                ml: 1,
                cursor: 'pointer',
                fontSize: '0.85rem',
                fontWeight: 700,
                background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
              }}
            >
              {initials}
            </Avatar>
          </Tooltip>

          {/* Dropdown menu */}
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={() => setAnchorEl(null)}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            PaperProps={{
              sx: {
                mt: 1,
                borderRadius: '14px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 8px 30px rgba(0,0,0,0.1)',
                minWidth: 180,
              },
            }}
          >
            <Box sx={{ px: 2, py: 1.5 }}>
              <Typography fontWeight={700} fontSize="0.88rem" color="#0f172a">
                {user.name || 'Usuário'}
              </Typography>
              <Typography fontSize="0.75rem" color="text.secondary">
                {user.email || 'usuario@empresa.com'}
              </Typography>
            </Box>
            <Divider sx={{ borderColor: '#f1f5f9' }} />
            <MenuItem
              sx={{ fontSize: '0.87rem', gap: 1.5, py: 1.2, color: '#475569' }}
              onClick={() => setAnchorEl(null)}
            >
              <ListItemIcon sx={{ minWidth: 'auto' }}>
                <PersonOutlined fontSize="small" sx={{ color: '#94a3b8' }} />
              </ListItemIcon>
              Meu Perfil
            </MenuItem>
            <MenuItem
              sx={{ fontSize: '0.87rem', gap: 1.5, py: 1.2, color: '#ef4444' }}
              onClick={handleLogout}
            >
              <ListItemIcon sx={{ minWidth: 'auto' }}>
                <LogoutOutlined fontSize="small" sx={{ color: '#ef4444' }} />
              </ListItemIcon>
              Sair
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Box
        sx={{
          maxWidth: 1100,
          mx: 'auto',
          px: { xs: 2, md: 4 },
          py: { xs: 3, md: 4 },
          display: 'flex',
          flexDirection: 'column',
          gap: 3,
        }}
      >
        {/* Titulo */}
        <Box>
          <Typography
            variant="h5"
            fontWeight={800}
            color="#0f172a"
            letterSpacing="-0.5px"
          >
            {config.title}
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={0.3}>
            {config.subtitle}
          </Typography>
        </Box>

        {/* Tabs (so mostra se tiver mais de 1) */}
        {config.tabs.length > 1 && (
          <Tabs
            value={activeTab}
            onChange={(_, v) => setActiveTab(v)}
            sx={{
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.88rem',
                color: '#64748b',
                minHeight: 44,
                '&.Mui-selected': { color: '#2563eb' },
              },
              '& .MuiTabs-indicator': {
                backgroundColor: '#2563eb',
                borderRadius: '2px',
                height: 3,
              },
            }}
          >
            {config.tabs.map((tab, i) => (
              <Tab key={i} label={tab.label} icon={tab.icon} iconPosition="start" />
            ))}
          </Tabs>
        )}

        {/* Conteudo */}
        {renderContent()}
      </Box>
    </Box>
  )
}
