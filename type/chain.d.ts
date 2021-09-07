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
  contractAddress: Record<string, string | undefined>;
  bridge?: {
    fromKardiaChain?: string;
    toKardiaChain?: string;
  }
}