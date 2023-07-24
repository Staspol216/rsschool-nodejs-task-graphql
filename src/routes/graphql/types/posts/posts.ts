import { GraphQLInputObjectType, GraphQLObjectType, GraphQLString } from "graphql";
import { UUIDType } from "../uuid.js";

export const PostType = new GraphQLObjectType({
    name: 'Post',
    fields: () => ({
      id: { type: UUIDType },
      title: { type: GraphQLString },
      content: { type: GraphQLString },
      authorId: { type: UUIDType },
    })
})

export const CreatePostInputType = new GraphQLInputObjectType({
    name: 'CreatePostInput',
    fields: () => ({
        title: { type: GraphQLString },
        content: { type: GraphQLString },
        authorId: { type: UUIDType },
    })
})

export const ChangePostInputType = new GraphQLInputObjectType({
    name: 'ChangePostInput',
    fields: () => ({
        title: { type: GraphQLString },
        content: { type: GraphQLString },
    })
})