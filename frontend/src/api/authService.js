import axiosClient from "./axiosClient";

export function login(email, motDePasse) {
  return axiosClient.post("/auth/login", { email, motDePasse }).then((res) => res.data);
}

export function logout() {
  return axiosClient.post("/auth/logout").then((res) => res.data);
}

export function forgotPassword(email) {
  return axiosClient.post("/auth/forgot-password", { email }).then((res) => res.data);
}

export function resetPassword(token, nouveauMotDePasse, confirmationMotDePasse) {
  return axiosClient
    .post("/auth/reset-password", { token, nouveauMotDePasse, confirmationMotDePasse })
    .then((res) => res.data);
}

export function changePassword(ancienMotDePasse, nouveauMotDePasse, confirmationMotDePasse) {
  return axiosClient
    .put("/profile/password", { ancienMotDePasse, nouveauMotDePasse, confirmationMotDePasse })
    .then((res) => res.data);
}
