import {NextApiRequest, NextApiResponse} from "next";
import {AxiosHeaders, AxiosRequestConfig} from "axios";
import axios from "@/core/axios";

export default async function cookieWrapper(
    req: NextApiRequest,
    res: NextApiResponse,
    axiosConfig: AxiosRequestConfig
) {
    const reqCookie = req.cookies;
    console.log(`req cookie:`);
    console.log(reqCookie);

    const response = await axios({
        ...axiosConfig,
        headers: {
            ...axiosConfig.headers,
            'Content-Type': 'application/json',
            Cookie: req.headers.cookie
        }
    })

    const cookie = (response.headers as AxiosHeaders)
        .get('set-cookie') as string[];
    console.log(cookie);

    res.status(200)
        .setHeader("Set-Cookie", cookie)
        .json(response.data);
}