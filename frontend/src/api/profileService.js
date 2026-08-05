import axiosClient from "./axiosClient";

export function getProfile() {
  return axiosClient.get("/profile").then((res) => res.data);
}

export function updateProfile(payload) {
  return axiosClient.put("/profile", payload).then((res) => res.data);
}

export function uploadPhoto(file) {
  const formData = new FormData();
  formData.append("file", file);
  return axiosClient
    .post("/profile/photo", formData, { headers: { "Content-Type": "multipart/form-data" } })
    .then((res) => res.data);
}
