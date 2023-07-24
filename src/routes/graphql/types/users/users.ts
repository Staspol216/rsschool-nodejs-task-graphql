import { GraphQLFloat, GraphQLInputObjectType, GraphQLList, GraphQLObjectType, GraphQLString } from "graphql";
import { GraphQLContext, UUIDType } from "../uuid.js";
import { PostType } from "../posts/posts.js";
import { ProfileType } from "../profiles/profiles.js";

export const UserType: GraphQLObjectType  = new GraphQLObjectType({
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
          }
        )
      }
    }
  })
})

  
export const CreateUserInputType = new GraphQLInputObjectType({
    name: 'CreateUserInput',
    fields: () => ({
        name: { type: GraphQLString },
        balance: { type: GraphQLFloat },
    })
})

export const ChangeUserInputType = new GraphQLInputObjectType({
    name: 'ChangeUserInput',
    fields: () => ({
        name: { type: GraphQLString },
        balance: { type: GraphQLFloat },
    })
});