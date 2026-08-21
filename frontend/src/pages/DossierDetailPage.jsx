import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import {
    getDossier,
    deleteDossier,
    archiveDossier,
    downloadDossierPdf,
} from "../api/dossierService";

import {
    listDocumentsByDossier,
    uploadDocument,
    downloadDocument,
    deleteDocument,
} from "../api/documentService";

import { extractErrorMessage } from "../api/axiosClient";
import { useNotification } from "../notifications/NotificationContext";
import { useAuth } from "../auth/useAuth";

import LoadingSpinner from "../components/LoadingSpinner";
import ConfirmDialog from "../components/ConfirmDialog";

const STATUT_LABELS = {
    EN_COURS: "En cours",
    CLOTURE: "Clôturé",
    ARCHIVE: "Archivé",
};

const STATUT_BADGES = {
    EN_COURS: "badge-info",
    CLOTURE: "badge-success",
    ARCHIVE: "badge-warning",
};

export default function DossierDetailPage() {

    const { id } = useParams();
    const navigate = useNavigate();

    const { isAdmin, user } = useAuth();
    const notification = useNotification();

    const [dossier, setDossier] = useState(null);
    const [documents, setDocuments] = useState([]);

    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [downloadingPdf, setDownloadingPdf] = useState(false);

    const [error, setError] = useState("");

    const [confirmAction, setConfirmAction] = useState(null);


    // ======================================================
    // CHARGER LE DOSSIER
    // ======================================================

    async function loadDossier() {

        try {

            setLoading(true);
            setError("");

            const data = await getDossier(id);

            setDossier(data);

        } catch (err) {

            setError(
                extractErrorMessage(err)
            );

        } finally {

            setLoading(false);
        }
    }


    // ======================================================
    // CHARGER LES DOCUMENTS
    // ======================================================

    async function loadDocuments() {

        try {

            const data =
                await listDocumentsByDossier(id);

            setDocuments(
                Array.isArray(data)
                    ? data
                    : data?.content || []
            );

        } catch (err) {

            notification.error(
                extractErrorMessage(err)
            );
        }
    }


    // ======================================================
    // INITIALISATION
    // ======================================================

    useEffect(() => {

        loadDossier();
        loadDocuments();

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);


    // ======================================================
    // TÉLÉCHARGER PDF
    // ADMIN : tous les dossiers
    // UTILISATEUR : uniquement ses propres dossiers
    // ======================================================

    async function handleDownloadPdf() {

        if (!isAdmin) {

            const isOwner =
                Number(dossier?.utilisateurId) ===
                Number(user?.id);

            if (!isOwner) {

                notification.error(
                    "Vous ne pouvez télécharger que vos propres dossiers."
                );

                return;
            }
        }

        try {

            setDownloadingPdf(true);

            await downloadDossierPdf(
                dossier.id,
                dossier.numeroDossier
            );

            notification.success(
                "Le PDF a été téléchargé avec succès."
            );

        } catch (err) {

            notification.error(
                extractErrorMessage(err)
            );

        } finally {

            setDownloadingPdf(false);
        }
    }


    // ======================================================
    // AJOUTER UNE PIÈCE JOINTE
    // ======================================================

    async function handleUpload(event) {

        const file =
            event.target.files?.[0];

        if (!file) {
            return;
        }

        if (file.size > 10 * 1024 * 1024) {

            notification.error(
                "Le fichier ne doit pas dépasser 10 Mo."
            );

            event.target.value = "";

            return;
        }

        const allowedTypes = [
            "application/pdf",
            "image/jpeg",
            "image/png",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ];

        if (
            file.type &&
            !allowedTypes.includes(file.type)
        ) {

            notification.error(
                "Format non autorisé. Formats acceptés : PDF, JPEG, PNG, Word."
            );

            event.target.value = "";

            return;
        }

        try {

            setUploading(true);

            await uploadDocument(
                id,
                file
            );

            notification.success(
                "Document ajouté avec succès."
            );

            await loadDocuments();

        } catch (err) {

            notification.error(
                extractErrorMessage(err)
            );

        } finally {

            setUploading(false);

            event.target.value = "";
        }
    }


    // ======================================================
    // TÉLÉCHARGER UNE PIÈCE JOINTE
    // ======================================================

    async function handleDownloadDocument(document) {

        try {

            await downloadDocument(
                document.id,
                document.nomFichier
            );

        } catch (err) {

            notification.error(
                extractErrorMessage(err)
            );
        }
    }


    // ======================================================
    // SUPPRIMER UNE PIÈCE JOINTE
    // ======================================================

    function askDeleteDocument(document) {

        setConfirmAction({

            title: "Supprimer le document",

            message:
                `Voulez-vous supprimer le document "${document.nomFichier}" ?`,

            confirmLabel: "Supprimer",

            danger: true,

            onConfirm: async () => {

                try {

                    await deleteDocument(
                        document.id
                    );

                    notification.success(
                        "Document supprimé avec succès."
                    );

                    await loadDocuments();

                } catch (err) {

                    notification.error(
                        extractErrorMessage(err)
                    );

                } finally {

                    setConfirmAction(null);
                }
            },
        });
    }


    // ======================================================
    // SUPPRIMER LE DOSSIER
    // ======================================================

    function askDeleteDossier() {

        setConfirmAction({

            title: "Supprimer le dossier",

            message:
                `Voulez-vous supprimer définitivement le dossier ${dossier.numeroDossier} ? Cette action est irréversible.`,

            confirmLabel: "Supprimer",

            danger: true,

            onConfirm: async () => {

                try {

                    const isOwner =
                        Number(dossier.utilisateurId) ===
                        Number(user?.id);

                    if (!isAdmin && !isOwner) {

                        notification.error(
                            "Vous ne pouvez supprimer que vos propres dossiers."
                        );

                        setConfirmAction(null);

                        return;
                    }

                    await deleteDossier(
                        dossier.id
                    );

                    notification.success(
                        "Dossier supprimé avec succès."
                    );

                    navigate("/dossiers");

                } catch (err) {

                    notification.error(
                        extractErrorMessage(err)
                    );

                } finally {

                    setConfirmAction(null);
                }
            },
        });
    }


    // ======================================================
    // ARCHIVER
    // ======================================================

    function askArchive() {

        setConfirmAction({

            title: "Archiver le dossier",

            message:
                `Voulez-vous archiver le dossier ${dossier.numeroDossier} ?`,

            confirmLabel: "Archiver",

            danger: false,

            onConfirm: async () => {

                try {

                    await archiveDossier(
                        dossier.id
                    );

                    notification.success(
                        "Dossier archivé avec succès."
                    );

                    await loadDossier();

                } catch (err) {

                    notification.error(
                        extractErrorMessage(err)
                    );

                } finally {

                    setConfirmAction(null);
                }
            },
        });
    }


    // ======================================================
    // CHARGEMENT
    // ======================================================

    if (loading) {

        return <LoadingSpinner />;
    }


    // ======================================================
    // ERREUR
    // ======================================================

    if (error) {

        return (

            <div>

                <div className="page-header">

                    <h2>
                        Dossier
                    </h2>

                </div>

                <div className="card">

                    <div
                        className="form-error"
                        role="alert"
                    >
                        {error}
                    </div>

                    <div
                        style={{
                            marginTop: 16,
                        }}
                    >

                        <Link
                            to="/dossiers"
                            className="btn btn-secondary"
                        >
                            ← Retour aux dossiers
                        </Link>

                    </div>

                </div>

            </div>
        );
    }


    if (!dossier) {
        return null;
    }


    // ======================================================
    // PROPRIÉTAIRE DU DOSSIER
    // ======================================================

    const isOwner =
        Number(dossier.utilisateurId) ===
        Number(user?.id);


    // ======================================================
    // AUTORISATION TÉLÉCHARGEMENT PDF
    // ======================================================

    const canDownloadPdf =
        isAdmin || isOwner;


    // ======================================================
    // STATUT
    // ======================================================

    const statutLabel =
        STATUT_LABELS[dossier.statut]
        || dossier.statut;

    const statutBadge =
        STATUT_BADGES[dossier.statut]
        || "badge-info";


    // ======================================================
    // AFFICHAGE
    // ======================================================

    return (

        <div>

            {/* ==================================================
                EN-TÊTE
            ================================================== */}

            <div className="page-header">

                <div>

                    <Link
                        to="/dossiers"
                        className="btn btn-secondary"
                        style={{
                            marginBottom: 12,
                        }}
                    >
                        ← Retour aux dossiers
                    </Link>

                    <h2>
                        Dossier {dossier.numeroDossier}
                    </h2>

                </div>


                {/* ==================================================
                    ACTIONS
                ================================================== */}

                <div
                    style={{
                        display: "flex",
                        gap: 8,
                        flexWrap: "wrap",
                    }}
                >

                    {/* ==================================================
                        TÉLÉCHARGER PDF
                        ADMIN = TOUS
                        USER = SES PROPRES DOSSIERS
                    ================================================== */}

                    {canDownloadPdf && (

                        <button
                            type="button"
                            className="btn btn-primary"
                            onClick={handleDownloadPdf}
                            disabled={downloadingPdf}
                        >

                            {downloadingPdf
                                ? "Téléchargement..."
                                : "Télécharger PDF"}

                        </button>
                    )}


                    {/* ==================================================
                        MODIFIER
                        ADMIN UNIQUEMENT
                    ================================================== */}

                    {isAdmin &&
                        dossier.statut !== "ARCHIVE" && (

                            <Link
                                to={`/dossiers/${dossier.id}/modifier`}
                                className="btn btn-secondary"
                            >
                                Modifier
                            </Link>
                        )}


                    {/* ==================================================
                        ARCHIVER
                    ================================================== */}

                    {isAdmin &&
                        dossier.statut === "CLOTURE" && (

                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={askArchive}
                            >
                                Archiver
                            </button>
                        )}


                    {/* ==================================================
                        SUPPRIMER
                    ================================================== */}

                    {(isAdmin || isOwner) && (

                        <button
                            type="button"
                            className="btn btn-danger"
                            onClick={askDeleteDossier}
                        >
                            Supprimer
                        </button>
                    )}

                </div>

            </div>


            {/* ==================================================
                INFORMATIONS DU DOSSIER
            ================================================== */}

            <div className="card">

                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 24,
                    }}
                >

                    <h3>
                        Informations du dossier
                    </h3>

                    <span
                        className={`badge ${statutBadge}`}
                    >
                        {statutLabel}
                    </span>

                </div>


                <div className="form-row">

                    <div className="form-group">

                        <label className="form-label">
                            Numéro de dossier
                        </label>

                        <div>
                            {dossier.numeroDossier || "-"}
                        </div>

                    </div>


                    <div className="form-group">

                        <label className="form-label">
                            Objet
                        </label>

                        <div>
                            {dossier.objet || "-"}
                        </div>

                    </div>

                </div>


                <div className="form-row">

                    <div className="form-group">

                        <label className="form-label">
                            Tribunal
                        </label>

                        <div>
                            {dossier.tribunal || "-"}
                        </div>

                    </div>


                    <div className="form-group">

                        <label className="form-label">
                            Juge
                        </label>

                        <div>
                            {dossier.juge || "-"}
                        </div>

                    </div>

                </div>


                <div className="form-row">

                    <div className="form-group">

                        <label className="form-label">
                            Procureur
                        </label>

                        <div>
                            {dossier.procureur || "-"}
                        </div>

                    </div>


                    <div className="form-group">

                        <label className="form-label">
                            Date de création
                        </label>

                        <div>
                            {dossier.dateCreation
                                ? new Date(
                                    dossier.dateCreation
                                ).toLocaleString()
                                : "-"
                            }
                        </div>

                    </div>

                </div>


                <div className="form-group">

                    <label className="form-label">
                        Dernière modification
                    </label>

                    <div>
                        {dossier.dateMaj
                            ? new Date(
                                dossier.dateMaj
                            ).toLocaleString()
                            : "-"
                        }
                    </div>

                </div>


                <div className="form-group">

                    <label className="form-label">
                        Description
                    </label>

                    <div>
                        {dossier.description || "-"}
                    </div>

                </div>

            </div>


            {/* ==================================================
                PIÈCES JOINTES
            ================================================== */}

            <div className="card">

                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 16,
                    }}
                >

                    <div>

                        <h3>
                            Pièces jointes
                        </h3>

                        <p
                            style={{
                                marginTop: 6,
                            }}
                        >
                            Formats acceptés : PDF, JPEG,
                            PNG, Word (.doc/.docx) — 10 Mo maximum.
                        </p>

                    </div>


                    {/* AJOUT DOCUMENT */}

                    <label
                        className="btn btn-primary"
                        style={{
                            cursor: uploading
                                ? "not-allowed"
                                : "pointer",
                        }}
                    >

                        {uploading
                            ? "Ajout..."
                            : "+ Ajouter un document"}

                        <input
                            type="file"
                            hidden
                            disabled={uploading}
                            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                            onChange={handleUpload}
                        />

                    </label>

                </div>


                {/* LISTE DOCUMENTS */}

                {documents.length === 0 ? (

                    <div className="empty-state">
                        Aucun document rattaché à ce dossier.
                    </div>

                ) : (

                    <div className="table-wrapper">

                        <table className="data-table">

                            <thead>

                            <tr>

                                <th>
                                    Nom du fichier
                                </th>

                                <th>
                                    Taille
                                </th>

                                <th>
                                    Actions
                                </th>

                            </tr>

                            </thead>


                            <tbody>

                            {documents.map(
                                (document) => (

                                    <tr
                                        key={document.id}
                                    >

                                        <td>
                                            {document.nomFichier
                                                || document.filename
                                                || "Document"
                                            }
                                        </td>


                                        <td>

                                            {document.taille
                                                ? `${(
                                                    document.taille /
                                                    1024
                                                ).toFixed(1)} Ko`
                                                : "-"
                                            }

                                        </td>


                                        <td>

                                            <div
                                                style={{
                                                    display: "flex",
                                                    gap: 8,
                                                }}
                                            >

                                                <button
                                                    type="button"
                                                    className="btn btn-secondary btn-sm"
                                                    onClick={() =>
                                                        handleDownloadDocument(
                                                            document
                                                        )
                                                    }
                                                >
                                                    Télécharger
                                                </button>


                                                {(isAdmin || isOwner) && (

                                                    <button
                                                        type="button"
                                                        className="btn btn-danger btn-sm"
                                                        onClick={() =>
                                                            askDeleteDocument(
                                                                document
                                                            )
                                                        }
                                                    >
                                                        Supprimer
                                                    </button>

                                                )}

                                            </div>

                                        </td>

                                    </tr>
                                )
                            )}

                            </tbody>

                        </table>

                    </div>
                )}

            </div>


            {/* ==================================================
                CONFIRMATION
            ================================================== */}

            <ConfirmDialog
                open={!!confirmAction}
                title={confirmAction?.title}
                message={confirmAction?.message}
                confirmLabel={
                    confirmAction?.confirmLabel
                }
                danger={
                    confirmAction?.danger
                }
                onConfirm={
                    confirmAction?.onConfirm
                }
                onCancel={() =>
                    setConfirmAction(null)
                }
            />

        </div>
    );
}