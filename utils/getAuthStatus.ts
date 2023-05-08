import {GetServerSidePropsContext} from "next";
import {getAuthCookie} from "@/utils/cookie";
import {AuthenticationStatus} from "@rainbow-me/rainbowkit/dist/components/RainbowKitProvider/AuthenticationContext";

export const getAuthStatus = (ctx: GetServerSidePropsContext): AuthenticationStatus => {
    const status = getAuthCookie(ctx) !== undefined ? 'authenticated' : 'unauthenticated';
    console.log(`Auth status: ${status}`);
    return status;
};

export const isAuth = (status: AuthenticationStatus): boolean => {
    return status === 'authenticated';
}