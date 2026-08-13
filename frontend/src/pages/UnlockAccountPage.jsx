import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { unlockAccount } from "../api/authService";
import { extractErrorMessage } from "../api/axiosClient";

export default function UnlockAccountPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function handleUnlock() {
    setError("");
    setLoading(true);
    try {
      await unlockAccount(token);
      setDone(true);
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
          <p className="auth-subtitle">Ce lien de reactivation est incomplet ou invalide.</p>
          <div className="auth-links">
            <Link to="/login">Retour a la connexion</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Compte verrouille</h1>

        {done ? (
          <div className="form-group" style={{ textAlign: "center" }}>
            <p>Votre compte a ete reactive avec succes.</p>
            <p className="form-help">Vous pouvez maintenant vous reconnecter.</p>
          </div>
        ) : (
          <>
            <p className="auth-subtitle">
              Votre compte a ete verrouille suite a plusieurs tentatives de connexion echouees.
              Si ces tentatives viennent bien de vous, cliquez ci-dessous pour le reactiver.
            </p>

            {error && <div className="form-error" role="alert">{error}</div>}

            <button
              type="button"
              className="btn btn-primary btn-block"
              onClick={handleUnlock}
              disabled={loading}
            >
              {loading ? "Reactivation..." : "Reactiver mon compte"}
            </button>
          </>
        )}

        <div className="auth-links">
          <Link to="/login">Retour a la connexion</Link>
        </div>
      </div>
    </div>
  );
}
