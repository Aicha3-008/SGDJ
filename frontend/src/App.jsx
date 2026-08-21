import { Navigate, Route, Routes } from "react-router-dom";

import LoginPage from "./pages/LoginPage.jsx";
import ForgotPasswordPage from "./pages/ForgotPasswordPage.jsx";
import ResetPasswordPage from "./pages/ResetPasswordPage.jsx";
import UnlockAccountPage from "./pages/UnlockAccountPage.jsx";

import DashboardPage from "./pages/DashboardPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import UsersListPage from "./pages/UsersListPage.jsx";
import UserFormPage from "./pages/UserFormPage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";

import DossiersListPage from "./pages/DossiersListPage.jsx";
import DossierFormPage from "./pages/DossierFormPage.jsx";
import DossierDetailPage from "./pages/DossierDetailPage.jsx";

import ProtectedRoute from "./auth/ProtectedRoute.jsx";
import Layout from "./components/Layout.jsx";

export default function App() {
    return (
        <Routes>

            {/* =========================
                ROUTES PUBLIQUES
            ========================= */}

            <Route
                path="/login"
                element={<LoginPage />}
            />

            <Route
                path="/forgot-password"
                element={<ForgotPasswordPage />}
            />

            <Route
                path="/reset-password"
                element={<ResetPasswordPage />}
            />

            <Route
                path="/unlock-account"
                element={<UnlockAccountPage />}
            />


            {/* =========================
                ROUTES PROTEGEES
            ========================= */}

            <Route element={<ProtectedRoute />}>

                <Route element={<Layout />}>

                    <Route
                        path="/"
                        element={
                            <Navigate
                                to="/dashboard"
                                replace
                            />
                        }
                    />

                    <Route
                        path="/dashboard"
                        element={<DashboardPage />}
                    />

                    <Route
                        path="/profile"
                        element={<ProfilePage />}
                    />


                    {/* =========================
                        DOSSIERS
                    ========================= */}

                    <Route
                        path="/dossiers"
                        element={<DossiersListPage />}
                    />

                    <Route
                        path="/dossiers/nouveau"
                        element={<DossierFormPage />}
                    />

                    <Route
                        path="/dossiers/:id"
                        element={<DossierDetailPage />}
                    />

                    <Route
                        path="/dossiers/:id/modifier"
                        element={<DossierFormPage />}
                    />


                    {/* =========================
                        ADMINISTRATION
                    ========================= */}

                    <Route element={<ProtectedRoute adminOnly />}>

                        <Route
                            path="/utilisateurs"
                            element={<UsersListPage />}
                        />

                        <Route
                            path="/utilisateurs/nouveau"
                            element={<UserFormPage />}
                        />

                        <Route
                            path="/utilisateurs/:id/modifier"
                            element={<UserFormPage />}
                        />

                    </Route>

                </Route>

            </Route>


            {/* =========================
                PAGE 404
            ========================= */}

            <Route
                path="*"
                element={<NotFoundPage />}
            />

        </Routes>
    );
}