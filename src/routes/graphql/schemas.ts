import { Type } from '@fastify/type-provider-typebox';
import { GraphQLBoolean, GraphQLEnumType, GraphQLFloat, GraphQLInputObjectType, GraphQLInt, GraphQLList, GraphQLNonNull, GraphQLObjectType, GraphQLSchema, GraphQLString } from 'graphql';
import { GraphQLContext, UUIDType } from './types/uuid.js';
import { randomUUID } from 'crypto';

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
        memberType: { type: MemberTypeType }
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

const UserType: GraphQLObjectType  = new GraphQLObjectType({
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
    },
    userSubscribedTo: {
      type: new GraphQLList(UserType),
      async resolve(parent: { id: string }, _, context: GraphQLContext) {
        return context.db.user.findMany({
          where: {
            subscribedToUser: {
              some: {
                subscriberId: parent.id,
              },
            },
          },
        })
      }
    },
    subscribedToUser: {
      type: new GraphQLList(UserType),
      async resolve(parent: { id: string }, _, context: GraphQLContext) {
        return context.db.user.findMany({
          where: {
            userSubscribedTo: {
              some: {
                authorId: parent.id,
              },
            },
          },
        })
      }
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

const RootQueryType = new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
      memberTypes: {
        type: new GraphQLList(MemberTypeType),
        async resolve(_, arg, context: GraphQLContext) {
          return await context.db.memberType.findMany();
        }
      },
      posts: {
        type: new GraphQLList(PostType),
        async resolve(_, arg, context: GraphQLContext) {
          return await context.db.post.findMany();
        }
      },
      users: {
        type: new GraphQLList(UserType),
        async resolve(_, arg, context: GraphQLContext) {
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
          async resolve(_, arg, context: GraphQLContext) {
            return await context.db.profile.findMany();
          }
      },
      memberType: {
        type: MemberTypeType,
        args: { id: { type: MemberTypeId }},
        async resolve(_, args: { id: MemberId }, context: GraphQLContext) {
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
        async resolve(_, args: { id: string }, context: GraphQLContext) {
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
        async resolve(_, args: { id: string }, context: GraphQLContext) {
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
              posts: true,
            }
          })
          return user
        }
      },
      profile: {
        type: ProfileType,
        args: { id: { type: UUIDType }},
        async resolve(_, args: { id: string }, context: GraphQLContext) {
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


const CreatePostInputType = new GraphQLInputObjectType({
  name: 'CreatePostInput',
  fields: () => ({
    title: { type: GraphQLString },
    content: { type: GraphQLString },
    authorId: { type: UUIDType },
  })
})

const ChangePostInputType = new GraphQLInputObjectType({
  name: 'ChangePostInput',
  fields: () => ({
    title: { type: GraphQLString },
    content: { type: GraphQLString },
  })
})

interface PostInput {
  title: string,
  content: string,
  authorId: string,
}

const CreateUserInputType = new GraphQLInputObjectType({
  name: 'CreateUserInput',
  fields: () => ({
    name: { type: GraphQLString },
    balance: { type: GraphQLFloat },
  })
})

const ChangeUserInputType = new GraphQLInputObjectType({
  name: 'ChangeUserInput',
  fields: () => ({
    name: { type: GraphQLString },
    balance: { type: GraphQLFloat },
  })
});

interface UserInput {
  name: string;
  balance: number;
}

const CreateProfileInputType = new GraphQLInputObjectType({
  name: 'CreateProfileInput',
  fields: () => ({
    isMale: { type: GraphQLBoolean },
    yearOfBirth: { type: GraphQLInt },
    memberTypeId: { type: GraphQLString },
    userId: { type: UUIDType }
  })
});

const ChangeProfileInputType = new GraphQLInputObjectType({
  name: 'ChangeProfileInput',
  fields: () => ({
    isMale: { type: GraphQLBoolean },
    yearOfBirth: { type: GraphQLInt },
    memberTypeId: { type: GraphQLString }
  })
});

interface ProfileInput {
  isMale: boolean;
  yearOfBirth: number;
  memberTypeId: string;
  userId: string;
}

const RootMutationType = new GraphQLObjectType({
  name: 'RootMutationType',
  fields: {
    createPost: {
      type: PostType,
      args: {
        dto: { type: new GraphQLNonNull(CreatePostInputType) }
      },
      async resolve(root, args: { dto: PostInput }, context: GraphQLContext) {
        return await context.db.post.create({
          data: {
            id: randomUUID(),
          ...args.dto
          }
        });
      }
    },
    createUser: {
      type: UserType,
      args: {
        dto: { type: new GraphQLNonNull(CreateUserInputType) }
      },
      async resolve(root, args: { dto: UserInput }, context: GraphQLContext) {
        return await context.db.user.create({
          data: {
            id: randomUUID(),
          ...args.dto
          }
        });
      }
    },
    createProfile: {
      type: UserType,
      args: {
        dto: { type: new GraphQLNonNull(CreateProfileInputType) }
      },
      async resolve(root, args: { dto: ProfileInput }, context: GraphQLContext) {
        return await context.db.profile.create({
          data: {
            id: randomUUID(),
          ...args.dto
          }
        });
      }
    },
    deletePost: {
      type: GraphQLString,
      args: {
        id: { type: new GraphQLNonNull(UUIDType) }
      },
      async resolve(root, args: { id: string }, context: GraphQLContext) {
        try {
          await context.db.post.delete({
            where: {
              id: args.id,
            },
          });
          return "deleted"
        } catch {
          return new Error("something went wrong")
        }
      }
    },
    deleteUser: {
      type: GraphQLString,
      args: {
        id: { type: new GraphQLNonNull(UUIDType) }
      },
      async resolve(root, args: { id: string }, context: GraphQLContext) {
        try {
          await context.db.user.delete({
            where: {
              id: args.id,
            },
          });
          return "deleted"
        } catch {
          return new Error("something went wrong")
        }
      }
    },
    deleteProfile: {
      type: GraphQLString,
      args: {
        id: { type: new GraphQLNonNull(UUIDType) }
      },
      async resolve(root, args: { id: string }, context: GraphQLContext) {
        try {
          await context.db.profile.delete({
            where: {
              id: args.id,
            },
          });
          return "deleted"
        } catch {
          return new Error("something went wrong")
        }
      }
    },
    changePost: {
      type: PostType,
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
        dto: { type: new GraphQLNonNull(ChangePostInputType) }
      },
      async resolve(root, args: { id: string, dto: Partial<PostInput> }, context: GraphQLContext) {
        return await context.db.post.update({
          where: {
            id: args.id,
          },
          data: args.dto
        });
      }
    },
    changeProfile: {
      type: ProfileType,
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
        dto: { type: new GraphQLNonNull(ChangeProfileInputType) }
      },
      async resolve(root, args: { id: string, dto: Partial<ProfileInput> }, context: GraphQLContext) {
        return await context.db.profile.update({
          where: {
            id: args.id,
          },
          data: args.dto
        });
      }
    },
    changeUser: {
      type: UserType,
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
        dto: { type: new GraphQLNonNull(ChangeUserInputType) }
      },
      async resolve(root, args: { id: string, dto: Partial<UserInput> }, context: GraphQLContext) {
        return await context.db.user.update({
          where: {
            id: args.id,
          },
          data: args.dto
        });
      }
    }
  }
})

export const schema = new GraphQLSchema({
  query: RootQueryType,
  mutation: RootMutationType,
})