import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { createGqlResponseSchema, gqlResponseSchema, schema } from './schemas.js';
import { graphql, parse, validate } from 'graphql';
import depthLimit from 'graphql-depth-limit';

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
      const documentAST = parse(req.body.query);
      const validationErrors = validate(schema, documentAST, [depthLimit(5)]);
      
      if (validationErrors.length > 0) {
        return { errors: validationErrors }
      }

      const result = await graphql({ 
        schema, 
        source: req.body.query.toString(), 
        contextValue: { db: prisma },
        variableValues: req.body.variables,
      });
      return result
    },
  });
};

export default plugin;
