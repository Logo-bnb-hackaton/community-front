import {NextApiRequest, NextApiResponse} from "next";
import {AxiosHeaders, AxiosRequestConfig} from "axios";
import {externalClient} from "@/core/axios";

export default async function cookieWrapper(
    req: NextApiRequest,
    res: NextApiResponse,
    axiosConfig: AxiosRequestConfig
) {
    const response = await externalClient({
        ...axiosConfig,
        headers: {
            ...axiosConfig.headers,
            'Content-Type': 'application/json',
            Cookie: req.headers.cookie
        }
    })

    const cookie = (response.headers as AxiosHeaders).get('set-cookie') as string[];

    res.status(200)
        .setHeader("Set-Cookie", cookie)
        .json(response.data);
}