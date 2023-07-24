import { Type } from '@fastify/type-provider-typebox';
import { GraphQLEnumType, GraphQLFloat, GraphQLInt, GraphQLObjectType, GraphQLSchema } from 'graphql';
import { RootMutationType } from './mutations/root.js';
import { RootQueryType } from './queries/root.js';

export const gqlResponseSchema = Type.Partial(
  Type.Object({
    data: Type.Any(),
    errors: Type.Any(),
  }),
);

export const createGqlResponseSchema = {
  body: Type.Object(
    {
      query: Type.String(),
      variables: Type.Optional(Type.Record(Type.String(), Type.Any())),
    },
    {
      additionalProperties: false,
    },
  ),
};

export const MemberTypeId = new GraphQLEnumType({
  name: 'MemberTypeId',
  values: {
    basic: {},
    business: {},
  },
});

export const MemberTypeType = new GraphQLObjectType({
  name: 'MemberTypeType',
  fields: () => ({
    id: { type: MemberTypeId },
    discount: { type: GraphQLFloat },
    postsLimitPerMonth: { type: GraphQLInt }
  })
})

export const schema = new GraphQLSchema({
  query: RootQueryType,
  mutation: RootMutationType,
})