import { Navigate, Route, Routes } from "react-router-dom";
import { AdminArchive } from "./admin/ArchiveAdmin";
import { AdminContactMessages } from "./admin/ContactMessages";
import { AdminDashboard } from "./admin/Dashboard";
import { AdminEvents } from "./admin/Events";
import { AdminLayout } from "./admin/AdminLayout";
import { AdminLogin } from "./admin/Login";
import { AdminReleases } from "./admin/Releases";
import { AdminSettings } from "./admin/SettingsAdmin";
import { AdminTickets } from "./admin/Tickets";
import { Layout } from "./components/Layout";
import { ScrollToTop } from "./components/ScrollToTop";
import { About } from "./pages/About";
import { ArabicHouse } from "./pages/ArabicHouse";
import { Archive } from "./pages/Archive";
import { Contact } from "./pages/Contact";
import { EPK } from "./pages/EPK";
import { Home } from "./pages/Home";
import { Live } from "./pages/Live";
import { EventDetail } from "./pages/EventDetail";
import { Music } from "./pages/Music";
import { ReleaseDetail } from "./pages/ReleaseDetail";

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/music" element={<Music />} />
          <Route path="/music/:slug" element={<ReleaseDetail />} />
          <Route path="/arabic-house" element={<ArabicHouse />} />
          <Route path="/live" element={<Live />} />
          <Route path="/live/:slug" element={<EventDetail />} />
          <Route path="/archive" element={<Archive />} />
          <Route path="/about" element={<About />} />
          <Route path="/epk" element={<EPK />} />
          <Route path="/contact" element={<Contact />} />
        </Route>

        {/* Admin */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="releases" element={<AdminReleases />} />
          <Route path="events" element={<AdminEvents />} />
          <Route path="tickets" element={<AdminTickets />} />
          <Route path="archive" element={<AdminArchive />} />
          <Route path="messages" element={<AdminContactMessages />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
