import { GetParameterCommand, SSMClient } from '@aws-sdk/client-ssm';

const ssmClient = new SSMClient({});

export const getParameter = async (name: string, withDecryption = true): Promise<string> => {
  const response = await ssmClient.send(
    new GetParameterCommand({
      Name: name,
      WithDecryption: withDecryption
    })
  );

  if (response.Parameter?.Value === undefined) {
    throw new Error(`SSM parameter ${name} did not contain a value`);
  }

  return response.Parameter.Value;
};
