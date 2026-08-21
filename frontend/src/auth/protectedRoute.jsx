import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./useAuth";

export default function ProtectedRoute({ adminOnly = false }) {
    const { user, loading, isAdmin } = useAuth();

    if (loading) {
        return (
            <div className="loading-page">
                Chargement...
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (adminOnly && !isAdmin) {
        return <Navigate to="/dashboard" replace />;
    }

    return <Outlet />;
}