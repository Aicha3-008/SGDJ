export default function ConfirmDialog({ open, title, message, confirmLabel = "Confirmer", danger = false, onConfirm, onCancel }) {
  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed", inset: 0, background: "rgba(15,23,42,0.5)",
        display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999,
      }}
      onClick={onCancel}
    >
      <div className="card" style={{ maxWidth: 380, width: "90%" }} onClick={(e) => e.stopPropagation()}>
        <h3>{title}</h3>
        <p style={{ color: "var(--color-text-muted)", fontSize: "0.9rem" }}>{message}</p>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 16 }}>
          <button className="btn btn-secondary" onClick={onCancel}>Annuler</button>
          <button className={danger ? "btn btn-danger" : "btn btn-primary"} onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
