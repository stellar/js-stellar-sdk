import axios from "axios";

export const axiosClient = axios;
console.log("USING AXIOS VERSION", axiosClient.VERSION);
export const create = axios.create;
