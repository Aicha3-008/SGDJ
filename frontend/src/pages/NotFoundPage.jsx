import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="auth-page">
      <div className="auth-card" style={{ textAlign: "center" }}>
        <h1>404</h1>
        <p className="auth-subtitle">Page introuvable</p>
        <Link to="/dashboard" className="btn btn-primary">Retour au tableau de bord</Link>
      </div>
    </div>
  );
}
