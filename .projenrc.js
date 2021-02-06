const { AwsCdkTypeScriptApp } = require('projen');

const project = new AwsCdkTypeScriptApp({
  cdkVersion: '1.88.0',
  defaultReleaseBranch: 'main',
  jsiiFqn: 'projen.AwsCdkTypeScriptApp',
  name: 'ecs-efs-demo',
  cdkDependencies: [
    '@aws-cdk/aws-ec2',
    '@aws-cdk/aws-efs',
    '@aws-cdk/aws-ecs',
    '@aws-cdk/aws-iam',
    '@aws-cdk/aws-logs',
    '@aws-cdk/aws-ecs-patterns',
  ],
  deps: [
    'cdk-efs-assets',
  ],
  dependabot: false,
});

const execute = ['venv', 'cdk.context.json', '.github/dependabot.yml'];
project.gitignore.exclude(...execute);
project.synth();
