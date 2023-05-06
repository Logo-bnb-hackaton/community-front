import axios from "axios";

// todo fix it before commit
const useLocalBack = false;
const localhost = 'http://localhost:4000';
// const awsUrl = 'https://jr6v17son2.execute-api.us-east-1.amazonaws.com/dev';
const awsUrl = 'https://zcos2vb20k.execute-api.us-east-1.amazonaws.com/dev';
const BACKEND_BASE_URL = useLocalBack ? localhost : awsUrl;


const instance = axios.create({
    baseURL: BACKEND_BASE_URL,
    withCredentials: true,
});

instance.interceptors.request.use(request => {
    console.log('Starting Request', JSON.stringify(request, null, 2))
    return request
})

instance.interceptors.response.use(response => {
    console.log('Response:', JSON.stringify(response, null, 2))
    return response
})

export default instance;
