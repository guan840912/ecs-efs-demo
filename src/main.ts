import * as path from 'path';
import * as ec2 from '@aws-cdk/aws-ec2';
import * as ecs from '@aws-cdk/aws-ecs';
import * as efs from '@aws-cdk/aws-efs';
import * as iam from '@aws-cdk/aws-iam';
import * as log from '@aws-cdk/aws-logs';
import { App, Construct, Stack, StackProps, RemovalPolicy } from '@aws-cdk/core';
import { SyncSource, SyncedAccessPoint } from 'cdk-efs-assets';

export class MyStack extends Stack {
  constructor(scope: Construct, id: string, props: StackProps = {}) {
    super(scope, id, props);
    const vpc = new ec2.Vpc(this, 'Vpc', { natGateways: 1, maxAzs: 2 });
    const fs = new efs.FileSystem(this, 'Filesystem', {
      vpc,
      removalPolicy: RemovalPolicy.DESTROY,
    });
    fs.connections.allowFromAnyIpv4(ec2.Port.tcp(2049));
    new SyncedAccessPoint(this, 'GithubAccessPoint', {
      fileSystem: fs,
      path: '/demo-github',
      createAcl: {
        ownerGid: '1001',
        ownerUid: '1001',
        permissions: '0755',
      },
      posixUser: {
        uid: '1001',
        gid: '1001',
      },
      vpc,
      syncSource: SyncSource.github({
        vpc,
        repository: 'https://github.com/guan840912/guan840912.git',
      }),
    });
    const cluster = new ecs.Cluster(this, 'Cluster', { vpc });
    const taskDefinition = new ecs.FargateTaskDefinition(this, 'TaskApiSix', {
      memoryLimitMiB: 512,
      cpu: 256,
    });

    const pythontest = taskDefinition
      .addContainer('pythontest', {
        image: ecs.ContainerImage.fromAsset(path.join(__dirname, '../ecspart')),
        logging: new ecs.AwsLogDriver({
          streamPrefix: 'pythontest',
          logRetention: log.RetentionDays.ONE_DAY,
        }),
        environment: {
          TEST_OUTDIR: '/config/demo-github',
        },
      });

    pythontest.addPortMappings({
      containerPort: 8080,
    });

    taskDefinition.addVolume({
      name: 'app-data',
      efsVolumeConfiguration: {
        fileSystemId: fs.fileSystemId,
      },
    });
    pythontest.addMountPoints({
      containerPath: '/config',
      sourceVolume: 'app-data',
      readOnly: false,
    });

    taskDefinition.addToExecutionRolePolicy(new iam.PolicyStatement({
      actions: [
        'elasticfilesystem:ClientMount',
        'elasticfilesystem:ClientWrite',
      ],
      resources: [
        this.formatArn({
          service: 'elasticfilesystem',
          resource: 'file-system',
          sep: '/',
          resourceName: fs.fileSystemId,
        }),
      ],
    }));
    const pyService = new ecs.FargateService(this, 'pyService', {
      cluster,
      taskDefinition,
      platformVersion: ecs.FargatePlatformVersion.VERSION1_4,
    });
    pyService.connections.allowFrom(ec2.Peer.ipv4(vpc.vpcCidrBlock), ec2.Port.tcp(8080));
    pyService.connections.allowFrom(fs, ec2.Port.tcp(2049));
    pyService.connections.allowTo(fs, ec2.Port.tcp(2049));
    new ec2.BastionHostLinux(this, 'bs', { vpc } );
  }
}
const devEnv = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION,
};

const app = new App();

new MyStack(app, 'ecs-efs-test', { env: devEnv });

app.synth();