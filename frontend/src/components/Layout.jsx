import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../auth/useAuth";
import { useNotification } from "../notifications/NotificationContext";
import { toAbsoluteFileUrl } from "../api/config";
import { IconDashboard, IconUsers, IconProfile, IconMenu, IconLogout } from "./Icons";

export default function Layout() {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const notification = useNotification();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const initials = `${user?.nom?.[0] ?? ""}${user?.prenom?.[0] ?? ""}`.toUpperCase();

  async function handleLogout() {
    await logout();
    navigate("/login");
    notification.info("Vous avez ete deconnecte");
  }

  return (
    <div className="app-shell">
      <div className={`sidebar-backdrop ${sidebarOpen ? "visible" : ""}`} onClick={() => setSidebarOpen(false)} />

      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar-brand">
          SGDJ
          <small>Presidence du Ministere Public</small>
        </div>
        <NavLink to="/dashboard" className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`} onClick={() => setSidebarOpen(false)}>
          <IconDashboard /> Tableau de bord
        </NavLink>
        {isAdmin && (
          <NavLink to="/utilisateurs" className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`} onClick={() => setSidebarOpen(false)}>
            <IconUsers /> Utilisateurs
          </NavLink>
        )}
        <NavLink to="/profile" className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`} onClick={() => setSidebarOpen(false)}>
          <IconProfile /> Mon profil
        </NavLink>

        <div className="sidebar-footer">
          <button className="sidebar-link sidebar-logout" onClick={handleLogout}>
            <IconLogout /> Deconnexion
          </button>
        </div>
      </aside>

      <div className="main-area">
        <header className="navbar">
          <button className="navbar-menu-btn" onClick={() => setSidebarOpen((v) => !v)} aria-label="Ouvrir le menu">
            <IconMenu />
          </button>
          <div />
          <div className="navbar-user">
            <span className="navbar-username">{user?.nom} {user?.prenom}</span>
            <div className="navbar-avatar">
              {user?.photoUrl ? <img src={toAbsoluteFileUrl(user.photoUrl)} alt="" /> : initials}
            </div>
          </div>
        </header>

        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
