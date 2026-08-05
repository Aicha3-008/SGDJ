import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createUser, getUser, updateUser } from "../api/userService";
import { extractErrorMessage } from "../api/axiosClient";
import { useNotification } from "../notifications/NotificationContext";
import { isPasswordValid } from "../utils/passwordPolicy";
import PasswordRulesHint from "../components/PasswordRulesHint";
import LoadingSpinner from "../components/LoadingSpinner";

const EMPTY_FORM = { nom: "", prenom: "", email: "", motDePasse: "", role: "UTILISATEUR" };

export default function UserFormPage() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const notification = useNotification();

  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isEdit) return;
    getUser(id)
      .then((u) => setForm({ nom: u.nom, prenom: u.prenom, username: u.username, email: u.email, role: u.role }))
      .catch((err) => notification.error(extractErrorMessage(err)))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!isEdit && !isPasswordValid(form.motDePasse)) {
      setError("Le mot de passe ne respecte pas la politique de securite requise");
      return;
    }

    setSaving(true);
    try {
      if (isEdit) {
        await updateUser(id, {
          nom: form.nom, prenom: form.prenom, username: form.username, email: form.email, role: form.role,
        });
        notification.success("Utilisateur modifie avec succes");
      } else {
        await createUser(form);
        notification.success("Utilisateur cree avec succes");
      }
      navigate("/utilisateurs");
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="page-header">
        <h2>{isEdit ? "Modifier l'utilisateur" : "Nouvel utilisateur"}</h2>
      </div>

      <div className="card" style={{ maxWidth: 560 }}>
        <form onSubmit={handleSubmit} noValidate>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="nom">Nom</label>
              <input id="nom" className="form-input" value={form.nom} onChange={(e) => updateField("nom", e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="prenom">Prenom</label>
              <input id="prenom" className="form-input" value={form.prenom} onChange={(e) => updateField("prenom", e.target.value)} required />
            </div>
          </div>

          {isEdit && (
            <div className="form-group">
              <label className="form-label" htmlFor="username">Nom d'utilisateur</label>
              <input id="username" className="form-input" value={form.username} onChange={(e) => updateField("username", e.target.value)} required />
            </div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="email">Email</label>
            <input id="email" type="email" className="form-input" value={form.email} onChange={(e) => updateField("email", e.target.value)} required />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="role">Role</label>
            <select id="role" className="form-select" value={form.role} onChange={(e) => updateField("role", e.target.value)}>
              <option value="UTILISATEUR">Utilisateur</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>

          {!isEdit && (
            <div className="form-group">
              <label className="form-label" htmlFor="motDePasse">Mot de passe initial</label>
              <input
                id="motDePasse"
                type="password"
                className="form-input"
                value={form.motDePasse}
                onChange={(e) => updateField("motDePasse", e.target.value)}
                required
              />
              <PasswordRulesHint password={form.motDePasse} />
            </div>
          )}

          {error && <div className="form-error" role="alert">{error}</div>}

          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? "Enregistrement..." : "Enregistrer"}
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => navigate("/utilisateurs")}>
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
