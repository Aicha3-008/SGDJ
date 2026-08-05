export default function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i);
  const visiblePages = pages.filter((p) => p === 0 || p === totalPages - 1 || Math.abs(p - page) <= 1);

  const items = [];
  let previous = -1;
  for (const p of visiblePages) {
    if (previous !== -1 && p - previous > 1) {
      items.push(<span key={`ellipsis-${p}`} style={{ padding: "0 4px" }}>...</span>);
    }
    items.push(
      <button key={p} className={p === page ? "active" : ""} onClick={() => onChange(p)}>
        {p + 1}
      </button>
    );
    previous = p;
  }

  return (
    <div className="pagination">
      <button disabled={page === 0} onClick={() => onChange(page - 1)}>
        &laquo;
      </button>
      {items}
      <button disabled={page >= totalPages - 1} onClick={() => onChange(page + 1)}>
        &raquo;
      </button>
    </div>
  );
}
