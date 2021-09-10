interface DualNodeToken extends KRC20 {
  universalSymbol: string
}

interface DualNodeChain {
  name: string;
  supportedTokenStandard: string[];
  chainId: number;
  icon: string;
  supportedAssets: DualNodeToken[];
  underlyingToken: Record<string, DualNodeToken | undefined>;
  otherChainToken: Record<string, DualNodeToken | undefined>;
  bridgeContractAddress: {
    fromKardiaChain?: Record<string, string | undefined>;
    fromOtherChain?: Record<string, string | undefined>;
  },
  defaultAsset: string;
}