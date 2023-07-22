import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { createGqlResponseSchema, gqlResponseSchema, schema } from './schemas.js';
import { graphql } from 'graphql';

const plugin: FastifyPluginAsyncTypebox = async (fastify) => {
  const { prisma } = fastify;
  fastify.route({
    url: '/',
    method: 'POST',
    schema: {
      ...createGqlResponseSchema,
      response: {
        200: gqlResponseSchema,
      },
    },
    async handler(req) {
      console.log(req.body, "req.body");
      console.log(req.body.query,"req.body.query");
      console.log(req.body.variables, "req.body.variables");
      console.log(req.body.query.toString());
      const result = await graphql({ 
        schema, 
        source: req.body.query.toString(), 
        contextValue: { db: prisma },
        variableValues: req.body.variables
      });
      return result
    },
  });
};

export default plugin;
