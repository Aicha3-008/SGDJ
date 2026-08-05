import axiosClient from "./axiosClient";

export function searchUsers({ query, role, actif, page = 0, size = 10, sort = "dateCreation,desc" } = {}) {
  return axiosClient
    .get("/utilisateurs", { params: { query, role, actif, page, size, sort } })
    .then((res) => res.data);
}

export function getUser(id) {
  return axiosClient.get(`/utilisateurs/${id}`).then((res) => res.data);
}

export function createUser(payload) {
  return axiosClient.post("/utilisateurs", payload).then((res) => res.data);
}

export function updateUser(id, payload) {
  return axiosClient.put(`/utilisateurs/${id}`, payload).then((res) => res.data);
}

export function deleteUser(id) {
  return axiosClient.delete(`/utilisateurs/${id}`).then((res) => res.data);
}

export function desactiverUser(id) {
  return axiosClient.patch(`/utilisateurs/${id}/desactiver`).then((res) => res.data);
}

export function reactiverUser(id) {
  return axiosClient.patch(`/utilisateurs/${id}/reactiver`).then((res) => res.data);
}

export function deverrouillerUser(id) {
  return axiosClient.patch(`/utilisateurs/${id}/deverrouiller`).then((res) => res.data);
}
