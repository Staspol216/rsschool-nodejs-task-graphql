import { Type } from '@fastify/type-provider-typebox';
import { GraphQLBoolean, GraphQLEnumType, GraphQLFloat, GraphQLInt, GraphQLList, GraphQLObjectType, GraphQLSchema, GraphQLString } from 'graphql';
import { GraphQLContext, UUIDType } from './types/uuid.js';

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

enum MemberId {
  BASIC = 'basic',
  BUSINESS = 'buisness',
}

const MemberTypeId = new GraphQLEnumType({
  name: 'MemberTypeId',
  values: {
    basic: {},
    buisness: {},
  },
});

const ProfileType = new GraphQLObjectType({
    name: 'Profile',
    fields: () => ({
        id: { type: UUIDType },
        isMale: { type: GraphQLBoolean },
        yearOfBirth: { type: GraphQLInt },
        userId: { type: UUIDType },
        memberTypeId: { type: MemberTypeId },
        memberType: { 
          type: MemberTypeType,
          // async resolve(parent, args, context: GraphQLContext) {
          //   const memberType = await context.db.memberType.findUnique({
          //     where: {
          //       id: parent.memberTypeId,
          //     },
          //   });
          //   return memberType
          // }
        }
    })
})

const PostType = new GraphQLObjectType({
  name: 'Post',
  fields: () => ({
    id: { type: UUIDType },
    title: { type: GraphQLString },
    content: { type: GraphQLString },
    authorId: { type: UUIDType },
  })
})

const UserType = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
    id: { type: UUIDType },
    name: { type: GraphQLString },
    balance: { type: GraphQLFloat },
    profile: { 
      type: ProfileType,
    },
    posts: {
      type: new GraphQLList(PostType),
    }
  })
})

const MemberTypeType = new GraphQLObjectType({
  name: 'MemberTypeType',
  fields: () => ({
    id: { type: MemberTypeId },
    discount: { type: GraphQLFloat },
    postsLimitPerMonth: { type: GraphQLInt }
  })
})

export const RootQueryType = new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
      memberTypes: {
        type: new GraphQLList(MemberTypeType),
        async resolve(parent, arg, context: GraphQLContext) {
          return await context.db.memberType.findMany();
        }
      },
      posts: {
        type: new GraphQLList(PostType),
        async resolve(parent, arg, context: GraphQLContext) {
          return await context.db.post.findMany();
        }
      },
      users: {
        type: new GraphQLList(UserType),
        async resolve(parent, arg, context: GraphQLContext) {
          return await context.db.user.findMany({
            include: {
              profile: {
                include: {
                  memberType: true
                }
              },
              posts: true
            }
          });
        }
      },
      profiles: {
          type: new GraphQLList(ProfileType),
          async resolve(parent, arg, context: GraphQLContext) {
            return await context.db.profile.findMany();
          }
      },
      memberType: {
        type: MemberTypeType,
        args: { id: { type: MemberTypeId }},
        async resolve(parent, args: { id: MemberId }, context: GraphQLContext) {
          const memberType = await context.db.memberType.findUnique({
            where: {
              id: args.id,
            },
          });
          return memberType
        }
      },
      post: {
        type: PostType,
        args: { id: { type: UUIDType }},
        async resolve(parent, args: { id: string }, context: GraphQLContext) {
          const post = await context.db.post.findUnique({
            where: {
              id: args.id
            }
          })
          return post
        }
      },
      user: {
        type: UserType,
        args: { id: { type: UUIDType }},
        async resolve(parent, args: { id: string }, context: GraphQLContext) {
          const user = await context.db.user.findUnique({
            where: {
              id: args.id
            },
            include: {
              profile: {
                include: {
                  memberType: true
                }
              },
              posts: true
            }
          })
          return user
        }
      },
      profile: {
        type: ProfileType,
        args: { id: { type: UUIDType }},
        async resolve(parent, args: { id: string }, context: GraphQLContext) {
          const profile = await context.db.profile.findUnique({
            where: {
              id: args.id
            },
          })
          return profile
        }
      }
    }
})

export const schema = new GraphQLSchema({
  query: RootQueryType,
  types: [MemberTypeId]
})