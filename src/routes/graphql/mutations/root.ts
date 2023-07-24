import { GraphQLNonNull, GraphQLObjectType, GraphQLString } from "graphql";
import { GraphQLContext, UUIDType } from "../types/uuid.js";
import { randomUUID } from "node:crypto";
import { Void } from "../types/void.js";
import { MemberId } from "../types/members.js";
import { ChangePostInputType, CreatePostInputType, PostType } from "../types/posts/posts.js";
import { ChangeUserInputType, CreateUserInputType, UserType } from "../types/users/users.js";
import { ChangeProfileInputType, CreateProfileInputType, ProfileType } from "../types/profiles/profiles.js";

interface PostInput {
    title: string,
    content: string,
    authorId: string,
}

interface UserInput {
    name: string;
    balance: number;
}

interface ProfileInput {
    isMale: boolean;
    yearOfBirth: number;
    memberTypeId: MemberId;
    userId: string;
}
  
export const RootMutationType = new GraphQLObjectType({
    name: 'RootMutationType',
    fields: () => ({
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
      },
      subscribeTo: {
        type: UserType,
        args: {
          userId: { type: new GraphQLNonNull(UUIDType) },
          authorId: { type: new GraphQLNonNull(UUIDType) }
        },
        async resolve(root, args: { userId: string, authorId: string }, context: GraphQLContext) {
          return await context.db.user.update({
            where: {
              id: args.userId,
            },
            data: {
              userSubscribedTo: {
                create: {
                  authorId: args.authorId,
                },
              },
            },
          });
        }
      },
      unsubscribeFrom: {
        type: Void,
        args: {
          userId: { type: new GraphQLNonNull(UUIDType) },
          authorId: { type: new GraphQLNonNull(UUIDType) }
        },
        async resolve(root, args: { userId: string, authorId: string }, context: GraphQLContext) {
          await context.db.subscribersOnAuthors.delete({
            where: {
              subscriberId_authorId: {
                subscriberId: args.userId,
                authorId: args.authorId,
              },
            },
          });
        }
      }
    })
})