import { Button, Icon, Layout } from "@stellar/design-system";
import "./App.module.css";
import ConnectAccount from "./components/ConnectAccount.tsx";
import { Routes, Route, Outlet, NavLink } from "react-router-dom";
import Home from "./pages/Home";
import NewEvent from "./pages/NewEvent";
import Events from "./pages/Events";
import EventDetail from "./pages/EventDetail";
import AdminEvents from "./pages/AdminEvents";
import AdminEventDetail from "./pages/AdminEventDetail";
import CheckIn from "./pages/CheckIn";
import Debugger from "./pages/Debugger.tsx";

const AppLayout: React.FC = () => (
  <main>
    <Layout.Header
      projectId=""
      projectTitle={"EventStellar"}
      // hasThemeSwitcher={true}
      contentRight={
        <>
          <nav>
            <NavLink
              to="/debug"
              style={{
                textDecoration: "none",
              }}
            >
              {({ isActive }) => (
                <Button variant="tertiary" size="md" disabled={isActive}>
                  <Icon.Code02 size="md" />
                  Debugger
                </Button>
              )}
            </NavLink>
          </nav>
          <ConnectAccount />
        </>
      }
    />
    <Outlet />
    <Layout.Footer>
      <span>
        © {new Date().getFullYear()} EventStellar. Licensed under the{" "}
        <a
          href="http://www.apache.org/licenses/LICENSE-2.0"
          target="_blank"
          rel="noopener noreferrer"
        >
          Apache License, Version 2.0
        </a>
        .
      </span>
    </Layout.Footer>
  </main>
);

function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/new" element={<NewEvent />} />
        <Route path="/events" element={<Events />} />
        <Route path="/event/:contractId" element={<EventDetail />} />
        <Route path="/admin/events" element={<AdminEvents />} />
        <Route path="/admin/event/:eventId" element={<AdminEventDetail />} />
        <Route path="/admin/event/:eventId/checkin" element={<CheckIn />} />
        <Route path="/debug" element={<Debugger />} />
        <Route path="/debug/:contractName" element={<Debugger />} />
      </Route>
    </Routes>
  );
}

export default App;
