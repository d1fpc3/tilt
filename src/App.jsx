import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext.jsx'
import BottomTabBar from './components/nav/BottomTabBar.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Analytics from './pages/Analytics.jsx'
import LogTrade from './pages/LogTrade.jsx'
import History from './pages/History.jsx'
import TradeDetail from './pages/TradeDetail.jsx'
import Coach from './pages/Coach.jsx'
import Settings from './pages/Settings.jsx'
import Login from './pages/Login.jsx'
import Signup from './pages/Signup.jsx'

function RequireAuth({ children }) {
  const { session, loading } = useAuth()
  if (loading) return <div style={{ padding: 32, textAlign: 'center' }}><span className="spinner" /></div>
  if (!session) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  return (
    <div className="app-shell">
      <Routes>
        <Route path="/login"  element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route path="/"          element={<RequireAuth><Dashboard /></RequireAuth>} />
        <Route path="/analytics" element={<RequireAuth><Analytics /></RequireAuth>} />
        <Route path="/log"       element={<RequireAuth><LogTrade /></RequireAuth>} />
        <Route path="/history"   element={<RequireAuth><History /></RequireAuth>} />
        <Route path="/trade/:id" element={<RequireAuth><TradeDetail /></RequireAuth>} />
        <Route path="/coach"     element={<RequireAuth><Coach /></RequireAuth>} />
        <Route path="/settings"  element={<RequireAuth><Settings /></RequireAuth>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <BottomTabBar />
    </div>
  )
}
