import { useState } from "react";
import { Link } from "react-router-dom";
import { forgotPassword } from "../api/authService";
import { extractErrorMessage } from "../api/axiosClient";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await forgotPassword(email);
      setSent(true);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Mot de passe oublie</h1>
        <p className="auth-subtitle">
          Saisissez votre email professionnel, un lien de reinitialisation vous sera envoye.
        </p>

        {sent ? (
          <div className="form-group" style={{ textAlign: "center" }}>
            <p>Si cet email est associe a un compte, un lien de reinitialisation vient d'etre envoye.</p>
            <p className="form-help">Verifiez votre boite de reception (et vos courriers indesirables).</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label className="form-label" htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {error && <div className="form-error" role="alert">{error}</div>}

            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
              {loading ? "Envoi..." : "Envoyer le lien"}
            </button>
          </form>
        )}

        <div className="auth-links">
          <Link to="/login">Retour a la connexion</Link>
        </div>
      </div>
    </div>
  );
}
