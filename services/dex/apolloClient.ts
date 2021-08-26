import { ApolloClient, InMemoryCache, HttpLink, split } from "@apollo/client";
import { getMainDefinition } from '@apollo/client/utilities';
import { WebSocketLink } from '@apollo/client/link/ws';
import { HASURA_ENDPOINT, HASURA_WS_ENDPOINT, SUBGRAPH_BLOCKLYTICS_KAIBLOCK, SETTLEMENT_ENDPOINT } from "../config";

export const apolloKaiBlockClient = new ApolloClient({
	uri: SUBGRAPH_BLOCKLYTICS_KAIBLOCK,
	cache: new InMemoryCache()
})

export const apolloSettlementClient = new ApolloClient({
	uri: SETTLEMENT_ENDPOINT,
	cache: new InMemoryCache()
})

const httpLink = new HttpLink({
  uri: HASURA_ENDPOINT
});

const wsLink = new WebSocketLink({
  uri: HASURA_WS_ENDPOINT,
  options: {
    reconnect: true
  }
});

const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    );
  },
  wsLink,
  httpLink,
);

export const apolloKaiDexClient = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache()
})