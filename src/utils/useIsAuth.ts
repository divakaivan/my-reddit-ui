import {useEffect} from "react";
import {useMeQuery} from "../generated/graphql";
import {useRouter} from "next/router";

export const useIsAuth = () => {
    const [{data, fetching}] = useMeQuery();
    const router = useRouter();
    useEffect(()=>{
        if (!fetching && !data?.me) {
            // go to login if not logged in when we come to this page
            router.replace("/login?next=" + router.pathname)
            // after user log in, take the user to the given page
        }
    }, [data, router]);
};