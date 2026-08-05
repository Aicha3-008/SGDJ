export const PASSWORD_RULES = [
  { label: "Au moins 12 caracteres", test: (pw) => pw.length >= 12 },
  { label: "Une majuscule", test: (pw) => /[A-Z]/.test(pw) },
  { label: "Une minuscule", test: (pw) => /[a-z]/.test(pw) },
  { label: "Un chiffre", test: (pw) => /[0-9]/.test(pw) },
  { label: "Un caractere special", test: (pw) => /[^A-Za-z0-9]/.test(pw) },
];

export function isPasswordValid(password) {
  return PASSWORD_RULES.every((rule) => rule.test(password || ""));
}
