import axios from "axios";

const useLocalBack = false;
const localhost = 'http://localhost:4000';
const awsUrl = 'https://zcos2vb20k.execute-api.us-east-1.amazonaws.com/dev';
const BACKEND_BASE_URL = useLocalBack ? localhost : awsUrl;

export const externalClient = axios.create({
    baseURL: BACKEND_BASE_URL,
    withCredentials: true,
});


export const internalClient = axios.create({withCredentials: true});

internalClient.interceptors.request.use(request => {
    try {
        console.log('Starting Request', JSON.stringify(request))
    } catch (e) {
        console.log(`Can't parse request, error: ${e}`);
    }
    return request
});

internalClient.interceptors.response.use(response => {
    try {
        console.log('Response:', JSON.stringify(response))
    } catch (e) {
        console.log(`Can't parse response, error: ${e}`);
    }
    return response
});