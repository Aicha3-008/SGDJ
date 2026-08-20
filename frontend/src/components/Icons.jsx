const common = {
  width: 18,
  height: 18,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

export function IconDashboard(props) {
  return (
    <svg {...common} {...props}>
      <rect x="3" y="3" width="7" height="9" rx="1.5" />
      <rect x="14" y="3" width="7" height="5" rx="1.5" />
      <rect x="14" y="12" width="7" height="9" rx="1.5" />
      <rect x="3" y="16" width="7" height="5" rx="1.5" />
    </svg>
  );
}

export function IconUsers(props) {
  return (
    <svg {...common} {...props}>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3.5 20c0-3.3 2.7-5.8 5.5-5.8s5.5 2.5 5.5 5.8" />
      <circle cx="17.5" cy="8.5" r="2.4" />
      <path d="M15.8 14.4c2.3 0.3 4.2 2.5 4.2 5.4" />
    </svg>
  );
}

export function IconProfile(props) {
  return (
    <svg {...common} {...props}>
      <circle cx="12" cy="8" r="3.6" />
      <path d="M4.5 20.2c0-4 3.4-6.8 7.5-6.8s7.5 2.8 7.5 6.8" />
    </svg>
  );
}

export function IconFolder(props) {
  return (
    <svg {...common} {...props}>
      <path d="M3 6.5a1.5 1.5 0 0 1 1.5-1.5h4.4l1.6 2h9a1.5 1.5 0 0 1 1.5 1.5v9.5A1.5 1.5 0 0 1 19.5 19.5h-15A1.5 1.5 0 0 1 3 18z" />
    </svg>
  );
}

export function IconArchive(props) {
  return (
    <svg {...common} {...props}>
      <rect x="3" y="4" width="18" height="4.5" rx="1" />
      <path d="M5 8.5v9.5a1.5 1.5 0 0 0 1.5 1.5h11a1.5 1.5 0 0 0 1.5-1.5V8.5" />
      <path d="M10 13h4" />
    </svg>
  );
}

export function IconClock(props) {
  return (
    <svg {...common} {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </svg>
  );
}

export function IconMenu(props) {
  return (
    <svg {...common} {...props}>
      <path d="M3.5 6.5h17" />
      <path d="M3.5 12h17" />
      <path d="M3.5 17.5h17" />
    </svg>
  );
}

export function IconLogout(props) {
  return (
    <svg {...common} {...props}>
      <path d="M9 4H6a1.5 1.5 0 0 0-1.5 1.5v13A1.5 1.5 0 0 0 6 20h3" />
      <path d="M15.5 16.5 20 12l-4.5-4.5" />
      <path d="M20 12H9.5" />
    </svg>
  );
}
