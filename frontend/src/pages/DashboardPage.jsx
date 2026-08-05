import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getDashboardStats } from "../api/dashboardService";
import LoadingSpinner from "../components/LoadingSpinner";
import { extractErrorMessage } from "../api/axiosClient";
import { useNotification } from "../notifications/NotificationContext";
import { useAuth } from "../auth/useAuth";

export default function DashboardPage() {
  const { isAdmin } = useAuth();
  const notification = useNotification();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    getDashboardStats()
      .then((data) => {
        if (active) setStats(data);
      })
      .catch((err) => notification.error(extractErrorMessage(err)))
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) return <LoadingSpinner label="Chargement du tableau de bord..." />;
  if (!stats) return null;

  return (
    <div>
      <div className="page-header">
        <h2>Tableau de bord</h2>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-value">{stats.totalUtilisateurs}</div>
          <div className="stat-label">Utilisateurs</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.totalDossiers}</div>
          <div className="stat-label">Dossiers judiciaires</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.totalDossiersArchives}</div>
          <div className="stat-label">Dossiers archives</div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <h3>Mon profil</h3>
        <p>
          {stats.profilConnecte.nom} {stats.profilConnecte.prenom} — {stats.profilConnecte.email}
          {" "}
          <span className={`badge ${stats.profilConnecte.role === "ADMIN" ? "badge-info" : "badge-success"}`}>
            {stats.profilConnecte.role}
          </span>
        </p>
        <Link to="/profile" className="btn btn-secondary btn-sm">Voir mon profil</Link>
      </div>

      {isAdmin && (
        <div className="card">
          <h3>Derniers utilisateurs crees</h3>
          {stats.derniersUtilisateurs.length === 0 ? (
            <p className="empty-state">Aucun utilisateur</p>
          ) : (
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Nom</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.derniersUtilisateurs.map((u) => (
                    <tr key={u.id}>
                      <td>{u.nom} {u.prenom}</td>
                      <td>{u.email}</td>
                      <td><span className="badge badge-info">{u.role}</span></td>
                      <td>
                        <span className={`badge ${u.actif ? "badge-success" : "badge-error"}`}>
                          {u.actif ? "Actif" : "Inactif"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
