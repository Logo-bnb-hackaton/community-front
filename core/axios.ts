import axios from "axios";

// todo fix it before commit
const useLocalBack = false;
const localhost = 'http://localhost:8080';
const awsUrl = 'https://jr6v17son2.execute-api.us-east-1.amazonaws.com/dev';
const BACKEND_BASE_URL = useLocalBack ? localhost : awsUrl;

axios.defaults.baseURL = BACKEND_BASE_URL;

export default axios;
