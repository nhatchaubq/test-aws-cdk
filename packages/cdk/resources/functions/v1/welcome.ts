import type { Handler } from 'aws-lambda';
import { sum } from '../../../../shared';

export const handler: Handler = async (event, context) => {
  const result = sum(1, 2);
  return {
    message: 'Welcome to the World? Or?',
    result,
  };
};
