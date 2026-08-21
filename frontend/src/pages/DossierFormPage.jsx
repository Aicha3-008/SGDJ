import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
    createDossier,
    getDossier,
    updateDossier,
} from "../api/dossierService";

import { extractErrorMessage } from "../api/axiosClient";
import { useNotification } from "../notifications/NotificationContext";
import LoadingSpinner from "../components/LoadingSpinner";
import { useAuth } from "../auth/useAuth";

const EMPTY_FORM = {
    numeroDossier: "",
    objet: "",
    description: "",
    tribunal: "",
    juge: "",
    procureur: "",
    statut: "EN_COURS",
};

export default function DossierFormPage() {

    const { id } = useParams();
    const isEdit = !!id;

    const navigate = useNavigate();
    const notification = useNotification();

    const { isAdmin } = useAuth();

    const [form, setForm] = useState(EMPTY_FORM);
    const [loading, setLoading] = useState(isEdit);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    // ======================================================
    // VERIFICATION DES DROITS
    // ======================================================

    useEffect(() => {

        if (isEdit && !isAdmin) {

            notification.error(
                "Vous n'avez pas l'autorisation de modifier ce dossier."
            );

            navigate("/dossiers", {
                replace: true,
            });
        }

    }, [
        isEdit,
        isAdmin,
        navigate,
        notification,
    ]);


    // ======================================================
    // CHARGER LE DOSSIER EN MODIFICATION
    // ======================================================

    useEffect(() => {

        if (!isEdit || !isAdmin) {
            return;
        }

        getDossier(id)

            .then((dossier) => {

                setForm({
                    numeroDossier:
                        dossier.numeroDossier ?? "",

                    objet:
                        dossier.objet ?? "",

                    description:
                        dossier.description ?? "",

                    tribunal:
                        dossier.tribunal ?? "",

                    juge:
                        dossier.juge ?? "",

                    procureur:
                        dossier.procureur ?? "",

                    statut:
                        dossier.statut ?? "EN_COURS",
                });

            })

            .catch((err) => {

                notification.error(
                    extractErrorMessage(err)
                );

            })

            .finally(() => {

                setLoading(false);

            });

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id, isEdit, isAdmin]);


    // ======================================================
    // MODIFIER UN CHAMP
    // ======================================================

    function updateField(field, value) {

        setForm((previous) => ({
            ...previous,
            [field]: value,
        }));

    }


    // ======================================================
    // ENREGISTRER
    // ======================================================

    async function handleSubmit(event) {

        event.preventDefault();

        setError("");

        // Vérification des champs obligatoires
        if (
            !form.numeroDossier.trim() ||
            !form.objet.trim()
        ) {

            setError(
                "Le numero de dossier et l'objet sont obligatoires"
            );

            return;
        }


        // Seul ADMIN peut modifier
        if (isEdit && !isAdmin) {

            setError(
                "Vous n'avez pas l'autorisation de modifier ce dossier."
            );

            return;
        }


        setSaving(true);

        try {

            // ==================================================
            // MODIFICATION
            // ==================================================

            if (isEdit) {

                const updatePayload = {

                    objet: form.objet,

                    description:
                    form.description,

                    tribunal:
                    form.tribunal,

                    juge:
                    form.juge,

                    procureur:
                    form.procureur,

                    statut:
                    form.statut,
                };


                await updateDossier(
                    id,
                    updatePayload
                );


                notification.success(
                    "Dossier modifie avec succes"
                );

            }

                // ==================================================
                // CREATION
            // ==================================================

            else {

                /*
                 * Le backend impose EN_COURS
                 * à la création.
                 */
                const createPayload = {

                    numeroDossier:
                    form.numeroDossier,

                    objet:
                    form.objet,

                    description:
                    form.description,

                    tribunal:
                    form.tribunal,

                    juge:
                    form.juge,

                    procureur:
                    form.procureur,

                    statut:
                        "EN_COURS",
                };


                await createDossier(
                    createPayload
                );


                notification.success(
                    "Dossier cree avec succes"
                );
            }


            navigate("/dossiers");

        } catch (err) {

            setError(
                extractErrorMessage(err)
            );

        } finally {

            setSaving(false);
        }
    }


    // ======================================================
    // CHARGEMENT
    // ======================================================

    if (loading) {

        return <LoadingSpinner />;

    }


    // ======================================================
    // UTILISATEUR NON ADMIN EN MODIFICATION
    // ======================================================

    if (isEdit && !isAdmin) {

        return null;

    }


    // ======================================================
    // INTERFACE
    // ======================================================

    return (

        <div>

            <div className="page-header">

                <h2>

                    {isEdit
                        ? "Modifier le dossier"
                        : "Nouveau dossier"}

                </h2>

            </div>


            <div
                className="card"
                style={{
                    maxWidth: 640,
                }}
            >

                <form
                    onSubmit={handleSubmit}
                    noValidate
                >


                    {/* ==================================================
                        NUMERO + STATUT
                    ================================================== */}

                    <div className="form-row">


                        {/* NUMERO DE DOSSIER */}

                        <div className="form-group">

                            <label
                                className="form-label"
                                htmlFor="numeroDossier"
                            >
                                Numero de dossier
                            </label>


                            <input
                                id="numeroDossier"
                                className="form-input"
                                type="text"
                                inputMode="numeric"

                                value={
                                    form.numeroDossier
                                }

                                onChange={(event) =>
                                    updateField(
                                        "numeroDossier",
                                        event.target.value.replace(
                                            /\D/g,
                                            ""
                                        )
                                    )
                                }

                                maxLength={50}
                                required

                                disabled={isEdit}
                            />

                        </div>


                        {/* ==================================================
                            STATUT
                        ================================================== */}

                        <div className="form-group">

                            <label className="form-label">
                                Statut
                            </label>


                            {isEdit ? (

                                <>

                                    {/* ==============================
                                        EN_COURS
                                    ============================== */}

                                    {form.statut === "EN_COURS" && (

                                        <select
                                            className="form-select"
                                            value={form.statut}

                                            onChange={(event) =>
                                                updateField(
                                                    "statut",
                                                    event.target.value
                                                )
                                            }
                                        >

                                            <option value="EN_COURS">
                                                En cours
                                            </option>

                                            <option value="CLOTURE">
                                                Clôturé
                                            </option>

                                        </select>

                                    )}


                                    {/* ==============================
                                        CLOTURE
                                    ============================== */}

                                    {form.statut === "CLOTURE" && (

                                        <input
                                            className="form-input"
                                            value="Clôturé"
                                            disabled
                                            readOnly
                                        />

                                    )}


                                    {/* ==============================
                                        ARCHIVE
                                    ============================== */}

                                    {form.statut === "ARCHIVE" && (

                                        <input
                                            className="form-input"
                                            value="Archivé"
                                            disabled
                                            readOnly
                                        />

                                    )}

                                </>

                            ) : (

                                /* ==============================
                                   CREATION
                                ============================== */

                                <input
                                    className="form-input"
                                    value="En cours"
                                    disabled
                                    readOnly
                                />

                            )}

                        </div>

                    </div>


                    {/* ==================================================
                        OBJET
                    ================================================== */}

                    <div className="form-group">

                        <label
                            className="form-label"
                            htmlFor="objet"
                        >
                            Objet
                        </label>


                        <input
                            id="objet"
                            className="form-input"
                            type="text"

                            value={
                                form.objet
                            }

                            onChange={(event) =>
                                updateField(
                                    "objet",
                                    event.target.value.replace(
                                        /[^\p{L}\s'-]/gu,
                                        ""
                                    )
                                )
                            }

                            maxLength={255}
                            required
                        />

                    </div>


                    {/* ==================================================
                        DESCRIPTION
                    ================================================== */}

                    <div className="form-group">

                        <label
                            className="form-label"
                            htmlFor="description"
                        >
                            Description
                        </label>


                        <textarea
                            id="description"
                            className="form-input"
                            rows={4}

                            value={
                                form.description
                            }

                            onChange={(event) =>
                                updateField(
                                    "description",
                                    event.target.value
                                )
                            }
                        />

                    </div>


                    {/* ==================================================
                        TRIBUNAL / JUGE / PROCUREUR
                    ================================================== */}

                    <div className="form-row">


                        {/* TRIBUNAL */}

                        <div className="form-group">

                            <label
                                className="form-label"
                                htmlFor="tribunal"
                            >
                                Tribunal
                            </label>


                            <input
                                id="tribunal"
                                className="form-input"
                                type="text"

                                value={
                                    form.tribunal
                                }

                                onChange={(event) =>
                                    updateField(
                                        "tribunal",
                                        event.target.value.replace(
                                            /[^\p{L}\s'-]/gu,
                                            ""
                                        )
                                    )
                                }

                                maxLength={150}
                            />

                        </div>


                        {/* JUGE */}

                        <div className="form-group">

                            <label
                                className="form-label"
                                htmlFor="juge"
                            >
                                Juge
                            </label>


                            <input
                                id="juge"
                                className="form-input"
                                type="text"

                                value={
                                    form.juge
                                }

                                onChange={(event) =>
                                    updateField(
                                        "juge",
                                        event.target.value.replace(
                                            /[^\p{L}\s'-]/gu,
                                            ""
                                        )
                                    )
                                }

                                maxLength={150}
                            />

                        </div>


                        {/* PROCUREUR */}

                        <div className="form-group">

                            <label
                                className="form-label"
                                htmlFor="procureur"
                            >
                                Procureur
                            </label>


                            <input
                                id="procureur"
                                className="form-input"
                                type="text"

                                value={
                                    form.procureur
                                }

                                onChange={(event) =>
                                    updateField(
                                        "procureur",
                                        event.target.value.replace(
                                            /[^\p{L}\s'-]/gu,
                                            ""
                                        )
                                    )
                                }

                                maxLength={150}
                            />

                        </div>

                    </div>


                    {/* ==================================================
                        ERREUR
                    ================================================== */}

                    {error && (

                        <div
                            className="form-error"
                            role="alert"
                        >
                            {error}
                        </div>

                    )}


                    {/* ==================================================
                        BOUTONS
                    ================================================== */}

                    <div
                        style={{
                            display: "flex",
                            gap: 8,
                            marginTop: 8,
                        }}
                    >

                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={saving}
                        >

                            {saving
                                ? "Enregistrement..."
                                : "Enregistrer"}

                        </button>


                        <button
                            type="button"
                            className="btn btn-secondary"

                            onClick={() =>
                                navigate("/dossiers")
                            }
                        >
                            Annuler
                        </button>

                    </div>

                </form>

            </div>

        </div>
    );
}