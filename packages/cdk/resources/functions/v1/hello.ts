import { Handler } from 'aws-lambda';

export const handler: Handler = async (event, context) => {
  return {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
    body: {
      message: 'Hello World',
    },
  };
};
