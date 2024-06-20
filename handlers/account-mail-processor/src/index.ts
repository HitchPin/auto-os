import * as lambda from 'aws-lambda';
import { S3 } from '@aws-sdk/client-s3';
import { extractTenantAccounts } from './address';
import * as fans from './notifications';

// AWS Account emails are in the form of:
// tenant-${tenantId}-aws-${clusterName}@tenants.auto-os.dev

let fan: fans.IFan | undefined = undefined;
const getFan = () => {
  if (fan === undefined) {
    fan = createFanout();
  }
  return fan!;
}

export const handle: lambda.SESHandler = async (
  req: lambda.SESEvent, ctx: lambda.Context
): Promise<void> => {
  for (let i = 0; i < req.Records.length; i++) {
    try {
      const r = req.Records[i];
      await handleRec(r);
    } catch (err) {
      console.error('Failed to process record:');
      console.error(err);
      throw err;
    }
  }
};

const handleRec = async (r: lambda.SESEventRecord) => {
  const dest = r.ses.mail.destination;
  const tas = extractTenantAccounts(dest);
  if (tas.length === 0) {
    return;
  }
  console.log('Found tenant accounts:');
  console.log(tas);
  console.log('in message:');
  console.log(r);

  for (var t = 0; t < tas.length; t++) {
    const ta = tas[t];
    const taResult = await getFan().send({
      tenantId: ta.tenantId,
      projectId: ta.projectName,
      timestamp: new Date(),
      email: r.ses.mail
    });
    console.log('Result:');
    console.log(taResult);
  }
}

const createFanout = (): fans.IFan => {
  const s3 = new fans.S3ArchiveFan({
    bucketName: process.env['BUCKET']!,
    prefix: process.env['PREFIX'] ?? ''
  });
  const eventBridge = new fans.EventBridgeFan({
    eventBusName: process.env['EVENT_BUS']!,
    s3Fan: s3
  });
  const combo = new fans.FanoutFan({
    fans: [ s3, eventBridge ]
  })
  return combo;
}