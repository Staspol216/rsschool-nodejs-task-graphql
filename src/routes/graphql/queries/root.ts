import { GraphQLList, GraphQLObjectType } from "graphql";
import { MemberTypeId, MemberTypeType } from "../schemas.js";
import { GraphQLContext, UUIDType } from "../types/uuid.js";
import { MemberId } from "../types/members.js";
import { PostType } from "../types/posts/posts.js";
import { UserType } from "../types/users/users.js";
import { ProfileType } from "../types/profiles/profiles.js";

export const RootQueryType = new GraphQLObjectType({
    name: 'RootQueryType',
    fields: () => ({
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
    })
})