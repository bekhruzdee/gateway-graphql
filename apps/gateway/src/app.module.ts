import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloGatewayDriver, ApolloGatewayDriverConfig } from '@nestjs/apollo';
import { IntrospectAndCompose, RemoteGraphQLDataSource } from '@apollo/gateway';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloGatewayDriverConfig>({
      driver: ApolloGatewayDriver,
      gateway: {
        supergraphSdl: new IntrospectAndCompose({
          subgraphs: [
            {
              name: 'users',
              url: 'http://localhost:3000/graphql',
            },
            {
              name: 'posts',
              url: 'http://localhost:3001/graphql',
            },
          ],
        }),
        buildService({ name, url }) {
          return new RemoteGraphQLDataSource({
            url,
            willSendRequest({ request, context }) {
              if (request.http && context.req?.headers?.authorization) {
                request.http.headers.set(
                  'authorization',
                  context.req.headers.authorization,
                );
              }
            },
          });
        },
      },
      server: {
        context: ({ req }) => ({ req }),
      },
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
