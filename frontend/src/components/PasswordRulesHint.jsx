import { PASSWORD_RULES } from "../utils/passwordPolicy";

export default function PasswordRulesHint({ password }) {
  return (
    <ul style={{ margin: "6px 0 0", paddingLeft: 18, fontSize: "0.78rem" }}>
      {PASSWORD_RULES.map((rule) => {
        const ok = rule.test(password || "");
        return (
          <li key={rule.label} style={{ color: ok ? "var(--color-success)" : "var(--color-text-muted)" }}>
            {ok ? "✓" : "•"} {rule.label}
          </li>
        );
      })}
    </ul>
  );
}
