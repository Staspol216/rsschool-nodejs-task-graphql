import { test } from 'tap';
import { build } from '../helper.js';
import { createUser, gqlQuery, subscribeTo } from '../utils/requests.js';

await test('gql-rule', async (t) => {
  const app = await build(t);

  await t.test('Trigger depth limit rule.', async (t) => {
    const { body: user1 } = await createUser(app);
    const { body: user2 } = await createUser(app);
    const { body: user3 } = await createUser(app);
    const { body: user4 } = await createUser(app);
    const { body: user5 } = await createUser(app);
    const { body: user6 } = await createUser(app);
    const { body: user7 } = await createUser(app);

    await subscribeTo(app, user1.id, user2.id);
    await subscribeTo(app, user2.id, user3.id);
    await subscribeTo(app, user3.id, user4.id);
    await subscribeTo(app, user5.id, user6.id);
    await subscribeTo(app, user6.id, user7.id);

    const {
      body: { errors },
    } = await gqlQuery(app, {
      query: `query ($userId: UUID!) {
        user(id: $userId) {
            id
            userSubscribedTo {
              id
              userSubscribedTo {
                id
                userSubscribedTo {
                  id
                  userSubscribedTo {
                    id
                    userSubscribedTo {
                      id
                    }
                  }
                }
              }
            }
        }
    }`,
      variables: {
        userId: user1.id,
      },
    });

    t.ok(errors.length === 1);
    const message = errors[0].message as string;
    t.ok(message.endsWith('exceeds maximum operation depth of 5'));
  });
});