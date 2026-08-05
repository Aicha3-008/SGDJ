import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { resetPassword } from "../api/authService";
import { extractErrorMessage } from "../api/axiosClient";
import { isPasswordValid } from "../utils/passwordPolicy";
import PasswordRulesHint from "../components/PasswordRulesHint";
import { useNotification } from "../notifications/NotificationContext";

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const navigate = useNavigate();
  const notification = useNotification();

  const [nouveauMotDePasse, setNouveauMotDePasse] = useState("");
  const [confirmationMotDePasse, setConfirmationMotDePasse] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!isPasswordValid(nouveauMotDePasse)) {
      setError("Le mot de passe ne respecte pas la politique de securite requise");
      return;
    }
    if (nouveauMotDePasse !== confirmationMotDePasse) {
      setError("La confirmation ne correspond pas au mot de passe");
      return;
    }

    setLoading(true);
    try {
      await resetPassword(token, nouveauMotDePasse, confirmationMotDePasse);
      notification.success("Mot de passe reinitialise avec succes, vous pouvez vous connecter");
      navigate("/login", { replace: true });
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <h1>Lien invalide</h1>
          <p className="auth-subtitle">Ce lien de reinitialisation est incomplet ou invalide.</p>
          <div className="auth-links">
            <Link to="/forgot-password">Demander un nouveau lien</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Nouveau mot de passe</h1>
        <p className="auth-subtitle">Choisissez un nouveau mot de passe pour votre compte.</p>

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label" htmlFor="nouveauMotDePasse">Nouveau mot de passe</label>
            <input
              id="nouveauMotDePasse"
              type="password"
              className="form-input"
              value={nouveauMotDePasse}
              onChange={(e) => setNouveauMotDePasse(e.target.value)}
              required
            />
            <PasswordRulesHint password={nouveauMotDePasse} />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="confirmationMotDePasse">Confirmation</label>
            <input
              id="confirmationMotDePasse"
              type="password"
              className="form-input"
              value={confirmationMotDePasse}
              onChange={(e) => setConfirmationMotDePasse(e.target.value)}
              required
            />
          </div>

          {error && <div className="form-error" role="alert">{error}</div>}

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? "Reinitialisation..." : "Reinitialiser le mot de passe"}
          </button>
        </form>

        <div className="auth-links">
          <Link to="/login">Retour a la connexion</Link>
        </div>
      </div>
    </div>
  );
}
