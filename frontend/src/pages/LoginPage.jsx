import { useEffect, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import { extractErrorMessage } from "../api/axiosClient";

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Verrouillage temporaire (brute-force) : nombre de secondes restantes avant de pouvoir
  // retenter, ou verrouillage complet (compte desactive, email de reactivation envoye).
  const [lockedSeconds, setLockedSeconds] = useState(0);
  const [accountEmailLocked, setAccountEmailLocked] = useState(false);

  useEffect(() => {
    if (lockedSeconds <= 0) return;
    const interval = setInterval(() => {
      setLockedSeconds((seconds) => Math.max(0, seconds - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [lockedSeconds]);

  if (isAuthenticated) {
    return <Navigate to={location.state?.from?.pathname || "/dashboard"} replace />;
  }

  const isLocked = lockedSeconds > 0 || accountEmailLocked;

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, motDePasse);
      navigate(location.state?.from?.pathname || "/dashboard", { replace: true });
    } catch (err) {
      setError(extractErrorMessage(err));

      const status = err.response?.status;
      const retryAfterSeconds = err.response?.data?.retryAfterSeconds;
      if (status === 423 && typeof retryAfterSeconds === "number") {
        setLockedSeconds(retryAfterSeconds);
        setAccountEmailLocked(false);
      } else if (status === 423) {
        setAccountEmailLocked(true);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>SGDJ</h1>
        <p className="auth-subtitle">Systeme de Gestion des Dossiers Judiciaires</p>

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
              disabled={isLocked}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="motDePasse">Mot de passe</label>
            <input
              id="motDePasse"
              type="password"
              className="form-input"
              value={motDePasse}
              onChange={(e) => setMotDePasse(e.target.value)}
              autoComplete="current-password"
              disabled={isLocked}
              required
            />
          </div>

          {error && <div className="form-error" role="alert">{error}</div>}

          {lockedSeconds > 0 && (
            <p className="form-help">
              Nouvelle tentative possible dans {lockedSeconds} seconde{lockedSeconds > 1 ? "s" : ""}...
            </p>
          )}

          <button type="submit" className="btn btn-primary btn-block" disabled={loading || isLocked}>
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>

        <div className="auth-links">
          <Link to="/forgot-password">Mot de passe oublie ?</Link>
        </div>
      </div>
    </div>
  );
}
