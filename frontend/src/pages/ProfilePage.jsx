import { useEffect, useRef, useState } from "react";
import { getProfile, updateProfile, uploadPhoto } from "../api/profileService";
import { changePassword } from "../api/authService";
import { extractErrorMessage } from "../api/axiosClient";
import { useNotification } from "../notifications/NotificationContext";
import { useAuth } from "../auth/useAuth";
import { isPasswordValid } from "../utils/passwordPolicy";
import PasswordRulesHint from "../components/PasswordRulesHint";
import LoadingSpinner from "../components/LoadingSpinner";
import { toAbsoluteFileUrl } from "../api/config";

export default function ProfilePage() {
  const notification = useNotification();
  const { updateStoredUser } = useAuth();
  const fileInputRef = useRef(null);

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [infoForm, setInfoForm] = useState(null);
  const [savingInfo, setSavingInfo] = useState(false);
  const [infoError, setInfoError] = useState("");

  const [pwForm, setPwForm] = useState({ ancienMotDePasse: "", nouveauMotDePasse: "", confirmationMotDePasse: "" });
  const [savingPw, setSavingPw] = useState(false);
  const [pwError, setPwError] = useState("");

  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  function load() {
    return getProfile().then((data) => {
      setProfile(data);
      setInfoForm({ nom: data.nom, prenom: data.prenom, username: data.username, email: data.email });
      updateStoredUser(data);
    });
  }

  useEffect(() => {
    load()
      .catch((err) => notification.error(extractErrorMessage(err)))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleInfoSubmit(e) {
    e.preventDefault();
    setInfoError("");
    setSavingInfo(true);
    try {
      const updated = await updateProfile(infoForm);
      setProfile(updated);
      updateStoredUser(updated);
      notification.success("Profil mis a jour");
    } catch (err) {
      setInfoError(extractErrorMessage(err));
    } finally {
      setSavingInfo(false);
    }
  }

  async function handlePasswordSubmit(e) {
    e.preventDefault();
    setPwError("");

    if (!isPasswordValid(pwForm.nouveauMotDePasse)) {
      setPwError("Le nouveau mot de passe ne respecte pas la politique de securite requise");
      return;
    }
    if (pwForm.nouveauMotDePasse !== pwForm.confirmationMotDePasse) {
      setPwError("La confirmation ne correspond pas au nouveau mot de passe");
      return;
    }

    setSavingPw(true);
    try {
      await changePassword(pwForm.ancienMotDePasse, pwForm.nouveauMotDePasse, pwForm.confirmationMotDePasse);
      notification.success("Mot de passe modifie avec succes");
      setPwForm({ ancienMotDePasse: "", nouveauMotDePasse: "", confirmationMotDePasse: "" });
    } catch (err) {
      setPwError(extractErrorMessage(err));
    } finally {
      setSavingPw(false);
    }
  }

  async function handlePhotoChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPhoto(true);
    try {
      const updated = await uploadPhoto(file);
      setProfile(updated);
      updateStoredUser(updated);
      notification.success("Photo de profil mise a jour");
    } catch (err) {
      notification.error(extractErrorMessage(err));
    } finally {
      setUploadingPhoto(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  if (loading || !profile) return <LoadingSpinner />;

  const initials = `${profile.nom?.[0] ?? ""}${profile.prenom?.[0] ?? ""}`.toUpperCase();

  return (
    <div>
      <div className="page-header">
        <h2>Mon profil</h2>
      </div>

      <div className="card" style={{ maxWidth: 560, marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 20 }}>
          <div className="avatar-lg">
            {profile.photoUrl ? <img src={toAbsoluteFileUrl(profile.photoUrl)} alt="" /> : initials}
          </div>
          <div>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingPhoto}
            >
              {uploadingPhoto ? "Envoi..." : "Changer la photo"}
            </button>
            <p className="form-help">JPEG, PNG ou WebP, 2 Mo maximum</p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              style={{ display: "none" }}
              onChange={handlePhotoChange}
            />
          </div>
        </div>

        <form onSubmit={handleInfoSubmit} noValidate>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="nom">Nom</label>
              <input id="nom" className="form-input" value={infoForm.nom}
                     onChange={(e) => setInfoForm({ ...infoForm, nom: e.target.value })} required />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="prenom">Prenom</label>
              <input id="prenom" className="form-input" value={infoForm.prenom}
                     onChange={(e) => setInfoForm({ ...infoForm, prenom: e.target.value })} required />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="username">Nom d'utilisateur</label>
            <input id="username" className="form-input" value={infoForm.username}
                   onChange={(e) => setInfoForm({ ...infoForm, username: e.target.value })} required />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email</label>
            <input id="email" type="email" className="form-input" value={infoForm.email}
                   onChange={(e) => setInfoForm({ ...infoForm, email: e.target.value })} required />
          </div>

          {infoError && <div className="form-error" role="alert">{infoError}</div>}

          <button type="submit" className="btn btn-primary" disabled={savingInfo}>
            {savingInfo ? "Enregistrement..." : "Enregistrer les informations"}
          </button>
        </form>
      </div>

      <div className="card" style={{ maxWidth: 560 }}>
        <h3>Changer le mot de passe</h3>
        <form onSubmit={handlePasswordSubmit} noValidate>
          <div className="form-group">
            <label className="form-label" htmlFor="ancienMotDePasse">Mot de passe actuel</label>
            <input
              id="ancienMotDePasse"
              type="password"
              className="form-input"
              value={pwForm.ancienMotDePasse}
              onChange={(e) => setPwForm({ ...pwForm, ancienMotDePasse: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="nouveauMotDePasse">Nouveau mot de passe</label>
            <input
              id="nouveauMotDePasse"
              type="password"
              className="form-input"
              value={pwForm.nouveauMotDePasse}
              onChange={(e) => setPwForm({ ...pwForm, nouveauMotDePasse: e.target.value })}
              required
            />
            <PasswordRulesHint password={pwForm.nouveauMotDePasse} />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="confirmationMotDePasse">Confirmation</label>
            <input
              id="confirmationMotDePasse"
              type="password"
              className="form-input"
              value={pwForm.confirmationMotDePasse}
              onChange={(e) => setPwForm({ ...pwForm, confirmationMotDePasse: e.target.value })}
              required
            />
          </div>

          {pwError && <div className="form-error" role="alert">{pwError}</div>}

          <button type="submit" className="btn btn-primary" disabled={savingPw}>
            {savingPw ? "Modification..." : "Changer le mot de passe"}
          </button>
        </form>
      </div>
    </div>
  );
}
