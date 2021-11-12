interface StakingUnbondedRecord {
  balance: string;
  completionTime: Date;
}

interface Staking {
  claimableRewards: string;
  name: string;
  stakedAmount: string;
  unbondedAmount: string;
  unbondedRecords: StakingUnbondedRecord[]
  validator: string;
  validatorContractAddr: string;
  validatorRole: number;
  validatorStatus: number;
  withdrawableAmount: string;
}

interface Delegator {
  address: string;
  reward: string;
  stakedAmount: string;
}

interface Validator {
  accumulatedCommission: string;
  address: string;
  commissionRate: string;
  delegators: Delegator[];
  jailed: boolean;
  maxChangeRate: string;
  name: string;
  role: number;
  signingInfo: {
    indexOffset: number;
    indicatorRate: number;
    jailedUntil: number;
    missedBlockCounter: number;
    startHeight: number;
    tombstoned: boolean;
  };
  smcAddress: string;
  stakedAmount: string;
  status: number;
  totalDelegators: number;
  updateTime: number;
  votingPowerPercentage: string;
}
