import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  searchUsers, deleteUser, desactiverUser, reactiverUser, deverrouillerUser,
} from "../api/userService";
import LoadingSpinner from "../components/LoadingSpinner";
import Pagination from "../components/Pagination";
import ConfirmDialog from "../components/ConfirmDialog";
import { extractErrorMessage } from "../api/axiosClient";
import { useNotification } from "../notifications/NotificationContext";
import { useDebounce } from "../utils/useDebounce";
import { useAuth } from "../auth/useAuth";

const PAGE_SIZE = 10;

export default function UsersListPage() {
  const notification = useNotification();
  const { user: currentUser } = useAuth();

  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 400);
  const [role, setRole] = useState("");
  const [actif, setActif] = useState("");
  const [sort, setSort] = useState("dateCreation,desc");
  const [page, setPage] = useState(0);

  const [data, setData] = useState({ content: [], totalPages: 0, totalElements: 0 });
  const [loading, setLoading] = useState(true);
  const [confirmAction, setConfirmAction] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    searchUsers({
      query: debouncedQuery || undefined,
      role: role || undefined,
      actif: actif === "" ? undefined : actif === "true",
      page,
      size: PAGE_SIZE,
      sort,
    })
      .then(setData)
      .catch((err) => notification.error(extractErrorMessage(err)))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery, role, actif, sort, page]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    setPage(0);
  }, [debouncedQuery, role, actif]);

  async function runAction(action, successMessage) {
    try {
      await action();
      notification.success(successMessage);
      load();
    } catch (err) {
      notification.error(extractErrorMessage(err));
    } finally {
      setConfirmAction(null);
    }
  }

  function askDelete(u) {
    setConfirmAction({
      title: "Supprimer l'utilisateur",
      message: `Supprimer definitivement ${u.nom} ${u.prenom} ? Cette action est irreversible.`,
      confirmLabel: "Supprimer",
      danger: true,
      onConfirm: () => runAction(() => deleteUser(u.id), "Utilisateur supprime"),
    });
  }

  function askDesactiver(u) {
    setConfirmAction({
      title: "Desactiver le compte",
      message: `Desactiver le compte de ${u.nom} ${u.prenom} ? Il ne pourra plus se connecter.`,
      confirmLabel: "Desactiver",
      danger: true,
      onConfirm: () => runAction(() => desactiverUser(u.id), "Compte desactive"),
    });
  }

  return (
    <div>
      <div className="page-header">
        <h2>Gestion des utilisateurs</h2>
        <Link to="/utilisateurs/nouveau" className="btn btn-primary">+ Nouvel utilisateur</Link>
      </div>

      <div className="filters-bar">
        <input
          className="form-input"
          placeholder="Rechercher (nom, prenom, email, username)..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select className="form-select" value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="">Tous les roles</option>
          <option value="ADMIN">Admin</option>
          <option value="UTILISATEUR">Utilisateur</option>
        </select>
        <select className="form-select" value={actif} onChange={(e) => setActif(e.target.value)}>
          <option value="">Tous les statuts</option>
          <option value="true">Actif</option>
          <option value="false">Inactif</option>
        </select>
        <select className="form-select" value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="dateCreation,desc">Plus recents</option>
          <option value="dateCreation,asc">Plus anciens</option>
          <option value="nom,asc">Nom (A-Z)</option>
          <option value="nom,desc">Nom (Z-A)</option>
        </select>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : data.content.length === 0 ? (
        <div className="empty-state">Aucun utilisateur trouve</div>
      ) : (
        <>
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.content.map((u) => (
                  <tr key={u.id}>
                    <td>{u.nom} {u.prenom}</td>
                    <td>{u.username}</td>
                    <td>{u.email}</td>
                    <td><span className="badge badge-info">{u.role}</span></td>
                    <td>
                      {u.compteVerrouille ? (
                        <span className="badge badge-warning">Verrouille</span>
                      ) : (
                        <span className={`badge ${u.actif ? "badge-success" : "badge-error"}`}>
                          {u.actif ? "Actif" : "Inactif"}
                        </span>
                      )}
                    </td>
                    <td className="actions-cell">
                      <Link to={`/utilisateurs/${u.id}/modifier`} className="btn btn-secondary btn-sm">Modifier</Link>
                      {u.compteVerrouille && (
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => runAction(() => deverrouillerUser(u.id), "Compte deverrouille")}
                        >
                          Deverrouiller
                        </button>
                      )}
                      {u.actif ? (
                        <button
                          className="btn btn-secondary btn-sm"
                          disabled={u.email === currentUser?.email}
                          onClick={() => askDesactiver(u)}
                        >
                          Desactiver
                        </button>
                      ) : (
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => runAction(() => reactiverUser(u.id), "Compte reactive")}
                        >
                          Reactiver
                        </button>
                      )}
                      <button
                        className="btn btn-danger btn-sm"
                        disabled={u.email === currentUser?.email}
                        onClick={() => askDelete(u)}
                      >
                        Supprimer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination page={page} totalPages={data.totalPages} onChange={setPage} />
        </>
      )}

      <ConfirmDialog
        open={!!confirmAction}
        title={confirmAction?.title}
        message={confirmAction?.message}
        confirmLabel={confirmAction?.confirmLabel}
        danger={confirmAction?.danger}
        onConfirm={confirmAction?.onConfirm}
        onCancel={() => setConfirmAction(null)}
      />
    </div>
  );
}
