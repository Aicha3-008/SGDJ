import { useEffect, useState } from "react";

import {
    Link,
    useNavigate,
    useParams,
} from "react-router-dom";

import {
    getDossier,
    deleteDossier,
    archiveDossier,

} from "../api/dossierService";

import { extractErrorMessage } from "../api/axiosClient";
import { useNotification } from "../notifications/NotificationContext";
import LoadingSpinner from "../components/LoadingSpinner";
import ConfirmDialog from "../components/ConfirmDialog";
import DocumentsPanel from "../components/DocumentsPanel";
import { useAuth } from "../auth/useAuth";


const STATUT_LABELS = {
    EN_COURS: "En cours",
    CLOTURE: "Clôturé",
    ARCHIVE: "Archivé",
};


const STATUT_BADGES = {
    EN_COURS: "badge badge-warning",
    CLOTURE: "badge badge-success",
    ARCHIVE: "badge badge-secondary",
};


export default function DossierDetailPage() {

    const { id } = useParams();
    const navigate = useNavigate();
    const notification = useNotification();

    const { isAdmin } = useAuth();

    const [dossier, setDossier] = useState(null);
    const [loading, setLoading] = useState(true);

    const [confirmDelete, setConfirmDelete] = useState(false);
    const [confirmArchive, setConfirmArchive] = useState(false);

    const [deleting, setDeleting] = useState(false);
    const [archiving, setArchiving] = useState(false);


    // ======================================================
    // CHARGER LE DOSSIER
    // ======================================================

    useEffect(() => {

        setLoading(true);

        getDossier(id)
            .then((data) => {
                setDossier(data);
            })
            .catch((err) => {
                notification.error(
                    extractErrorMessage(err)
                );
            })
            .finally(() => {
                setLoading(false);
            });

    }, [id]);


    // ======================================================
    // SUPPRIMER LE DOSSIER
    // ======================================================

    async function handleDelete() {

        if (!dossier) {
            return;
        }

        setDeleting(true);

        try {

            await deleteDossier(dossier.id);

            notification.success(
                "Dossier supprimé avec succès"
            );

            navigate("/dossiers");

        } catch (err) {

            notification.error(
                extractErrorMessage(err)
            );

        } finally {

            setDeleting(false);
            setConfirmDelete(false);
        }
    }


    // ======================================================
    // ARCHIVER LE DOSSIER
    // ======================================================

    async function handleArchive() {

        if (!dossier) {
            return;
        }

        setArchiving(true);

        try {

            const updated =
                await archiveDossier(dossier.id);

            setDossier(updated);

            notification.success(
                "Dossier archivé avec succès"
            );

        } catch (err) {

            notification.error(
                extractErrorMessage(err)
            );

        } finally {

            setArchiving(false);
            setConfirmArchive(false);
        }
    }


    // ======================================================
    // CHARGEMENT
    // ======================================================

    if (loading) {
        return (
            <div className="page-container">
                <LoadingSpinner />
            </div>
        );
    }


    // ======================================================
    // DOSSIER INTROUVABLE
    // ======================================================

    if (!dossier) {
        return (
            <div className="page-container">

                <div className="card">

                    <h2>
                        Dossier introuvable
                    </h2>

                    <Link
                        to="/dossiers"
                        className="btn btn-secondary"
                    >
                        Retour aux dossiers
                    </Link>

                </div>

            </div>
        );
    }


    const statut =
        dossier.statut || "EN_COURS";

    const statutLabel =
        STATUT_LABELS[statut] || statut;

    const statutBadge =
        STATUT_BADGES[statut] ||
        "badge badge-secondary";


    return (
        <div className="page-container">

            {/* ==================================================
                EN-TÊTE
            ================================================== */}

            <div
                className="page-header"
                style={{
                    marginBottom: 24,
                }}
            >

                <div>

                    <Link
                        to="/dossiers"
                        className="btn btn-secondary btn-sm"
                        style={{
                            marginBottom: 12,
                        }}
                    >
                        ← Retour aux dossiers
                    </Link>

                    <h1>
                        Dossier {dossier.numeroDossier}
                    </h1>

                </div>


                {/* ACTIONS */}

                <div
                    style={{
                        display: "flex",
                        gap: 8,
                    }}
                >

                    {/* Modifier uniquement ADMIN */}

                    {isAdmin &&
                        statut !== "ARCHIVE" && (
                            <Link
                                to={`/dossiers/${dossier.id}/edit`}
                                className="btn btn-primary"
                            >
                                Modifier
                            </Link>
                        )}


                    {/* Archiver uniquement ADMIN
                        et uniquement si CLOTURE */}

                    {isAdmin &&
                        statut === "CLOTURE" && (
                            <button
                                type="button"
                                className="btn btn-secondary"
                                disabled={archiving}
                                onClick={() =>
                                    setConfirmArchive(true)
                                }
                            >
                                {archiving
                                    ? "Archivage..."
                                    : "Archiver"}
                            </button>
                        )}


                    {/* Supprimer */}

                    <button
                        type="button"
                        className="btn btn-danger"
                        disabled={deleting}
                        onClick={() =>
                            setConfirmDelete(true)
                        }
                    >
                        {deleting
                            ? "Suppression..."
                            : "Supprimer"}
                    </button>

                </div>

            </div>


            {/* ==================================================
                INFORMATIONS DU DOSSIER
            ================================================== */}

            <div className="card">

                <div
                    className="page-header"
                    style={{
                        marginBottom: 20,
                    }}
                >

                    <h2
                        style={{
                            margin: 0,
                        }}
                    >
                        Informations du dossier
                    </h2>


                    {/* STATUT EN LECTURE */}

                    <span
                        className={statutBadge}
                    >
                        {statutLabel}
                    </span>

                </div>


                <div
                    className="details-grid"
                    style={{
                        display: "grid",
                        gridTemplateColumns:
                            "repeat(2, minmax(0, 1fr))",
                        gap: 20,
                    }}
                >

                    {/* Numéro */}

                    <div>

                        <strong>
                            Numéro de dossier
                        </strong>

                        <p>
                            {dossier.numeroDossier || "-"}
                        </p>

                    </div>


                    {/* Objet */}

                    <div>

                        <strong>
                            Objet
                        </strong>

                        <p>
                            {dossier.objet || "-"}
                        </p>

                    </div>


                    {/* Tribunal */}

                    <div>

                        <strong>
                            Tribunal
                        </strong>

                        <p>
                            {dossier.tribunal || "-"}
                        </p>

                    </div>


                    {/* Juge */}

                    <div>

                        <strong>
                            Juge
                        </strong>

                        <p>
                            {dossier.juge || "-"}
                        </p>

                    </div>


                    {/* Procureur */}

                    <div>

                        <strong>
                            Procureur
                        </strong>

                        <p>
                            {dossier.procureur || "-"}
                        </p>

                    </div>


                    {/* Date création */}

                    <div>

                        <strong>
                            Date de création
                        </strong>

                        <p>
                            {dossier.dateCreation
                                ? new Date(
                                    dossier.dateCreation
                                ).toLocaleString()
                                : "-"}
                        </p>

                    </div>


                    {/* Date modification */}

                    <div>

                        <strong>
                            Dernière modification
                        </strong>

                        <p>
                            {dossier.dateMaj
                                ? new Date(
                                    dossier.dateMaj
                                ).toLocaleString()
                                : "-"}
                        </p>

                    </div>

                </div>


                {/* DESCRIPTION */}

                <div
                    style={{
                        marginTop: 24,
                    }}
                >

                    <strong>
                        Description
                    </strong>

                    <p
                        style={{
                            whiteSpace: "pre-wrap",
                        }}
                    >
                        {dossier.description || "-"}
                    </p>

                </div>

            </div>


            {/* ==================================================
                DOCUMENTS
            ================================================== */}

            <DocumentsPanel
                dossierId={dossier.id}
            />


            {/* ==================================================
                CONFIRMATION SUPPRESSION
            ================================================== */}

            <ConfirmDialog

                open={confirmDelete}

                title="Supprimer le dossier"

                message={
                    `Voulez-vous vraiment supprimer le dossier ` +
                    `"${dossier.numeroDossier}" ? ` +
                    `Cette action est irréversible.`
                }

                confirmLabel={
                    deleting
                        ? "Suppression..."
                        : "Supprimer"
                }

                danger

                onConfirm={handleDelete}

                onCancel={() => {
                    if (!deleting) {
                        setConfirmDelete(false);
                    }
                }}

            />


            {/* ==================================================
                CONFIRMATION ARCHIVAGE
            ================================================== */}

            <ConfirmDialog

                open={confirmArchive}

                title="Archiver le dossier"

                message={
                    `Voulez-vous archiver le dossier ` +
                    `"${dossier.numeroDossier}" ?`
                }

                confirmLabel={
                    archiving
                        ? "Archivage..."
                        : "Archiver"
                }

                onConfirm={handleArchive}

                onCancel={() => {
                    if (!archiving) {
                        setConfirmArchive(false);
                    }
                }}

            />

        </div>
    );
}