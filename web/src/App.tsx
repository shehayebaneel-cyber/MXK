import { Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { ScrollToTop } from "./components/ScrollToTop";
import { About } from "./pages/About";
import { ArabicHouse } from "./pages/ArabicHouse";
import { Archive } from "./pages/Archive";
import { Booking } from "./pages/Booking";
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
          <Route path="/booking" element={<Booking />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </>
  );
}
