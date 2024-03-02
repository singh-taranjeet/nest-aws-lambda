import { NestFactory } from '@nestjs/core';
import * as express from 'express';
import * as serverlessExpress from '@vendia/serverless-express';
import { ExpressAdapter } from '@nestjs/platform-express';
import { INestApplication } from '@nestjs/common';
import { AppModule } from './app.module';

let cachedServer: any;

// function requestMapper(params: any) {
//   const { event } = params;
//   console.log('Request event', event);

//   return {
//     method: event.httpMethod,
//     path: event.path,
//     headers: event.headers,
//     requestContext: event.requestContext,
//     body: event.body,
//   };
// }

// function responseMapper(params: any) {
//   console.log(' Response Params', params);
//   const { event } = params;
//   // Your logic here...

//   return {
//     statusCode: event.statusCode,
//     body: event.body,
//     headers: event.headers,
//   };
// }

export const bootstrapLambda = async (
  attachPipes: (app: INestApplication<any>) => void,
) => {
  if (!cachedServer) {
    console.log('Creating serverless server v6');
    // create an express app
    const expressApp = express();

    // create an express adapter to work with nest applicaiton
    const expressAdapter = new ExpressAdapter(expressApp);

    // create a nest app using the express adapter
    const nestApp = await NestFactory.create(AppModule, expressAdapter);
    nestApp.enableCors();

    // configure nest application
    attachPipes(nestApp);

    // wait for the nest to initialise
    await nestApp.init();

    // create a serverless server using serverless express
    cachedServer = serverlessExpress.configure({ app: expressApp });

    // cachedServer = serverlessExpress.configure({
    //   app: expressApp,
    //   eventSource: {
    //     getRequest: requestMapper,
    //     getResponse: responseMapper,
    //   },
    // });
    return cachedServer;
  }
  console.log('Using cached serverless server v6');
  return cachedServer;
};
