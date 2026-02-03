import { Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage.tsx'
import DashboardPage from './pages/DashboardPage.tsx'
import FriendsPage from './pages/FriendsPage.tsx'
import GroupSyncPage from './pages/GroupSyncPage.tsx'
import FamilySyncPage from './pages/FamilySyncPage.tsx'
import AIPlannerPage from './pages/AIPlannerPage.tsx'
import AuthGuard from './components/AuthGuard.tsx'
import AuthLayout from './components/AuthLayout.tsx'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route element={<AuthGuard />}>
        <Route element={<AuthLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/friends" element={<FriendsPage />} />
          <Route path="/group-sync" element={<GroupSyncPage />} />
          <Route path="/family-sync" element={<FamilySyncPage />} />
          <Route path="/ai-planner" element={<AIPlannerPage />} />
        </Route>
      </Route>
    </Routes>
  )
}
