import {ENDPOINT} from '../config';

export const mapValidatorRole = (role: number) => {
  switch (role) {
    case 0:
      return 'Candidate';
    case 1:
      return 'Validator';
    case 2:
      return 'Proposer';
  }
};

export const getCurrentStaking = async (address: string) => {
  const options = {
    method: 'GET',
  };
  const response = await fetch(
    `${ENDPOINT}delegators/${address}/validators`,
    options,
  );
  const responseJSON = await response.json();
  return Array.isArray(responseJSON.data) ? responseJSON.data : [];
};
