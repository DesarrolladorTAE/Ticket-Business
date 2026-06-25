import axios from "axios";

const axiosCliente = axios.create({

  baseURL: "https://api.thebusinessticket.com/api",

  headers: {

    "Content-Type": "application/json",

    Accept: "application/json",

  },

});


axiosCliente.interceptors.request.use(

  (config) => {

    const token = localStorage.getItem("TOKEN");


    if (token) {

      config.headers.Authorization = `Bearer ${token}`;

    }


    return config;

  },


  (error) => {

    return Promise.reject(error);

  }

);



axiosCliente.interceptors.response.use(

  (response) => response,


  (error) => {


    if (
      error.response &&
      error.response.status === 401
    ) {

      localStorage.removeItem("TOKEN");

      localStorage.removeItem("USUARIO");

    }


    return Promise.reject(error);

  }

);


export default axiosCliente;