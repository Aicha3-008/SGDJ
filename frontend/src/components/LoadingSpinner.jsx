export default function LoadingSpinner({ label = "Chargement..." }) {
  return (
    <div className="loading-spinner" role="status">
      <div className="spinner" />
      <span>{label}</span>
    </div>
  );
}
