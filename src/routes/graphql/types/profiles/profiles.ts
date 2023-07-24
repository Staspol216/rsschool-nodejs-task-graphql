import {GraphQLBoolean, GraphQLInputObjectType, GraphQLInt, GraphQLObjectType } from 'graphql';
import { UUIDType } from '../uuid.js';
import { MemberTypeId, MemberTypeType } from '../../schemas.js';


export const ProfileType = new GraphQLObjectType({
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

export const CreateProfileInputType = new GraphQLInputObjectType({
    name: 'CreateProfileInput',
    fields: () => ({
        isMale: { type: GraphQLBoolean },
        yearOfBirth: { type: GraphQLInt },
        memberTypeId: { type: MemberTypeId },
        userId: { type: UUIDType }
    })
});

export const ChangeProfileInputType = new GraphQLInputObjectType({
    name: 'ChangeProfileInput',
    fields: () => ({
        isMale: { type: GraphQLBoolean },
        yearOfBirth: { type: GraphQLInt },
        memberTypeId: { type: MemberTypeId }
    })
});
