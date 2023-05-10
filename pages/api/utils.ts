import {NextApiRequest, NextApiResponse} from "next";
import {AxiosHeaders, AxiosRequestConfig} from "axios";
import {externalClient} from "@/core/axios";

export default async function cookieWrapper(
    req: NextApiRequest,
    res: NextApiResponse,
    axiosConfig: AxiosRequestConfig,
    deleteCookie: boolean = false,
): Promise<string> {
    const response = await externalClient({
        ...axiosConfig,
        headers: {
            ...axiosConfig.headers,
            'Content-Type': 'application/json',
            Cookie: req.headers.cookie
        }
    });

    let cookie: string[] = (response.headers as AxiosHeaders).get('set-cookie') as string[];
    if (deleteCookie) {
        cookie = [`${req.headers.cookie}; Max-Age=0`];
    }

    res.status(200)
        .setHeader("Set-Cookie", cookie)
        .json(response.data);
    return response.data;
}