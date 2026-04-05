import { BrowserRouter, Routes, Route } from 'react-router-dom';

import MainLayout      from './layouts/MainLayout';
import ProtectedRoute  from './components/ProtectedRoute';

// Layouts avec sidebar + bottom nav intégrés
import ClientLayout    from './layouts/ClientLayout';
import WorkerLayout    from './layouts/WorkerLayout';

// Public
import Home           from './pages/Home';
import Deconnexion    from './pages/Deconnexion';

// Auth Client
import RegisterClient from './pages/client/RegisterClient';
import LoginClient    from './pages/client/LoginClient';

// Auth Worker
import RegisterWorker from './pages/worker/RegisterWorker';
import LoginWorker    from './pages/worker/LoginWorker';

// Pages Client (protégées)
import ClientDashboard from './pages/client/Dashboard';
import CreateRequest   from './pages/client/CreateRequest';
import MyRequests      from './pages/client/MyRequests';
import FindWorkers     from './pages/client/FindWorkers';
import ClientChat      from './pages/client/Chat';
import ClientProfile   from './pages/client/Profile';

// Pages Worker (protégées)
import WorkerDashboard from './pages/worker/Dashboard';
import AvailableJobs   from './pages/worker/AvailableJobs';
import WorkerChat      from './pages/worker/Chat';
import WorkerProfile   from './pages/worker/Profile';
import MyRatings       from './pages/worker/MyRatings';

// Shared
import Messages from './pages/shared/Messages';
import NotFound from './pages/shared/NotFound';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ── Pages publiques ── */}
        <Route element={<MainLayout />}>
          <Route path="/"                   element={<Home />} />
          <Route path="/register/client"    element={<RegisterClient />} />
          <Route path="/login/client"       element={<LoginClient />} />
          <Route path="/register/worker"    element={<RegisterWorker />} />
          <Route path="/login/worker"       element={<LoginWorker />} />
          <Route path="/deconnexion"        element={<Deconnexion />} />
        </Route>

        {/* ── Pages CLIENT protégées ── */}
        <Route element={
          <ProtectedRoute role="client">
            <ClientLayout />
          </ProtectedRoute>
        }>
          <Route path="/client/dashboard"   element={<ClientDashboard />} />
          <Route path="/client/requests"    element={<MyRequests />} />
          <Route path="/client/new-request" element={<CreateRequest />} />
          <Route path="/client/workers"     element={<FindWorkers />} />
          <Route path="/client/chat/:id"    element={<ClientChat />} />
          <Route path="/client/messages"    element={<Messages />} />
          <Route path="/client/profile"     element={<ClientProfile />} />
        </Route>

        {/* ── Pages WORKER protégées ── */}
        <Route element={
          <ProtectedRoute role="travailleur">
            <WorkerLayout />
          </ProtectedRoute>
        }>
          <Route path="/worker/dashboard"   element={<WorkerDashboard />} />
          <Route path="/worker/jobs"        element={<AvailableJobs />} />
          <Route path="/worker/chat/:id"    element={<WorkerChat />} />
          <Route path="/worker/messages"    element={<Messages />} />
          <Route path="/worker/profile"     element={<WorkerProfile />} />
          <Route path="/worker/ratings"     element={<MyRatings />} />
        </Route>

        {/* ── 404 ── */}
        <Route path="*" element={<NotFound />} />

      </Routes>
    </BrowserRouter>
  );
}