import { useCallback, useEffect, useRef, useState } from "react";

import {
    listDocumentsByDossier,
    uploadDocument,
    downloadDocument,
    deleteDocument,
} from "../api/documentService";

import { extractErrorMessage } from "../api/axiosClient";
import { useNotification } from "../notifications/NotificationContext";
import LoadingSpinner from "./LoadingSpinner";
import ConfirmDialog from "./ConfirmDialog";
import { useAuth } from "../auth/useAuth";

const ACCEPTED_TYPES = ".pdf,.jpg,.jpeg,.png,.doc,.docx";
const MAX_SIZE_MB = 10;

function formatSize(bytes) {
    if (!bytes && bytes !== 0) {
        return "-";
    }

    if (bytes < 1024) {
        return `${bytes} o`;
    }

    if (bytes < 1024 * 1024) {
        return `${(bytes / 1024).toFixed(1)} Ko`;
    }

    return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

export default function DocumentsPanel({ dossierId }) {
    const notification = useNotification();
    const fileInputRef = useRef(null);

    const { isAdmin } = useAuth();

    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(null);

    /*
     * ADMIN et UTILISATEUR peuvent ajouter un document.
     */
    const canAddDocument = true;

    /*
     * ADMIN et UTILISATEUR peuvent télécharger.
     */
    const canDownloadDocument = true;

    /*
     * Pour l'instant, on autorise ADMIN et UTILISATEUR
     * à supprimer un document.
     *
     * Le backend devra également appliquer cette règle.
     */
    const canDeleteDocument = true;

    const load = useCallback(() => {
        setLoading(true);

        listDocumentsByDossier(dossierId)
            .then(setDocuments)
            .catch((err) => {
                notification.error(
                    extractErrorMessage(err)
                );
            })
            .finally(() => {
                setLoading(false);
            });

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dossierId]);

    useEffect(() => {
        load();
    }, [load]);

    /*
     * Ajouter un document.
     */
    function handleFileSelected(event) {
        const file = event.target.files?.[0];

        /*
         * Réinitialiser immédiatement le champ.
         * Cela permet de sélectionner à nouveau le même fichier
         * après une erreur.
         */
        event.target.value = "";

        if (!file) {
            return;
        }

        if (!canAddDocument) {
            notification.error(
                "Vous n'avez pas l'autorisation d'ajouter un document."
            );
            return;
        }

        /*
         * Vérification de la taille.
         */
        if (file.size > MAX_SIZE_MB * 1024 * 1024) {
            notification.error(
                `Le fichier depasse la taille maximale autorisee (${MAX_SIZE_MB} Mo)`
            );
            return;
        }

        /*
         * Vérification de l'extension.
         */
        const fileName = file.name.toLowerCase();

        const allowedExtensions = [
            ".pdf",
            ".jpg",
            ".jpeg",
            ".png",
            ".doc",
            ".docx",
        ];

        const isAllowedExtension =
            allowedExtensions.some((extension) =>
                fileName.endsWith(extension)
            );

        if (!isAllowedExtension) {
            notification.error(
                "Format de fichier non autorise. Formats acceptes : PDF, JPEG, PNG, DOC et DOCX."
            );
            return;
        }

        setUploading(true);

        uploadDocument(dossierId, file)
            .then(() => {
                notification.success(
                    "Document ajoute avec succes"
                );

                load();
            })
            .catch((err) => {
                notification.error(
                    extractErrorMessage(err)
                );
            })
            .finally(() => {
                setUploading(false);
            });
    }

    /*
     * Télécharger un document.
     */
    function handleDownload(doc) {
        if (!canDownloadDocument) {
            notification.error(
                "Vous n'avez pas l'autorisation de telecharger ce document."
            );
            return;
        }

        downloadDocument(
            doc.id,
            doc.nomFichier
        ).catch((err) => {
            notification.error(
                extractErrorMessage(err)
            );
        });
    }

    /*
     * Demander la confirmation de suppression.
     */
    function askDelete(doc) {
        if (!canDeleteDocument) {
            notification.error(
                "Vous n'avez pas l'autorisation de supprimer ce document."
            );
            return;
        }

        setConfirmDelete(doc);
    }

    /*
     * Supprimer définitivement le document.
     */
    async function confirmDeleteDocument() {
        if (!canDeleteDocument || !confirmDelete) {
            setConfirmDelete(null);
            return;
        }

        try {
            await deleteDocument(confirmDelete.id);

            notification.success(
                "Document supprime avec succes"
            );

            load();
        } catch (err) {
            notification.error(
                extractErrorMessage(err)
            );
        } finally {
            setConfirmDelete(null);
        }
    }

    return (
        <div
            className="card"
            style={{
                maxWidth: 640,
                marginTop: 24,
            }}
        >
            <div
                className="page-header"
                style={{ marginBottom: 12 }}
            >
                <h3 style={{ margin: 0 }}>
                    Pieces jointes
                </h3>

                {/* ADMIN et UTILISATEUR peuvent ajouter */}
                {canAddDocument && (
                    <div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept={ACCEPTED_TYPES}
                            style={{ display: "none" }}
                            onChange={handleFileSelected}
                        />

                        <button
                            type="button"
                            className="btn btn-primary btn-sm"
                            disabled={uploading}
                            onClick={() =>
                                fileInputRef.current?.click()
                            }
                        >
                            {uploading
                                ? "Envoi..."
                                : "+ Ajouter un document"}
                        </button>
                    </div>
                )}
            </div>

            <p
                style={{
                    color: "var(--color-text-muted)",
                    fontSize: "0.85rem",
                    marginTop: 0,
                }}
            >
                Formats acceptes : PDF, JPEG, PNG, Word
                (.doc/.docx) — {MAX_SIZE_MB} Mo maximum.
            </p>

            {loading ? (
                <LoadingSpinner />
            ) : documents.length === 0 ? (
                <div className="empty-state">
                    Aucun document rattache a ce dossier
                </div>
            ) : (
                <div className="table-wrapper">
                    <table className="data-table">
                        <thead>
                        <tr>
                            <th>Nom</th>
                            <th>Type</th>
                            <th>Taille</th>
                            <th>Ajoute le</th>
                            <th>Actions</th>
                        </tr>
                        </thead>

                        <tbody>
                        {documents.map((doc) => (
                            <tr key={doc.id}>
                                <td>
                                    {doc.nomFichier}
                                </td>

                                <td>
                                    {doc.typeFichier || "-"}
                                </td>

                                <td>
                                    {formatSize(doc.taille)}
                                </td>

                                <td>
                                    {doc.dateAjout
                                        ? new Date(
                                            doc.dateAjout
                                        ).toLocaleDateString()
                                        : "-"}
                                </td>

                                <td className="actions-cell">

                                    {/* Télécharger */}
                                    {canDownloadDocument && (
                                        <button
                                            type="button"
                                            className="btn btn-secondary btn-sm"
                                            onClick={() =>
                                                handleDownload(doc)
                                            }
                                        >
                                            Telecharger
                                        </button>
                                    )}

                                    {/* Supprimer */}
                                    {canDeleteDocument && (
                                        <button
                                            type="button"
                                            className="btn btn-danger btn-sm"
                                            onClick={() =>
                                                askDelete(doc)
                                            }
                                        >
                                            Supprimer
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}

            <ConfirmDialog
                open={!!confirmDelete}
                title="Supprimer le document"
                message={`Supprimer definitivement "${confirmDelete?.nomFichier}" ? Cette action est irreversible.`}
                confirmLabel="Supprimer"
                danger
                onConfirm={confirmDeleteDocument}
                onCancel={() =>
                    setConfirmDelete(null)
                }
            />
        </div>
    );
}