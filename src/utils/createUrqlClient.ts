import {dedupExchange, fetchExchange, stringifyVariables} from "urql";
import {cacheExchange, Resolver} from "@urql/exchange-graphcache";
import {
    LogoutMutation,
    MeQuery,
    MeDocument,
    LoginMutation,
    RegisterMutation,
} from "../generated/graphql";
import {betterUpdateQuery} from "./betterUpdateQuery";


import {pipe, tap} from "wonka";
import {Exchange} from "urql";
import Router from "next/router";

// custom error handling
const errorExchange: Exchange = ({forward}) => ops$ => {
    return pipe(
        forward(ops$),
        tap(({error}) => {
            if (error?.message.includes('not authenticated')) {
                Router.replace("/login")
            }
        })
    )
}


export const cursorPagination = (): Resolver => {

    return (_parent, fieldArgs, cache, info) => {
        const {parentKey: entityKey, fieldName} = info;

        const allFields = cache.inspectFields(entityKey);
        const fieldInfos = allFields.filter(info => info.fieldName === fieldName);
        const size = fieldInfos.length;
        if (size === 0) {
            return undefined;
        }

        const isItInTheCache = cache.resolve(
            cache.resolveFieldByKey(entityKey,`${fieldName}(${stringifyVariables(fieldArgs)})`) as string,
            'posts'
        );
        info.partial = !isItInTheCache;
        // reading data from the cache and returning it
        let hasMore = true;
        const results: string[] = [];
        fieldInfos.forEach(fi=>{
            const key = cache.resolveFieldByKey(entityKey, fi.fieldKey) as string;
            const data = cache.resolve(key, 'posts') as string[];
            const _hasMore = cache.resolve(key, 'hasMore');
            if (!_hasMore) hasMore = _hasMore as boolean;
            results.push(...data)
        });
        return {
            __typename: 'PaginatedPosts',
            hasMore,
            posts: results
        }
    };
};


export const createUrqlClient = (ssrExchange: any) => ({
    url: "http://localhost:4000/graphql",
    fetchOptions: {
        credentials: "include" as const,
    },
    exchanges: [
        dedupExchange,
        cacheExchange({
            keys: {
                PaginatedPosts: () => null
            },
            resolvers: {
                Query: {
                    posts: cursorPagination()
                }
            },
            updates: {
                Mutation: {
                    logout: (_result, _args, cache, _info) => {
                        betterUpdateQuery<LogoutMutation, MeQuery>(
                            cache,
                            {query: MeDocument},
                            _result,
                            () => ({me: null})
                        );
                    },
                    login: (_result, _args, cache, _info) => {
                        betterUpdateQuery<LoginMutation, MeQuery>(
                            cache,
                            {query: MeDocument},
                            _result,
                            (result, query) => {
                                if (result.login.errors) {
                                    return query;
                                } else {
                                    return {
                                        me: result.login.user,
                                    };
                                }
                            }
                        );
                    },
                    register: (_result, _args, cache, _info) => {
                        betterUpdateQuery<RegisterMutation, MeQuery>(
                            cache,
                            {query: MeDocument},
                            _result,
                            (result, query) => {
                                if (result.register.errors) {
                                    return query;
                                } else {
                                    return {
                                        me: result.register.user,
                                    };
                                }
                            }
                        );
                    },
                },
            },
        }),
        errorExchange,
        ssrExchange,
        fetchExchange,
    ],
});
