import * as cdk from "aws-cdk-lib";
import { LambdaIntegration, RestApi } from "aws-cdk-lib/aws-apigateway";
import { DockerImageCode, DockerImageFunction } from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";
// import * as iam from "aws-cdk-lib/aws-iam";
import * as logs from "aws-cdk-lib/aws-logs";
import path = require("path");

export class CdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create a new lambda function
    const ApiHandler = new DockerImageFunction(this, "ApiHandler1", {
      timeout: cdk.Duration.seconds(30),
      functionName: "ApiHandler1",
      code: DockerImageCode.fromImageAsset(path.join(__dirname, "../../app")),
    });

    // Create a new Log Group and Log Stream for the Lambda function
    new logs.LogGroup(this, "ApiHandlerLogGroup1", {
      logGroupName: `/aws/lambda/${ApiHandler.functionName}`,
      retention: logs.RetentionDays.ONE_WEEK,
    });

    // Create a new api gateway
    const api = new RestApi(this, "ApiRest1", {
      restApiName: "ApiRest1",
      deploy: true,
      defaultMethodOptions: {
        apiKeyRequired: false,
      },
    });

    // add proxy resource to handle all api requests
    api.root.addProxy({
      defaultIntegration: new LambdaIntegration(ApiHandler, {
        proxy: true,
      }),
    });

    // const restApi = new RestApi(this, "ApiRest1", {
    //   restApiName: "ApiRest1",
    // });

    // const proxyResource = restApi.root.addResource("{proxy+}"); // Catch-all for any subpath
    // proxyResource.addMethod("ANY", new LambdaIntegration(ApiHandler));

    //add api key to enable monitoring
    // const apiKey = api.addApiKey("ApiKey");
    // const usagePlan = api.addUsagePlan("ApiUsagePlan", {
    //   name: "ApiUsagePlan",
    //   apiStages: [
    //     {
    //       api,
    //       stage: api.deploymentStage,
    //     },
    //   ],
    // });

    // // add the api key to the usage plan
    // usagePlan.addApiKey(apiKey);

    // // add the api key to the output
    // new cdk.CfnOutput(this, "failed-requests-arn", {
    //   value: apiKey.keyId,
    //   exportName: `keyId`,
    // });
  }
}
