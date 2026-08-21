import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
    getAllDossiers,
    searchDossiers,
    getDossiersByStatut,
    deleteDossier,
} from "../api/dossierService";

import LoadingSpinner from "../components/LoadingSpinner";
import Pagination from "../components/Pagination";
import ConfirmDialog from "../components/ConfirmDialog";

import { extractErrorMessage } from "../api/axiosClient";
import { useNotification } from "../notifications/NotificationContext";
import { useDebounce } from "../utils/useDebounce";
import { useAuth } from "../auth/useAuth";

const PAGE_SIZE = 10;

const STATUT_LABELS = {
    EN_COURS: "En cours",
    CLOTURE: "Cloture",
    ARCHIVE: "Archive",
};

const STATUT_BADGES = {
    EN_COURS: "badge-info",
    CLOTURE: "badge-success",
    ARCHIVE: "badge-warning",
};

export default function DossiersListPage() {

    const { isAdmin, user } = useAuth();

    const notification = useNotification();

    const [query, setQuery] = useState("");
    const debouncedQuery = useDebounce(query, 400);

    const [statut, setStatut] = useState("");
    const [page, setPage] = useState(0);

    const [data, setData] = useState({
        content: [],
        totalPages: 0,
        totalElements: 0,
    });

    const [loading, setLoading] = useState(true);
    const [confirmAction, setConfirmAction] = useState(null);

    // ======================================================
    // CHARGEMENT DES DOSSIERS
    // ======================================================

    const load = useCallback(() => {

        setLoading(true);

        const request = statut
            ? getDossiersByStatut(statut, {
                page,
                size: PAGE_SIZE,
            })
            : debouncedQuery
                ? searchDossiers({
                    query: debouncedQuery,
                    page,
                    size: PAGE_SIZE,
                })
                : getAllDossiers({
                    page,
                    size: PAGE_SIZE,
                });

        request
            .then(setData)
            .catch((err) => {
                notification.error(
                    extractErrorMessage(err)
                );
            })
            .finally(() => {
                setLoading(false);
            });

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debouncedQuery, statut, page]);

    useEffect(() => {
        load();
    }, [load]);

    // Revenir à la première page
    // lorsqu'une recherche ou un filtre change
    useEffect(() => {
        setPage(0);
    }, [debouncedQuery, statut]);

    // ======================================================
    // EXECUTER UNE ACTION
    // ======================================================

    async function runAction(action, successMessage) {

        try {

            await action();

            notification.success(
                successMessage
            );

            load();

        } catch (err) {

            notification.error(
                extractErrorMessage(err)
            );

        } finally {

            setConfirmAction(null);
        }
    }

    // ======================================================
    // SUPPRESSION
    // ======================================================

    function askDelete(dossier) {

        const isOwner =
            Number(dossier.utilisateurId) ===
            Number(user?.id);

        // Utilisateur :
        // uniquement ses propres dossiers
        if (!isAdmin && !isOwner) {

            notification.error(
                "Vous ne pouvez supprimer que vos propres dossiers."
            );

            return;
        }

        setConfirmAction({

            title: "Supprimer le dossier",

            message:
                `Supprimer definitivement le dossier ` +
                `${dossier.numeroDossier} ? ` +
                `Cette action est irreversible.`,

            confirmLabel: "Supprimer",

            danger: true,

            onConfirm: () =>
                runAction(
                    () => deleteDossier(dossier.id),
                    "Dossier supprime"
                ),
        });
    }

    // ======================================================
    // AFFICHAGE
    // ======================================================

    return (

        <div>

            {/* ==================================================
                EN-TÊTE
            ================================================== */}

            <div className="page-header">

                <h2>
                    Dossiers judiciaires
                </h2>

                <Link
                    to="/dossiers/nouveau"
                    className="btn btn-primary"
                >
                    + Nouveau dossier
                </Link>

            </div>

            {/* ==================================================
                FILTRES
            ================================================== */}

            <div className="filters-bar">

                <input
                    className="form-input"
                    placeholder="Rechercher (numero de dossier, objet)..."
                    value={query}
                    onChange={(e) =>
                        setQuery(e.target.value)
                    }
                    disabled={!!statut}
                />

                <select
                    className="form-select"
                    value={statut}
                    onChange={(e) =>
                        setStatut(e.target.value)
                    }
                >

                    <option value="">
                        Tous les statuts
                    </option>

                    <option value="EN_COURS">
                        En cours
                    </option>

                    <option value="CLOTURE">
                        Cloture
                    </option>

                    <option value="ARCHIVE">
                        Archive
                    </option>

                </select>

            </div>

            {/* ==================================================
                CONTENU
            ================================================== */}

            {loading ? (

                <LoadingSpinner />

            ) : data.content.length === 0 ? (

                <div className="empty-state">
                    Aucun dossier trouve
                </div>

            ) : (

                <>

                    <div className="table-wrapper">

                        <table className="data-table">

                            <thead>

                            <tr>

                                <th>
                                    Numero
                                </th>

                                <th>
                                    Objet
                                </th>

                                <th>
                                    Tribunal
                                </th>

                                <th>
                                    Statut
                                </th>

                                <th>
                                    Cree le
                                </th>

                                <th>
                                    Actions
                                </th>

                            </tr>

                            </thead>

                            <tbody>

                            {data.content.map(
                                (dossier) => {

                                    // Vérifier si le dossier appartient
                                    // à l'utilisateur connecté
                                    const isOwner =
                                        Number(
                                            dossier.utilisateurId
                                        ) ===
                                        Number(user?.id);

                                    const statutLabel =
                                        STATUT_LABELS[
                                            dossier.statut
                                            ] || dossier.statut;

                                    const statutBadge =
                                        STATUT_BADGES[
                                            dossier.statut
                                            ] || "badge-info";

                                    return (

                                        <tr
                                            key={dossier.id}
                                        >

                                            {/* NUMERO */}

                                            <td>
                                                {dossier.numeroDossier}
                                            </td>

                                            {/* OBJET */}

                                            <td>
                                                {dossier.objet}
                                            </td>

                                            {/* TRIBUNAL */}

                                            <td>
                                                {dossier.tribunal || "-"}
                                            </td>

                                            {/* STATUT */}
                                            {/* Lecture seule */}

                                            <td>

                                                <span
                                                    className={`badge ${statutBadge}`}
                                                >
                                                    {statutLabel}
                                                </span>

                                            </td>

                                            {/* DATE CREATION */}

                                            <td>

                                                {dossier.dateCreation
                                                    ? new Date(
                                                        dossier.dateCreation
                                                    ).toLocaleDateString()
                                                    : "-"}

                                            </td>

                                            {/* ==================================================
                                                ACTIONS
                                            ================================================== */}

                                            <td className="actions-cell">

                                                {/* Tout le monde peut consulter */}

                                                <Link
                                                    to={`/dossiers/${dossier.id}`}
                                                    className="btn btn-secondary btn-sm"
                                                >
                                                    Consulter
                                                </Link>


                                                {/* ==================================================
                                                    MODIFIER
                                                    ADMIN UNIQUEMENT
                                                ================================================== */}

                                                {isAdmin && (

                                                    <Link
                                                        to={`/dossiers/${dossier.id}/modifier`}
                                                        className="btn btn-secondary btn-sm"
                                                    >
                                                        Modifier
                                                    </Link>

                                                )}


                                                {/* ==================================================
                                                    SUPPRIMER
                                                ==================================================

                                                    ADMIN :
                                                    tous les dossiers

                                                    UTILISATEUR :
                                                    uniquement ses propres dossiers
                                                */}

                                                {(isAdmin || isOwner) && (

                                                    <button
                                                        type="button"
                                                        className="btn btn-danger btn-sm"
                                                        onClick={() =>
                                                            askDelete(dossier)
                                                        }
                                                    >
                                                        Supprimer
                                                    </button>

                                                )}

                                            </td>

                                        </tr>

                                    );
                                }
                            )}

                            </tbody>

                        </table>

                    </div>

                    {/* ==================================================
                        PAGINATION
                    ================================================== */}

                    <Pagination
                        page={page}
                        totalPages={data.totalPages}
                        onChange={setPage}
                    />

                </>

            )}

            {/* ==================================================
                CONFIRMATION SUPPRESSION
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