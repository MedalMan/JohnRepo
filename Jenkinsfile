AWSTemplateFormatVersion: '2010-09-09'
Parameters:
  KeyName:
    Type: AWS::EC2::KeyPair::KeyName
    Description: Name of an existing EC2 KeyPair to enable SSH access to the ECS instances.
  ECSClusterName:
    Type: AWS::ECS::Cluster
    Description: Name of the Cluster
  VpcId:
    Type: AWS::EC2::VPC::Id
    Description: A VPC that allows instances to access the Internet.
  ECSTaskDefinition:
    Type: String
    Description: Task Definition name
  DesiredCount:
    Type: Number
    Default: 1
    Description: Number of instances to launch in the ECS cluster.
  StrapiFrontEndTG:
    Type: AWS::ElasticLoadBalancingV2::TargetGroup
    Description: Front End Target Group.
  StrapiBackEndTG:
    Type: AWS::ElasticLoadBalancingV2::TargetGroup
    Description: Back End Target Group.
  StrapiFileSystem:
    Type: List<AWS::EFS::FileSystem::Id>
    Description: Select from a list of existing File Systems.
  AeroECRRepo:
    Type: AWS::ECR::Repository::Name
    Description: An ECR Repository where Docker images are pushed into.
  StrapiALB:
    Type: AWS::ElasticLoadBalancingV2::LoadBalancer::Name
    Description: Select from a list of existing AWS Load Balancers.
  StrapiMediaAccessPoint:
    Type: AWS::EFS::AccessPoint::Id
    Description: An Access Point for the Media.
  StrapiDBAccessPoint:
    Type: AWS::EFS::AccessPoint::Id
    Description: An Access Point for the DB.

Resources:
  ECSCluster:
    Type: 'AWS::ECS::Cluster'
    Properties:
      ClusterName: !Ref ECSClusterName
      CapacityProviders:
        - EC2
      Configuration:
        ExecuteCommandConfiguration:
          Logging: DEFAULT
      Tags:
        - Key: environment
          Value: production

  EcsSecurityGroup:
    Type: AWS::EC2::SecurityGroup
    Properties:
      GroupDescription: Allow http to client host
      VpcId: !Ref VpcId
      GroupName: 'ECS Security Group'
      Description: Security group for ECS instances
      SecurityGroupIngress:
        - IpProtocol: tcp
          FromPort: 1337
          ToPort: 1337
          CidrIp: 0.0.0.0/0

  ECSTaskDefinition:
    Type: 'AWS::ECS::TaskDefinition'
    Properties:
      ContainerDefinitions:
        - Name: frontend
          Command:
            - Name: frontend
          Essential: true
          Memory: 512
          Image: '306251499781.dkr.ecr.us-gov-west-1.amazonaws.com/aero-strapi-ecr-imagerepo'
          LogConfiguration:
            LogDriver: awslogs
            Options:
              awslogs-group: /ecs/ec2-task-definition
              awslogs-region: us-gov-west-1
              awslogs-stream-prefix: ecs
          PortMappings:
            - ContainerPort: 3000
              HostPort: 3000
              Protocol: tcp
      Cpu: 256
      ExecutionRoleArn: 'arn:aws:iam::306251499781:role/ecsTaskExecutionRole'
      Family: STRAPI
      Memory: 512
      NetworkMode: awsvpc
      RequiresCompatibilities:
        - EC2
      RuntimePlatform:
        OperatingSystemFamily: LINUX
      HealthCheck:
        Command: CMD-SHELL, curl -f http://localhost/ || exit 1
        Interval: 200
      Environment:
        - Name: AWS_REGION
          Value: 'US-Gov-West'
        - Name: NEXT_PUBLIC_STRAPI_API_URL
          Value: 'http://internal-lb-aero-wmd-apis-440038663.us-gov-west-1.elb.amazonaws.com:1337'

  ECSService:
    Type: 'AWS::ECS::Service'
    Properties:
      Cluster: !Ref ECSClusterName
      DesiredCount: 1
      LaunchType: EC2
      NetworkConfiguration:
        AwsvpcConfiguration:
          AssignPublicIp: ENABLED
          Subnets: [subnet-24cf0152, subnet-d526f0b1]
      TaskDefinition: !Ref ECSTaskDefinition

  StrapiEnvironment:
    Type: AWS::ECS::TaskDefinition
    Properties:
      ContainerDefinitions:
        - Name: backend
          Environment:
            - Name: AWS_REGION
              Value: 'US-Gov-West'
            - Name: AWS_SDK_LOAD_CONFIG
              Value: 'load config from ~/.aws'

  StrapiValue:
    Type: AWS::ECS::TaskDefinition
    Properties:
      ContainerDefinitions:
        - Name: backend
          Environment:
            - Name: AWS_REGION
              Value: 'US-Gov-West'
            - Name: AWS_SDK_LOAD_CONFIG
              Value: '1'

  ProxySettings:
    Type: AWS::ECS::TaskDefinition
    Properties:
      ContainerDefinitions:
        - Name: backend
          Environment:
            - Name: PROXY
              Value: 'true'
            - Name: STRAPI_TELEMETRY_DISABLED
              Value: 'true'
            - Name: URL
              Value: 'arn:aws-us-gov:elasticloadbalancing:us-gov-west-1:306251499781:loadbalancer/app/lb-aero-hive/8070d708261454aa'

  SecretsAdminJwt:
    Type: AWS::ECS::TaskDefinition
    Properties:
      ContainerDefinitions:
        - Name: backend
          Secrets:
            - Name: ADMIN_JWT_SECRET
              ValueFrom: tobemodified

  SecretsApiTokenSalt:
    Type: AWS::ECS::TaskDefinition
    Properties:
      ContainerDefinitions:
        - Name: backend
          Secrets:
            - Name: API_TOKEN_SALT
              ValueFrom: tobemodified

  SecretsAppKeys:
    Type: AWS::ECS::TaskDefinition
    Properties:
      ContainerDefinitions:
        - Name: backend
          Secrets:
            - Name: APP_KEYS
              ValueFrom:
                - toBeModified1
                - toBeModified2

  MyRepository:
    Type: AWS::ECR::Repository
    Properties:
      RepositoryName: !Ref AeroECRRepo
      RepositoryPolicyText:
        Version: "2012-10-17"
        Statement:
          - Sid: AllowPushPull
            Effect: Allow
            Principal:
              AWS: '*'
            Action:
              - "ecr:GetDownloadUrlForLayer"
              - "ecr:BatchGetImage"
              - "ecr:BatchCheckLayerAvailability"
              - "ecr:PutImage"
              - "ecr:InitiateLayerUpload"
              - "ecr:UploadLayerPart"
              - "ecr:CompleteLayerUpload"

      LifecyclePolicy:
        Rules:
          - RulePriority: 1
            Description: Rule 1
            Selection:
              TagStatus: tagged
              TagPrefixList:
                - prod
              CountType: imageCountMoreThan
              CountNumber: 1
            Action:
              Type: expire
          - RulePriority: 2
            Selection:
              TagStatus: tagged
              TagPrefixList:
                - beta
              CountType: imageCountMoreThan
              CountNumber: 1
            Action:
              Type: expire

Outputs:
  ALBURL:
    Description: URL of the Application Load Balancer
    Value: !GetAtt StrapiALB.DNSName
