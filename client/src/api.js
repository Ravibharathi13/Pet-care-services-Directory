import axios from "axios";

const API = axios.create({
  baseURL: "https://pet-care-services-directory-server.onrender.com",
  timeout: 10000,
  withCredentials: true
});

export default API;

export const setAuthToken = (token) => {
  if (token) API.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  else delete API.defaults.headers.common["Authorization"];
};
