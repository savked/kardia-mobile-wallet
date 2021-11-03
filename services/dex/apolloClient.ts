import { ApolloClient, InMemoryCache } from "@apollo/client";
import { HASURA_ENDPOINT, SETTLEMENT_ENDPOINT, SUBGRAPH_BLOCKLYTICS_KAIBLOCK } from "../config";

export const apolloKaiBlockClient = new ApolloClient({
	uri: SUBGRAPH_BLOCKLYTICS_KAIBLOCK,
	cache: new InMemoryCache()
})

export const apolloSettlementClient = new ApolloClient({
	uri: SETTLEMENT_ENDPOINT,
	cache: new InMemoryCache()
})

export const apolloKaiDexClient = new ApolloClient({
  uri: HASURA_ENDPOINT,
  cache: new InMemoryCache()
})