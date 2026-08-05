import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../auth/useAuth";
import { useNotification } from "../notifications/NotificationContext";
import { toAbsoluteFileUrl } from "../api/config";

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
      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar-brand">
          SGDJ
          <small>Presidence du Ministere Public</small>
        </div>
        <NavLink to="/dashboard" className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`} onClick={() => setSidebarOpen(false)}>
          Tableau de bord
        </NavLink>
        {isAdmin && (
          <NavLink to="/utilisateurs" className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`} onClick={() => setSidebarOpen(false)}>
            Utilisateurs
          </NavLink>
        )}
        <NavLink to="/profile" className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`} onClick={() => setSidebarOpen(false)}>
          Mon profil
        </NavLink>
      </aside>

      <div className="main-area">
        <header className="navbar">
          <button className="btn btn-secondary btn-sm navbar-menu-btn" onClick={() => setSidebarOpen((v) => !v)}>
            Menu
          </button>
          <div />
          <div className="navbar-user">
            <span>{user?.nom} {user?.prenom}</span>
            <div className="navbar-avatar">
              {user?.photoUrl ? <img src={toAbsoluteFileUrl(user.photoUrl)} alt="" /> : initials}
            </div>
            <button className="btn btn-secondary btn-sm" onClick={handleLogout}>
              Deconnexion
            </button>
          </div>
        </header>

        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
