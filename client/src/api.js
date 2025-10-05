import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000",
  timeout: 10000,
  withCredentials: true
});

export default API;

export const setAuthToken = (token) => {
  if (token) API.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  else delete API.defaults.headers.common["Authorization"];
};
