import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { LayoutDashboard, BarChart3, Plus, Heart, User } from 'lucide-react'
import './BottomTabBar.css'

const TABS = [
  { to: '/',          icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/analytics', icon: BarChart3,       label: 'Analytics' },
  { fab: true },
  { to: '/coach',     icon: Heart,           label: 'Coach' },
  { to: '/settings',  icon: User,            label: 'Settings' },
]

const HIDDEN_ROUTES = ['/login', '/signup', '/log']

export default function BottomTabBar() {
  const location = useLocation()
  const navigate = useNavigate()

  if (HIDDEN_ROUTES.includes(location.pathname)) return null

  return (
    <nav className="tab-bar" role="navigation" aria-label="Primary">
      <ul className="tab-bar-list">
        {TABS.map((tab, i) => {
          if (tab.fab) {
            return (
              <li key="fab" className="tab-fab-slot">
                <button
                  className="tab-fab"
                  aria-label="Log trade"
                  onClick={() => navigate('/log')}
                >
                  <Plus size={28} strokeWidth={2.5} />
                </button>
              </li>
            )
          }
          const Icon = tab.icon
          return (
            <li key={tab.to} className="tab-item">
              <NavLink
                to={tab.to}
                end={tab.to === '/'}
                className={({ isActive }) => 'tab-link' + (isActive ? ' is-active' : '')}
                aria-label={tab.label}
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <motion.span
                        layoutId="tab-indicator"
                        className="tab-indicator"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                    <Icon size={24} strokeWidth={2} className="tab-icon" />
                  </>
                )}
              </NavLink>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
