import 'reflect-metadata';
import './DI';
import { container } from 'tsyringe';
import * as lambda from 'aws-lambda';
import { Handler } from './Handler';
import * as machine from './machine';

export const handle: lambda.APIGatewayProxyHandler = async (
  req: lambda.APIGatewayProxyEvent, ctx: lambda.Context
): Promise<lambda.APIGatewayProxyResult> => {

  const handler = container.resolve(Handler.name) as Handler;
  const r =  await handler.handle(req);
  console.log('Returning response:');
  console.log(r);
  return r;
};

export const handleMachine = async (
  machineContext: machine.MachineContext, ctx: lambda.Context
): Promise<machine.MachineContext> => {

  const orchestrator = container.resolve(machine.MachineOrchestrator.name) as machine.MachineOrchestrator;
  const r =  await orchestrator.handle(machineContext);
  console.log('Returning context:');
  console.log(r);
  return r;
};