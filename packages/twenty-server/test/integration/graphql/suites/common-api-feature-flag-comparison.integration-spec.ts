import gql from 'graphql-tag';
import { PERSON_GQL_FIELDS } from 'test/integration/constants/person-gql-fields.constants';
import { createManyOperationFactory } from 'test/integration/graphql/utils/create-many-operation-factory.util';
import { createOneOperationFactory } from 'test/integration/graphql/utils/create-one-operation-factory.util';
import { deleteManyOperationFactory } from 'test/integration/graphql/utils/delete-many-operation-factory.util';
import { deleteOneOperationFactory } from 'test/integration/graphql/utils/delete-one-operation-factory.util';
import { destroyManyOperationFactory } from 'test/integration/graphql/utils/destroy-many-operation-factory.util';
import { destroyOneOperationFactory } from 'test/integration/graphql/utils/destroy-one-operation-factory.util';
import { findManyOperationFactory } from 'test/integration/graphql/utils/find-many-operation-factory.util';
import { findOneOperationFactory } from 'test/integration/graphql/utils/find-one-operation-factory.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { mergeManyOperationFactory } from 'test/integration/graphql/utils/merge-many-operation-factory.util';
import { restoreManyOperationFactory } from 'test/integration/graphql/utils/restore-many-operation-factory.util';
import { restoreOneOperationFactory } from 'test/integration/graphql/utils/restore-one-operation-factory.util';
import { updateManyOperationFactory } from 'test/integration/graphql/utils/update-many-operation-factory.util';
import { updateOneOperationFactory } from 'test/integration/graphql/utils/update-one-operation-factory.util';
import { updateFeatureFlag } from 'test/integration/metadata/suites/utils/update-feature-flag.util';
import { makeRestAPIRequest } from 'test/integration/rest/utils/make-rest-api-request.util';
import { deleteAllRecords } from 'test/integration/utils/delete-all-records';

import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';

// Pre-generated constant UUIDs for consistent snapshots
const TEST_COMMON_API_IDS = {
  // GraphQL CreateOne
  GQL_CREATE_ONE: '027a491f-a2a8-49b3-b886-99c793f5ca65',

  // GraphQL CreateMany
  GQL_CREATE_MANY_1: '027a491f-a2a8-49b3-b886-99c793f5ca66',
  GQL_CREATE_MANY_2: '027a491f-a2a8-49b3-b886-99c793f5ca67',

  // GraphQL FindOne
  GQL_FIND_ONE: '027a491f-a2a8-49b3-b886-99c793f5ca68',

  // GraphQL FindMany
  GQL_FIND_MANY_1: '027a491f-a2a8-49b3-b886-99c793f5ca69',
  GQL_FIND_MANY_2: '027a491f-a2a8-49b3-b886-99c793f5ca70',

  // GraphQL GroupBy
  GQL_GROUP_BY_1: '027a491f-a2a8-49b3-b886-99c793f5ca71',
  GQL_GROUP_BY_2: '027a491f-a2a8-49b3-b886-99c793f5ca72',
  GQL_GROUP_BY_3: '027a491f-a2a8-49b3-b886-99c793f5ca73',

  // GraphQL DeleteOne
  GQL_DELETE_ONE: '027a491f-a2a8-49b3-b886-99c793f5ca74',

  // GraphQL DeleteMany
  GQL_DELETE_MANY_1: '027a491f-a2a8-49b3-b886-99c793f5ca75',
  GQL_DELETE_MANY_2: '027a491f-a2a8-49b3-b886-99c793f5ca76',

  // GraphQL DestroyOne
  GQL_DESTROY_ONE: '027a491f-a2a8-49b3-b886-99c793f5ca77',

  // GraphQL DestroyMany
  GQL_DESTROY_MANY_1: '027a491f-a2a8-49b3-b886-99c793f5ca78',
  GQL_DESTROY_MANY_2: '027a491f-a2a8-49b3-b886-99c793f5ca79',

  // REST CreateOne
  REST_CREATE_ONE: '027a491f-a2a8-49b3-b886-99c793f5ca80',

  // REST CreateMany
  REST_CREATE_MANY_1: '027a491f-a2a8-49b3-b886-99c793f5ca81',
  REST_CREATE_MANY_2: '027a491f-a2a8-49b3-b886-99c793f5ca82',

  // REST FindOne
  REST_FIND_ONE: '027a491f-a2a8-49b3-b886-99c793f5ca83',

  // REST FindMany
  REST_FIND_MANY_1: '027a491f-a2a8-49b3-b886-99c793f5ca84',
  REST_FIND_MANY_2: '027a491f-a2a8-49b3-b886-99c793f5ca85',

  // REST GroupBy
  REST_GROUP_BY_1: '027a491f-a2a8-49b3-b886-99c793f5ca86',
  REST_GROUP_BY_2: '027a491f-a2a8-49b3-b886-99c793f5ca87',
  REST_GROUP_BY_3: '027a491f-a2a8-49b3-b886-99c793f5ca88',

  // REST DeleteOne
  REST_DELETE_ONE: '027a491f-a2a8-49b3-b886-99c793f5ca89',

  // REST DeleteMany
  REST_DELETE_MANY_1: '027a491f-a2a8-49b3-b886-99c793f5ca90',
  REST_DELETE_MANY_2: '027a491f-a2a8-49b3-b886-99c793f5ca91',

  // REST DestroyOne
  REST_DESTROY_ONE: '027a491f-a2a8-49b3-b886-99c793f5ca92',

  // REST DestroyMany
  REST_DESTROY_MANY_1: '027a491f-a2a8-49b3-b886-99c793f5ca93',
  REST_DESTROY_MANY_2: '027a491f-a2a8-49b3-b886-99c793f5ca94',

  // GraphQL UpdateOne
  GQL_UPDATE_ONE: '027a491f-a2a8-49b3-b886-99c793f5ca95',

  // GraphQL UpdateMany
  GQL_UPDATE_MANY_1: '027a491f-a2a8-49b3-b886-99c793f5ca96',
  GQL_UPDATE_MANY_2: '027a491f-a2a8-49b3-b886-99c793f5ca97',

  // GraphQL RestoreOne
  GQL_RESTORE_ONE: '027a491f-a2a8-49b3-b886-99c793f5ca98',

  // GraphQL RestoreMany
  GQL_RESTORE_MANY_1: '027a491f-a2a8-49b3-b886-99c793f5ca99',
  GQL_RESTORE_MANY_2: '027a491f-a2a8-49b3-b886-99c793f5caa0',

  // GraphQL MergeMany
  GQL_MERGE_MANY_1: '027a491f-a2a8-49b3-b886-99c793f5caa1',
  GQL_MERGE_MANY_2: '027a491f-a2a8-49b3-b886-99c793f5caa2',

  // GraphQL FindDuplicates
  GQL_FIND_DUPLICATES_1: '027a491f-a2a8-49b3-b886-99c793f5caa3',
  GQL_FIND_DUPLICATES_2: '027a491f-a2a8-49b3-b886-99c793f5caa4',

  // REST UpdateOne
  REST_UPDATE_ONE: '027a491f-a2a8-49b3-b886-99c793f5caa5',

  // REST UpdateMany
  REST_UPDATE_MANY_1: '027a491f-a2a8-49b3-b886-99c793f5caa6',
  REST_UPDATE_MANY_2: '027a491f-a2a8-49b3-b886-99c793f5caa7',

  // REST RestoreOne
  REST_RESTORE_ONE: '027a491f-a2a8-49b3-b886-99c793f5caa8',

  // REST RestoreMany
  REST_RESTORE_MANY_1: '027a491f-a2a8-49b3-b886-99c793f5caa9',
  REST_RESTORE_MANY_2: '027a491f-a2a8-49b3-b886-99c793f5caaa',

  // REST MergeMany
  REST_MERGE_MANY_1: '027a491f-a2a8-49b3-b886-99c793f5caab',
  REST_MERGE_MANY_2: '027a491f-a2a8-49b3-b886-99c793f5caac',

  // REST FindDuplicates
  REST_FIND_DUPLICATES_1: '027a491f-a2a8-49b3-b886-99c793f5caad',
  REST_FIND_DUPLICATES_2: '027a491f-a2a8-49b3-b886-99c793f5caae',
};

describe('Common API Feature Flag Comparison (IS_COMMON_API_ENABLED)', () => {
  // Test data factory with all fields filled
  const createPersonData = (id: string, suffix: string) => ({
    id,
    name: {
      firstName: `First-${suffix}`,
      lastName: `Last-${suffix}`,
    },
    emails: {
      primaryEmail: `test-${suffix}@example.com`,
      additionalEmails: [],
    },
    phones: {
      primaryPhoneNumber: `+33123456789`,
      primaryPhoneCountryCode: 'FR',
      primaryPhoneCallingCode: '+33',
      additionalPhones: [],
    },
    city: `City-${suffix}`,
    jobTitle: `Job-${suffix}`,
    avatarUrl: `https://example.com/avatar-${suffix}.jpg`,
    intro: `Intro text for ${suffix}`,
  });

  beforeAll(async () => {
    await deleteAllRecords('person');

    await updateFeatureFlag({
      expectToFail: false,
      featureFlag: FeatureFlagKey.IS_COMMON_API_ENABLED,
      value: true,
    });
  });

  afterAll(async () => {
    await deleteAllRecords('person');
  });

  describe('GraphQL API Operations', () => {
    describe('CreateOne', () => {
      afterEach(async () => {
        await makeGraphqlAPIRequest(
          destroyOneOperationFactory({
            objectMetadataSingularName: 'person',
            gqlFields: 'id',
            recordId: TEST_COMMON_API_IDS.GQL_CREATE_ONE,
          }),
        ).catch(() => {});
      });

      it('should create one person with all fields', async () => {
        const graphqlOperation = createOneOperationFactory({
          objectMetadataSingularName: 'person',
          gqlFields: PERSON_GQL_FIELDS,
          data: createPersonData(
            TEST_COMMON_API_IDS.GQL_CREATE_ONE,
            'create-one-gql',
          ),
        });

        const response = await makeGraphqlAPIRequest(graphqlOperation);

        expect(response.status).toBe(200);
        expect(response.body).toMatchSnapshot({
          data: {
            createPerson: {
              id: TEST_COMMON_API_IDS.GQL_CREATE_ONE,
              createdAt: expect.any(String),
              deletedAt: null,
            },
          },
        });
      });
    });

    describe('CreateMany', () => {
      afterEach(async () => {
        await makeGraphqlAPIRequest(
          destroyManyOperationFactory({
            objectMetadataSingularName: 'person',
            objectMetadataPluralName: 'people',
            gqlFields: 'id',
            filter: {
              id: {
                in: [
                  TEST_COMMON_API_IDS.GQL_CREATE_MANY_1,
                  TEST_COMMON_API_IDS.GQL_CREATE_MANY_2,
                ],
              },
            },
          }),
        ).catch(() => {});
      });

      it('should create many people with all fields', async () => {
        const graphqlOperation = createManyOperationFactory({
          objectMetadataSingularName: 'person',
          objectMetadataPluralName: 'people',
          gqlFields: PERSON_GQL_FIELDS,
          data: [
            createPersonData(
              TEST_COMMON_API_IDS.GQL_CREATE_MANY_1,
              'create-many-gql-1',
            ),
            createPersonData(
              TEST_COMMON_API_IDS.GQL_CREATE_MANY_2,
              'create-many-gql-2',
            ),
          ],
        });

        const response = await makeGraphqlAPIRequest(graphqlOperation);

        expect(response.status).toBe(200);
        expect(response.body).toMatchSnapshot({
          data: {
            createPeople: [
              {
                id: TEST_COMMON_API_IDS.GQL_CREATE_MANY_1,
                createdAt: expect.any(String),
                deletedAt: null,
              },
              {
                id: TEST_COMMON_API_IDS.GQL_CREATE_MANY_2,
                createdAt: expect.any(String),
                deletedAt: null,
              },
            ],
          },
        });
      });
    });

    describe('FindOne', () => {
      beforeAll(async () => {
        await makeGraphqlAPIRequest(
          createOneOperationFactory({
            objectMetadataSingularName: 'person',
            gqlFields: 'id',
            data: createPersonData(
              TEST_COMMON_API_IDS.GQL_FIND_ONE,
              'find-one-gql',
            ),
          }),
        );
      });

      afterAll(async () => {
        await makeGraphqlAPIRequest(
          destroyOneOperationFactory({
            objectMetadataSingularName: 'person',
            gqlFields: 'id',
            recordId: TEST_COMMON_API_IDS.GQL_FIND_ONE,
          }),
        ).catch(() => {});
      });

      it('should find one person with all fields and filters', async () => {
        const graphqlOperation = findOneOperationFactory({
          objectMetadataSingularName: 'person',
          gqlFields: PERSON_GQL_FIELDS,
          filter: {
            id: {
              eq: TEST_COMMON_API_IDS.GQL_FIND_ONE,
            },
          },
        });

        const response = await makeGraphqlAPIRequest(graphqlOperation);

        expect(response.status).toBe(200);
        expect(response.body).toMatchSnapshot({
          data: {
            person: {
              id: TEST_COMMON_API_IDS.GQL_FIND_ONE,
              createdAt: expect.any(String),
              deletedAt: null,
            },
          },
        });
      });
    });

    describe('FindMany', () => {
      beforeAll(async () => {
        await makeGraphqlAPIRequest(
          createManyOperationFactory({
            objectMetadataSingularName: 'person',
            objectMetadataPluralName: 'people',
            gqlFields: 'id',
            data: [
              createPersonData(
                TEST_COMMON_API_IDS.GQL_FIND_MANY_1,
                'find-many-gql-1',
              ),
              createPersonData(
                TEST_COMMON_API_IDS.GQL_FIND_MANY_2,
                'find-many-gql-2',
              ),
            ],
          }),
        );
      });

      afterAll(async () => {
        await makeGraphqlAPIRequest(
          destroyManyOperationFactory({
            objectMetadataSingularName: 'person',
            objectMetadataPluralName: 'people',
            gqlFields: 'id',
            filter: {
              id: {
                in: [
                  TEST_COMMON_API_IDS.GQL_FIND_MANY_1,
                  TEST_COMMON_API_IDS.GQL_FIND_MANY_2,
                ],
              },
            },
          }),
        ).catch(() => {});
      });

      it('should find many people with all fields, filters, ordering, and pagination', async () => {
        const graphqlOperation = findManyOperationFactory({
          objectMetadataSingularName: 'person',
          objectMetadataPluralName: 'people',
          gqlFields: PERSON_GQL_FIELDS,
          filter: {
            id: {
              in: [
                TEST_COMMON_API_IDS.GQL_FIND_MANY_1,
                TEST_COMMON_API_IDS.GQL_FIND_MANY_2,
              ],
            },
          },
          orderBy: [
            {
              name: {
                firstName: 'AscNullsFirst',
              },
            },
          ],
          first: 10,
        });

        const response = await makeGraphqlAPIRequest(graphqlOperation);

        expect(response.status).toBe(200);
        expect(response.body).toMatchSnapshot({
          data: {
            people: {
              edges: [
                {
                  node: {
                    id: TEST_COMMON_API_IDS.GQL_FIND_MANY_1,
                    createdAt: expect.any(String),
                    deletedAt: null,
                  },
                  cursor: expect.any(String),
                },
                {
                  node: {
                    id: TEST_COMMON_API_IDS.GQL_FIND_MANY_2,
                    createdAt: expect.any(String),
                    deletedAt: null,
                  },
                  cursor: expect.any(String),
                },
              ],
              pageInfo: {
                hasNextPage: false,
                hasPreviousPage: false,
                startCursor: expect.any(String),
                endCursor: expect.any(String),
              },
            },
          },
        });
      });
    });

    // describe('GroupBy', () => {
    //   beforeAll(async () => {
    //     await makeGraphqlAPIRequest(
    //       createManyOperationFactory({
    //         objectMetadataSingularName: 'person',
    //         objectMetadataPluralName: 'people',
    //         gqlFields: 'id',
    //         data: [
    //           {
    //             ...createPersonData(
    //               TEST_COMMON_API_IDS.GQL_GROUP_BY_1,
    //               'group-by-1',
    //             ),
    //             city: 'CityA',
    //           },
    //           {
    //             ...createPersonData(
    //               TEST_COMMON_API_IDS.GQL_GROUP_BY_2,
    //               'group-by-2',
    //             ),
    //             city: 'CityA',
    //           },
    //           {
    //             ...createPersonData(
    //               TEST_COMMON_API_IDS.GQL_GROUP_BY_3,
    //               'group-by-3',
    //             ),
    //             city: 'CityB',
    //           },
    //         ],
    //       }),
    //     );
    //   });

    //   afterAll(async () => {
    //     await makeGraphqlAPIRequest(
    //       destroyManyOperationFactory({
    //         objectMetadataSingularName: 'person',
    //         objectMetadataPluralName: 'people',
    //         gqlFields: 'id',
    //         filter: {
    //           id: {
    //             in: [
    //               TEST_COMMON_API_IDS.GQL_GROUP_BY_1,
    //               TEST_COMMON_API_IDS.GQL_GROUP_BY_2,
    //               TEST_COMMON_API_IDS.GQL_GROUP_BY_3,
    //             ],
    //           },
    //         },
    //       }),
    //     ).catch(() => {});
    //   });

    //   it('should group by city with aggregated metrics and filters', async () => {
    //     const graphqlOperation = groupByOperationFactory({
    //       objectMetadataSingularName: 'person',
    //       objectMetadataPluralName: 'people',
    //       groupBy: [{ city: true }],
    //       gqlFields: 'totalCount minCreatedAt maxCreatedAt',
    //       filter: {
    //         id: {
    //           in: [
    //             TEST_COMMON_API_IDS.GQL_GROUP_BY_1,
    //             TEST_COMMON_API_IDS.GQL_GROUP_BY_2,
    //             TEST_COMMON_API_IDS.GQL_GROUP_BY_3,
    //           ],
    //         },
    //       },
    //     });

    //     const response = await makeGraphqlAPIRequest(graphqlOperation);

    //     expect(response.status).toBe(200);
    //     expect(response.body.data.peopleGroupBy).toHaveLength(2);

    //     // Sort groups for consistent snapshot
    //     const groups = response.body.data.peopleGroupBy.sort((a: any, b: any) =>
    //       a.groupByDimensionValues[0].localeCompare(
    //         b.groupByDimensionValues[0],
    //       ),
    //     );

    //     expect({ peopleGroupBy: groups }).toMatchSnapshot({
    //       peopleGroupBy: [
    //         {
    //           groupByDimensionValues: ['CityA'],
    //           totalCount: 2,
    //           minCreatedAt: expect.any(String),
    //           maxCreatedAt: expect.any(String),
    //         },
    //         {
    //           groupByDimensionValues: ['CityB'],
    //           totalCount: 1,
    //           minCreatedAt: expect.any(String),
    //           maxCreatedAt: expect.any(String),
    //         },
    //       ],
    //     });
    //   });
    // });

    describe('DeleteOne (Soft Delete)', () => {
      beforeEach(async () => {
        await makeGraphqlAPIRequest(
          createOneOperationFactory({
            objectMetadataSingularName: 'person',
            gqlFields: 'id',
            data: createPersonData(
              TEST_COMMON_API_IDS.GQL_DELETE_ONE,
              'delete-one-gql',
            ),
          }),
        );
      });

      afterEach(async () => {
        await makeGraphqlAPIRequest(
          destroyOneOperationFactory({
            objectMetadataSingularName: 'person',
            gqlFields: 'id',
            recordId: TEST_COMMON_API_IDS.GQL_DELETE_ONE,
          }),
        ).catch(() => {});
      });

      it('should soft delete one person', async () => {
        const graphqlOperation = deleteOneOperationFactory({
          objectMetadataSingularName: 'person',
          gqlFields: PERSON_GQL_FIELDS,
          recordId: TEST_COMMON_API_IDS.GQL_DELETE_ONE,
        });

        const response = await makeGraphqlAPIRequest(graphqlOperation);

        expect(response.status).toBe(200);
        expect(response.body).toMatchSnapshot({
          data: {
            deletePerson: {
              id: TEST_COMMON_API_IDS.GQL_DELETE_ONE,
              createdAt: expect.any(String),
              deletedAt: expect.any(String),
            },
          },
        });
      });
    });

    describe('DeleteMany (Soft Delete)', () => {
      beforeEach(async () => {
        await makeGraphqlAPIRequest(
          createManyOperationFactory({
            objectMetadataSingularName: 'person',
            objectMetadataPluralName: 'people',
            gqlFields: 'id',
            data: [
              createPersonData(
                TEST_COMMON_API_IDS.GQL_DELETE_MANY_1,
                'delete-many-gql-1',
              ),
              createPersonData(
                TEST_COMMON_API_IDS.GQL_DELETE_MANY_2,
                'delete-many-gql-2',
              ),
            ],
          }),
        );
      });

      afterEach(async () => {
        await makeGraphqlAPIRequest(
          destroyManyOperationFactory({
            objectMetadataSingularName: 'person',
            objectMetadataPluralName: 'people',
            gqlFields: 'id',
            filter: {
              id: {
                in: [
                  TEST_COMMON_API_IDS.GQL_DELETE_MANY_1,
                  TEST_COMMON_API_IDS.GQL_DELETE_MANY_2,
                ],
              },
            },
          }),
        ).catch(() => {});
      });

      it('should soft delete many people', async () => {
        const graphqlOperation = deleteManyOperationFactory({
          objectMetadataSingularName: 'person',
          objectMetadataPluralName: 'people',
          gqlFields: PERSON_GQL_FIELDS,
          filter: {
            id: {
              in: [
                TEST_COMMON_API_IDS.GQL_DELETE_MANY_1,
                TEST_COMMON_API_IDS.GQL_DELETE_MANY_2,
              ],
            },
          },
        });

        const response = await makeGraphqlAPIRequest(graphqlOperation);

        expect(response.status).toBe(200);

        // Sort for consistent snapshot
        const sortedBody = {
          ...response.body,
          data: {
            ...response.body.data,
            deletePeople: response.body.data.deletePeople.sort(
              (a: any, b: any) => a.id.localeCompare(b.id),
            ),
          },
        };

        expect(sortedBody).toMatchSnapshot({
          data: {
            deletePeople: [
              {
                id: TEST_COMMON_API_IDS.GQL_DELETE_MANY_1,
                createdAt: expect.any(String),
                deletedAt: expect.any(String),
              },
              {
                id: TEST_COMMON_API_IDS.GQL_DELETE_MANY_2,
                createdAt: expect.any(String),
                deletedAt: expect.any(String),
              },
            ],
          },
        });
      });
    });

    describe('DestroyOne (Hard Delete)', () => {
      beforeEach(async () => {
        await makeGraphqlAPIRequest(
          createOneOperationFactory({
            objectMetadataSingularName: 'person',
            gqlFields: 'id',
            data: createPersonData(
              TEST_COMMON_API_IDS.GQL_DESTROY_ONE,
              'destroy-one-gql',
            ),
          }),
        );
      });

      it('should hard delete one person', async () => {
        const graphqlOperation = destroyOneOperationFactory({
          objectMetadataSingularName: 'person',
          gqlFields: PERSON_GQL_FIELDS,
          recordId: TEST_COMMON_API_IDS.GQL_DESTROY_ONE,
        });

        const response = await makeGraphqlAPIRequest(graphqlOperation);

        expect(response.status).toBe(200);
        expect(response.body).toMatchSnapshot({
          data: {
            destroyPerson: {
              id: TEST_COMMON_API_IDS.GQL_DESTROY_ONE,
              createdAt: expect.any(String),
              deletedAt: null,
            },
          },
        });

        // Verify it's really gone
        const findResponse = await makeGraphqlAPIRequest(
          findOneOperationFactory({
            objectMetadataSingularName: 'person',
            gqlFields: 'id',
            filter: {
              id: { eq: TEST_COMMON_API_IDS.GQL_DESTROY_ONE },
              not: { deletedAt: { is: 'NULL' } },
            },
          }),
        );

        expect(findResponse.body.data.person).toBeNull();
      });
    });

    describe('DestroyMany (Hard Delete)', () => {
      beforeEach(async () => {
        await makeGraphqlAPIRequest(
          createManyOperationFactory({
            objectMetadataSingularName: 'person',
            objectMetadataPluralName: 'people',
            gqlFields: 'id',
            data: [
              createPersonData(
                TEST_COMMON_API_IDS.GQL_DESTROY_MANY_1,
                'destroy-many-gql-1',
              ),
              createPersonData(
                TEST_COMMON_API_IDS.GQL_DESTROY_MANY_2,
                'destroy-many-gql-2',
              ),
            ],
          }),
        );
      });

      it('should hard delete many people', async () => {
        const graphqlOperation = destroyManyOperationFactory({
          objectMetadataSingularName: 'person',
          objectMetadataPluralName: 'people',
          gqlFields: PERSON_GQL_FIELDS,
          filter: {
            id: {
              in: [
                TEST_COMMON_API_IDS.GQL_DESTROY_MANY_1,
                TEST_COMMON_API_IDS.GQL_DESTROY_MANY_2,
              ],
            },
          },
        });

        const response = await makeGraphqlAPIRequest(graphqlOperation);

        expect(response.status).toBe(200);

        // Sort for consistent snapshot
        const sortedBody = {
          ...response.body,
          data: {
            ...response.body.data,
            destroyPeople: response.body.data.destroyPeople.sort(
              (a: any, b: any) => a.id.localeCompare(b.id),
            ),
          },
        };

        expect(sortedBody).toMatchSnapshot({
          data: {
            destroyPeople: [
              {
                id: TEST_COMMON_API_IDS.GQL_DESTROY_MANY_1,
                createdAt: expect.any(String),
                deletedAt: null,
              },
              {
                id: TEST_COMMON_API_IDS.GQL_DESTROY_MANY_2,
                createdAt: expect.any(String),
                deletedAt: null,
              },
            ],
          },
        });

        // Verify they're really gone
        const findResponse = await makeGraphqlAPIRequest(
          findManyOperationFactory({
            objectMetadataSingularName: 'person',
            objectMetadataPluralName: 'people',
            gqlFields: 'id',
            filter: {
              id: {
                in: [
                  TEST_COMMON_API_IDS.GQL_DESTROY_MANY_1,
                  TEST_COMMON_API_IDS.GQL_DESTROY_MANY_2,
                ],
              },
              not: { deletedAt: { is: 'NULL' } },
            },
          }),
        );

        expect(findResponse.body.data.people.edges).toHaveLength(0);
      });
    });

    describe('UpdateOne', () => {
      beforeEach(async () => {
        await makeGraphqlAPIRequest(
          createOneOperationFactory({
            objectMetadataSingularName: 'person',
            gqlFields: 'id',
            data: createPersonData(
              TEST_COMMON_API_IDS.GQL_UPDATE_ONE,
              'update-one-gql',
            ),
          }),
        );
      });

      afterEach(async () => {
        await makeGraphqlAPIRequest(
          destroyOneOperationFactory({
            objectMetadataSingularName: 'person',
            gqlFields: 'id',
            recordId: TEST_COMMON_API_IDS.GQL_UPDATE_ONE,
          }),
        ).catch(() => {});
      });

      it('should update one person with all fields', async () => {
        const graphqlOperation = updateOneOperationFactory({
          objectMetadataSingularName: 'person',
          gqlFields: PERSON_GQL_FIELDS,
          recordId: TEST_COMMON_API_IDS.GQL_UPDATE_ONE,
          data: {
            city: 'UpdatedCity',
            jobTitle: 'UpdatedTitle',
          },
        });

        const response = await makeGraphqlAPIRequest(graphqlOperation);

        expect(response.status).toBe(200);
        expect(response.body).toMatchSnapshot({
          data: {
            updatePerson: {
              id: TEST_COMMON_API_IDS.GQL_UPDATE_ONE,
              createdAt: expect.any(String),
              deletedAt: null,
              city: 'UpdatedCity',
              jobTitle: 'UpdatedTitle',
            },
          },
        });
      });
    });

    describe('UpdateMany', () => {
      beforeEach(async () => {
        await makeGraphqlAPIRequest(
          createManyOperationFactory({
            objectMetadataSingularName: 'person',
            objectMetadataPluralName: 'people',
            gqlFields: 'id',
            data: [
              createPersonData(
                TEST_COMMON_API_IDS.GQL_UPDATE_MANY_1,
                'update-many-gql-1',
              ),
              createPersonData(
                TEST_COMMON_API_IDS.GQL_UPDATE_MANY_2,
                'update-many-gql-2',
              ),
            ],
          }),
        );
      });

      afterEach(async () => {
        await makeGraphqlAPIRequest(
          destroyManyOperationFactory({
            objectMetadataSingularName: 'person',
            objectMetadataPluralName: 'people',
            gqlFields: 'id',
            filter: {
              id: {
                in: [
                  TEST_COMMON_API_IDS.GQL_UPDATE_MANY_1,
                  TEST_COMMON_API_IDS.GQL_UPDATE_MANY_2,
                ],
              },
            },
          }),
        ).catch(() => {});
      });

      it('should update many people with filters', async () => {
        const graphqlOperation = updateManyOperationFactory({
          objectMetadataSingularName: 'person',
          objectMetadataPluralName: 'people',
          gqlFields: PERSON_GQL_FIELDS,
          data: {
            city: 'BulkUpdatedCity',
          },
          filter: {
            id: {
              in: [
                TEST_COMMON_API_IDS.GQL_UPDATE_MANY_1,
                TEST_COMMON_API_IDS.GQL_UPDATE_MANY_2,
              ],
            },
          },
        });

        const response = await makeGraphqlAPIRequest(graphqlOperation);

        expect(response.status).toBe(200);

        // Sort for consistent snapshot
        const sortedBody = {
          ...response.body,
          data: {
            ...response.body.data,
            updatePeople: response.body.data.updatePeople.sort(
              (a: any, b: any) => a.id.localeCompare(b.id),
            ),
          },
        };

        expect(sortedBody).toMatchSnapshot({
          data: {
            updatePeople: [
              {
                id: TEST_COMMON_API_IDS.GQL_UPDATE_MANY_1,
                createdAt: expect.any(String),
                deletedAt: null,
                city: 'BulkUpdatedCity',
              },
              {
                id: TEST_COMMON_API_IDS.GQL_UPDATE_MANY_2,
                createdAt: expect.any(String),
                deletedAt: null,
                city: 'BulkUpdatedCity',
              },
            ],
          },
        });
      });
    });

    describe('RestoreOne', () => {
      beforeEach(async () => {
        await makeGraphqlAPIRequest(
          createOneOperationFactory({
            objectMetadataSingularName: 'person',
            gqlFields: 'id',
            data: createPersonData(
              TEST_COMMON_API_IDS.GQL_RESTORE_ONE,
              'restore-one-gql',
            ),
          }),
        );

        // Soft delete the person
        await makeGraphqlAPIRequest(
          deleteOneOperationFactory({
            objectMetadataSingularName: 'person',
            gqlFields: 'id',
            recordId: TEST_COMMON_API_IDS.GQL_RESTORE_ONE,
          }),
        );
      });

      afterEach(async () => {
        await makeGraphqlAPIRequest(
          destroyOneOperationFactory({
            objectMetadataSingularName: 'person',
            gqlFields: 'id',
            recordId: TEST_COMMON_API_IDS.GQL_RESTORE_ONE,
          }),
        ).catch(() => {});
      });

      it('should restore one soft-deleted person', async () => {
        const graphqlOperation = restoreOneOperationFactory({
          objectMetadataSingularName: 'person',
          gqlFields: PERSON_GQL_FIELDS,
          recordId: TEST_COMMON_API_IDS.GQL_RESTORE_ONE,
        });

        const response = await makeGraphqlAPIRequest(graphqlOperation);

        expect(response.status).toBe(200);
        expect(response.body).toMatchSnapshot({
          data: {
            restorePerson: {
              id: TEST_COMMON_API_IDS.GQL_RESTORE_ONE,
              createdAt: expect.any(String),
              deletedAt: null,
            },
          },
        });
      });
    });

    describe('RestoreMany', () => {
      beforeEach(async () => {
        await makeGraphqlAPIRequest(
          createManyOperationFactory({
            objectMetadataSingularName: 'person',
            objectMetadataPluralName: 'people',
            gqlFields: 'id',
            data: [
              createPersonData(
                TEST_COMMON_API_IDS.GQL_RESTORE_MANY_1,
                'restore-many-gql-1',
              ),
              createPersonData(
                TEST_COMMON_API_IDS.GQL_RESTORE_MANY_2,
                'restore-many-gql-2',
              ),
            ],
          }),
        );

        // Soft delete the people
        await makeGraphqlAPIRequest(
          deleteManyOperationFactory({
            objectMetadataSingularName: 'person',
            objectMetadataPluralName: 'people',
            gqlFields: 'id',
            filter: {
              id: {
                in: [
                  TEST_COMMON_API_IDS.GQL_RESTORE_MANY_1,
                  TEST_COMMON_API_IDS.GQL_RESTORE_MANY_2,
                ],
              },
            },
          }),
        );
      });

      afterEach(async () => {
        await makeGraphqlAPIRequest(
          destroyManyOperationFactory({
            objectMetadataSingularName: 'person',
            objectMetadataPluralName: 'people',
            gqlFields: 'id',
            filter: {
              id: {
                in: [
                  TEST_COMMON_API_IDS.GQL_RESTORE_MANY_1,
                  TEST_COMMON_API_IDS.GQL_RESTORE_MANY_2,
                ],
              },
            },
          }),
        ).catch(() => {});
      });

      it('should restore many soft-deleted people', async () => {
        const graphqlOperation = restoreManyOperationFactory({
          objectMetadataSingularName: 'person',
          objectMetadataPluralName: 'people',
          gqlFields: PERSON_GQL_FIELDS,
          filter: {
            id: {
              in: [
                TEST_COMMON_API_IDS.GQL_RESTORE_MANY_1,
                TEST_COMMON_API_IDS.GQL_RESTORE_MANY_2,
              ],
            },
          },
        });

        const response = await makeGraphqlAPIRequest(graphqlOperation);

        expect(response.status).toBe(200);

        // Sort for consistent snapshot
        const sortedBody = {
          ...response.body,
          data: {
            ...response.body.data,
            restorePeople: response.body.data.restorePeople.sort(
              (a: any, b: any) => a.id.localeCompare(b.id),
            ),
          },
        };

        expect(sortedBody).toMatchSnapshot({
          data: {
            restorePeople: [
              {
                id: TEST_COMMON_API_IDS.GQL_RESTORE_MANY_1,
                createdAt: expect.any(String),
                deletedAt: null,
              },
              {
                id: TEST_COMMON_API_IDS.GQL_RESTORE_MANY_2,
                createdAt: expect.any(String),
                deletedAt: null,
              },
            ],
          },
        });
      });
    });

    describe('MergeMany', () => {
      beforeEach(async () => {
        await makeGraphqlAPIRequest(
          createManyOperationFactory({
            objectMetadataSingularName: 'person',
            objectMetadataPluralName: 'people',
            gqlFields: 'id',
            data: [
              {
                ...createPersonData(
                  TEST_COMMON_API_IDS.GQL_MERGE_MANY_1,
                  'merge-many-gql-1',
                ),
                emails: {
                  primaryEmail: 'merge1@example.com',
                  additionalEmails: ['merge1-alt@example.com'],
                },
              },
              {
                ...createPersonData(
                  TEST_COMMON_API_IDS.GQL_MERGE_MANY_2,
                  'merge-many-gql-2',
                ),
                emails: {
                  primaryEmail: 'merge2@example.com',
                  additionalEmails: ['merge2-alt@example.com'],
                },
              },
            ],
          }),
        );
      });

      afterEach(async () => {
        await makeGraphqlAPIRequest(
          destroyManyOperationFactory({
            objectMetadataSingularName: 'person',
            objectMetadataPluralName: 'people',
            gqlFields: 'id',
            filter: {
              id: {
                in: [
                  TEST_COMMON_API_IDS.GQL_MERGE_MANY_1,
                  TEST_COMMON_API_IDS.GQL_MERGE_MANY_2,
                ],
              },
            },
          }),
        ).catch(() => {});
      });

      it('should merge many people into one', async () => {
        const graphqlOperation = mergeManyOperationFactory({
          objectMetadataPluralName: 'people',
          gqlFields: PERSON_GQL_FIELDS,
          ids: [
            TEST_COMMON_API_IDS.GQL_MERGE_MANY_1,
            TEST_COMMON_API_IDS.GQL_MERGE_MANY_2,
          ],
          conflictPriorityIndex: 0,
        });

        const response = await makeGraphqlAPIRequest(graphqlOperation);

        expect(response.status).toBe(200);
        expect(response.body).toMatchSnapshot({
          data: {
            mergePeople: {
              id: expect.any(String),
              createdAt: expect.any(String),
              deletedAt: null,
              emails: {
                primaryEmail: 'merge1@example.com',
                additionalEmails: expect.arrayContaining([
                  'merge2@example.com',
                  'merge1-alt@example.com',
                  'merge2-alt@example.com',
                ]),
              },
            },
          },
        });
      });

      it('should handle merge with dryRun mode', async () => {
        const graphqlOperation = mergeManyOperationFactory({
          objectMetadataPluralName: 'people',
          gqlFields: PERSON_GQL_FIELDS,
          ids: [
            TEST_COMMON_API_IDS.GQL_MERGE_MANY_1,
            TEST_COMMON_API_IDS.GQL_MERGE_MANY_2,
          ],
          conflictPriorityIndex: 0,
          dryRun: true,
        });

        const response = await makeGraphqlAPIRequest(graphqlOperation);

        expect(response.status).toBe(200);
        expect(response.body).toMatchSnapshot({
          data: {
            mergePeople: {
              id: expect.any(String),
              createdAt: expect.any(String),
              deletedAt: expect.any(String),
              emails: {
                primaryEmail: 'merge1@example.com',
              },
            },
          },
        });

        // Verify original records still exist
        const findResponse = await makeGraphqlAPIRequest(
          findOneOperationFactory({
            objectMetadataSingularName: 'person',
            gqlFields: `
            id
            emails {
              primaryEmail
            }
            `,
            filter: {
              id: {
                eq: TEST_COMMON_API_IDS.GQL_MERGE_MANY_2,
              },
            },
          }),
        );

        expect(findResponse.body.data.person).toBeTruthy();
        expect(findResponse.body.data.person.emails.primaryEmail).toBe(
          'merge2@example.com',
        );
      });
    });

    describe('FindDuplicates', () => {
      beforeAll(async () => {
        await makeGraphqlAPIRequest(
          createManyOperationFactory({
            objectMetadataSingularName: 'person',
            objectMetadataPluralName: 'people',
            gqlFields: 'id',
            data: [
              {
                id: TEST_COMMON_API_IDS.GQL_FIND_DUPLICATES_1,
                name: {
                  firstName: 'Duplicate',
                  lastName: 'Duplicate',
                },
                emails: {
                  primaryEmail: 'duplicate@example.com',
                  additionalEmails: [],
                },
                phones: {
                  primaryPhoneNumber: '+33123456789',
                  primaryPhoneCountryCode: 'FR',
                  primaryPhoneCallingCode: '+33',
                  additionalPhones: [],
                },
                city: 'DuplicateCity',
                jobTitle: 'DuplicateJob',
                avatarUrl: 'https://example.com/avatar.jpg',
                intro: 'Duplicate intro',
              },
              {
                id: TEST_COMMON_API_IDS.GQL_FIND_DUPLICATES_2,
                name: {
                  firstName: 'Duplicate',
                  lastName: 'Duplicate',
                },
                emails: {
                  primaryEmail: 'duplicate2@example.com',
                  additionalEmails: [],
                },
                phones: {
                  primaryPhoneNumber: '+33123456789',
                  primaryPhoneCountryCode: 'FR',
                  primaryPhoneCallingCode: '+33',
                  additionalPhones: [],
                },
                city: 'DuplicateCity',
                jobTitle: 'DuplicateJob',
                avatarUrl: 'https://example.com/avatar2.jpg',
                intro: 'Duplicate intro 2',
              },
            ],
          }),
        );
      });

      afterAll(async () => {
        await makeGraphqlAPIRequest(
          destroyManyOperationFactory({
            objectMetadataSingularName: 'person',
            objectMetadataPluralName: 'people',
            gqlFields: 'id',
            filter: {
              id: {
                in: [
                  TEST_COMMON_API_IDS.GQL_FIND_DUPLICATES_1,
                  TEST_COMMON_API_IDS.GQL_FIND_DUPLICATES_2,
                ],
              },
            },
          }),
        ).catch(() => {});
      });

      it('should find duplicates by ids', async () => {
        const response = await makeGraphqlAPIRequest({
          query: gql`
            query FindPeopleDuplicates($ids: [UUID!]!) {
              personDuplicates(ids: $ids) {
                edges {
                  node {
                    ${PERSON_GQL_FIELDS}
                  }
                }
                pageInfo {
                  hasNextPage
                  hasPreviousPage
                  startCursor
                  endCursor
                }
                totalCount
              }
            }
          `,
          variables: {
            ids: [TEST_COMMON_API_IDS.GQL_FIND_DUPLICATES_1],
          },
        });

        expect(response.status).toBe(200);
        expect(response.body).toMatchSnapshot({
          data: {
            personDuplicates: expect.arrayContaining([
              {
                edges: expect.any(Array),
                pageInfo: {
                  hasNextPage: expect.any(Boolean),
                  hasPreviousPage: expect.any(Boolean),
                  startCursor: expect.any(String),
                  endCursor: expect.any(String),
                },
                totalCount: expect.any(Number),
              },
            ]),
          },
        });
      });
    });
  });

  describe('REST API Operations', () => {
    describe('Create One (POST)', () => {
      beforeEach(async () => {
        await deleteAllRecords('person');
      });

      afterEach(async () => {
        await deleteAllRecords('person');
      });

      it('should create one person via REST with all fields', async () => {
        const response = await makeRestAPIRequest({
          method: 'post',
          path: '/people',
          body: createPersonData(
            TEST_COMMON_API_IDS.REST_CREATE_ONE,
            'rest-create-one',
          ),
        });

        expect(response.status).toBe(201);
        expect(response.body).toMatchSnapshot();
      });
    });

    describe('Create Many (POST batch)', () => {
      afterEach(async () => {
        await makeRestAPIRequest({
          method: 'delete',
          path: `/people?filter=id[in]:[${TEST_COMMON_API_IDS.REST_CREATE_MANY_1},${TEST_COMMON_API_IDS.REST_CREATE_MANY_2}]`,
        }).catch(() => {});
      });

      it('should create many people via REST with all fields', async () => {
        const response = await makeRestAPIRequest({
          method: 'post',
          path: '/batch/people',
          body: [
            createPersonData(
              TEST_COMMON_API_IDS.REST_CREATE_MANY_1,
              'rest-create-many-1',
            ),
            createPersonData(
              TEST_COMMON_API_IDS.REST_CREATE_MANY_2,
              'rest-create-many-2',
            ),
          ],
        });

        expect(response.status).toBe(201);

        // Sort for consistent snapshot
        const sortedBody = {
          ...response.body,
          data: {
            ...response.body.data,
            createPeople: response.body.data.createPeople.sort(
              (a: any, b: any) => a.id.localeCompare(b.id),
            ),
          },
        };

        expect(sortedBody).toMatchSnapshot();
      });
    });

    describe('Find One (GET)', () => {
      beforeAll(async () => {
        await makeRestAPIRequest({
          method: 'post',
          path: '/people',
          body: createPersonData(
            TEST_COMMON_API_IDS.REST_FIND_ONE,
            'rest-find-one',
          ),
        });
      });

      afterAll(async () => {
        await makeRestAPIRequest({
          method: 'delete',
          path: `/people/${TEST_COMMON_API_IDS.REST_FIND_ONE}`,
        }).catch(() => {});
      });

      it('should find one person via REST with depth parameter', async () => {
        const response = await makeRestAPIRequest({
          method: 'get',
          path: `/people/${TEST_COMMON_API_IDS.REST_FIND_ONE}?depth=1`,
        });

        expect(response.status).toBe(200);
        expect(response.body).toMatchSnapshot();
      });
    });

    describe('Find Many (GET)', () => {
      beforeAll(async () => {
        await makeRestAPIRequest({
          method: 'post',
          path: '/batch/people',
          body: [
            createPersonData(
              TEST_COMMON_API_IDS.REST_FIND_MANY_1,
              'rest-find-many-1',
            ),
            createPersonData(
              TEST_COMMON_API_IDS.REST_FIND_MANY_2,
              'rest-find-many-2',
            ),
          ],
        });
      });

      afterAll(async () => {
        await makeRestAPIRequest({
          method: 'delete',
          path: `/people?filter=id[in]:[${TEST_COMMON_API_IDS.REST_FIND_MANY_1},${TEST_COMMON_API_IDS.REST_FIND_MANY_2}]`,
        }).catch(() => {});
      });

      it('should find many people via REST with filters and pagination', async () => {
        const response = await makeRestAPIRequest({
          method: 'get',
          path: `/people?filter=id[in]:[${TEST_COMMON_API_IDS.REST_FIND_MANY_1},${TEST_COMMON_API_IDS.REST_FIND_MANY_2}]&order[name.firstName]=AscNullsFirst&limit=10&depth=1`,
        });

        expect(response.status).toBe(200);
        expect(response.body).toMatchSnapshot();
      });
    });

    // describe('Group By (GET)', () => {
    //   beforeAll(async () => {
    //     await makeRestAPIRequest({
    //       method: 'post',
    //       path: '/batch/people',
    //       body: [
    //         {
    //           ...createPersonData(
    //             TEST_COMMON_API_IDS.REST_GROUP_BY_1,
    //             'rest-group-1',
    //           ),
    //           city: 'RestCityA',
    //         },
    //         {
    //           ...createPersonData(
    //             TEST_COMMON_API_IDS.REST_GROUP_BY_2,
    //             'rest-group-2',
    //           ),
    //           city: 'RestCityA',
    //         },
    //         {
    //           ...createPersonData(
    //             TEST_COMMON_API_IDS.REST_GROUP_BY_3,
    //             'rest-group-3',
    //           ),
    //           city: 'RestCityB',
    //         },
    //       ],
    //     });
    //   });

    //   afterAll(async () => {
    //     await makeRestAPIRequest({
    //       method: 'delete',
    //       path: `/people?filter[id][in][]=${TEST_COMMON_API_IDS.REST_GROUP_BY_1}&filter[id][in][]=${TEST_COMMON_API_IDS.REST_GROUP_BY_2}&filter[id][in][]=${TEST_COMMON_API_IDS.REST_GROUP_BY_3}`,
    //     }).catch(() => {});
    //   });

    //   it('should group by city via REST', async () => {
    //     const response = await makeRestAPIRequest({
    //       method: 'get',
    //       path: `/people/group-by?groupBy[]=city&filter[id][in][]=${TEST_COMMON_API_IDS.REST_GROUP_BY_1}&filter[id][in][]=${TEST_COMMON_API_IDS.REST_GROUP_BY_2}&filter[id][in][]=${TEST_COMMON_API_IDS.REST_GROUP_BY_3}`,
    //     });

    //     expect(response.status).toBe(200);
    //     expect(response.body.data.peopleGroupBy).toHaveLength(2);

    //     // Sort for consistent snapshot
    //     const groups = response.body.data.peopleGroupBy.sort((a: any, b: any) =>
    //       a.groupByDimensionValues[0].localeCompare(
    //         b.groupByDimensionValues[0],
    //       ),
    //     );

    //     expect({ peopleGroupBy: groups }).toMatchSnapshot({
    //       peopleGroupBy: [
    //         {
    //           groupByDimensionValues: ['RestCityA'],
    //           totalCount: 2,
    //         },
    //         {
    //           groupByDimensionValues: ['RestCityB'],
    //           totalCount: 1,
    //         },
    //       ],
    //     });
    //   });
    // });

    // describe('Delete One - Soft Delete (DELETE)', () => {
    //   beforeEach(async () => {
    //     await makeRestAPIRequest({
    //       method: 'post',
    //       path: '/people',
    //       body: createPersonData(
    //         TEST_COMMON_API_IDS.REST_DELETE_ONE,
    //         'rest-delete-one',
    //       ),
    //     });
    //   });

    //   afterEach(async () => {
    //     await makeRestAPIRequest({
    //       method: 'delete',
    //       path: `/people/${TEST_COMMON_API_IDS.REST_DELETE_ONE}`,
    //     }).catch(() => {});
    //   });

    //   it('should soft delete one person via REST', async () => {
    //   //   const response = await makeRestAPIRequest({
    //   //     method: 'delete',
    //   //     path: `/people/${TEST_COMMON_API_IDS.REST_DELETE_ONE}?softDelete=true`,
    //   //   });

    //   //   expect(response.status).toBe(200);
    //   //   expect(response.body.data.deletePerson.deletedAt).toBeTruthy();
    //   //   expect(response.body.data).toMatchSnapshot({
    //   //     deletePerson: {
    //   //       id: TEST_COMMON_API_IDS.REST_DELETE_ONE,
    //   //       createdAt: expect.any(String),
    //   //       deletedAt: expect.any(String),
    //   //       createdBy: {
    //   //         source: expect.any(String),
    //   //         workspaceMemberId: null,
    //   //         name: expect.any(String),
    //   //       },
    //   //     },
    //   //   });
    //   // });
    // });

    // describe('Delete Many - Soft Delete (DELETE)', () => {
    //   beforeEach(async () => {
    //     await makeRestAPIRequest({
    //       method: 'post',
    //       path: '/batch/people',
    //       body: [
    //         createPersonData(
    //           TEST_COMMON_API_IDS.REST_DELETE_MANY_1,
    //           'rest-delete-many-1',
    //         ),
    //         createPersonData(
    //           TEST_COMMON_API_IDS.REST_DELETE_MANY_2,
    //           'rest-delete-many-2',
    //         ),
    //       ],
    //     });
    //   });

    //   afterEach(async () => {
    //     await makeRestAPIRequest({
    //       method: 'delete',
    //       path: `/people?filter[id][in][]=${TEST_COMMON_API_IDS.REST_DELETE_MANY_1}&filter[id][in][]=${TEST_COMMON_API_IDS.REST_DELETE_MANY_2}`,
    //     }).catch(() => {});
    //   });

    //   // it('should soft delete many people via REST', async () => {
    //   //   const response = await makeRestAPIRequest({
    //   //     method: 'delete',
    //   //     path: `/people?filter[id][in][]=${TEST_COMMON_API_IDS.REST_DELETE_MANY_1}&filter[id][in][]=${TEST_COMMON_API_IDS.REST_DELETE_MANY_2}&softDelete=true`,
    //   //   });

    //   //   expect(response.status).toBe(200);
    //   //   expect(response.body.data.deletePeople).toHaveLength(2);

    //   //   // Sort for consistent snapshot
    //   //   const deletedPeople = response.body.data.deletePeople.sort(
    //   //     (a: any, b: any) => a.id.localeCompare(b.id),
    //   //   );

    //   //   expect({ deletePeople: deletedPeople }).toMatchSnapshot({
    //   //     deletePeople: [
    //   //       {
    //   //         id: TEST_COMMON_API_IDS.REST_DELETE_MANY_1,
    //   //         createdAt: expect.any(String),
    //   //         deletedAt: expect.any(String),
    //   //         createdBy: {
    //   //           source: expect.any(String),
    //   //           workspaceMemberId: null,
    //   //           name: expect.any(String),
    //   //         },
    //   //       },
    //   //       {
    //   //         id: TEST_COMMON_API_IDS.REST_DELETE_MANY_2,
    //   //         createdAt: expect.any(String),
    //   //         deletedAt: expect.any(String),
    //   //         createdBy: {
    //   //           source: expect.any(String),
    //   //           workspaceMemberId: null,
    //   //           name: expect.any(String),
    //   //         },
    //   //       },
    //   //     ],
    //   //   });
    //   // });
    // });

    describe('Destroy One - Hard Delete (DELETE)', () => {
      beforeEach(async () => {
        await makeRestAPIRequest({
          method: 'post',
          path: '/people',
          body: createPersonData(
            TEST_COMMON_API_IDS.REST_DESTROY_ONE,
            'rest-destroy-one',
          ),
        });
      });

      it('should hard delete one person via REST', async () => {
        const response = await makeRestAPIRequest({
          method: 'delete',
          path: `/people/${TEST_COMMON_API_IDS.REST_DESTROY_ONE}`,
        });

        expect(response.status).toBe(200);
        expect(response.body).toMatchSnapshot();

        // Verify it's really gone
        const findResponse = await makeRestAPIRequest({
          method: 'get',
          path: `/people/${TEST_COMMON_API_IDS.REST_DESTROY_ONE}`,
        }).catch((err) => err.response);

        expect(findResponse.status).toBe(404);
      });
    });

    describe('Update One (PUT)', () => {
      beforeEach(async () => {
        await makeRestAPIRequest({
          method: 'post',
          path: '/people',
          body: createPersonData(
            TEST_COMMON_API_IDS.REST_UPDATE_ONE,
            'rest-update-one',
          ),
        });
      });

      afterEach(async () => {
        await makeRestAPIRequest({
          method: 'delete',
          path: `/people/${TEST_COMMON_API_IDS.REST_UPDATE_ONE}`,
        }).catch(() => {});
      });

      it('should update one person via REST', async () => {
        const response = await makeRestAPIRequest({
          method: 'put',
          path: `/people/${TEST_COMMON_API_IDS.REST_UPDATE_ONE}`,
          body: {
            city: 'RestUpdatedCity',
            jobTitle: 'RestUpdatedTitle',
          },
        });

        expect(response.status).toBe(200);
        expect(response.body).toMatchSnapshot();
      });
    });

    // describe('Update Many (PUT batch)', () => {
    //   beforeEach(async () => {
    //     await makeRestAPIRequest({
    //       method: 'post',
    //       path: '/batch/people',
    //       body: [
    //         createPersonData(
    //           TEST_COMMON_API_IDS.REST_UPDATE_MANY_1,
    //           'rest-update-many-1',
    //         ),
    //         createPersonData(
    //           TEST_COMMON_API_IDS.REST_UPDATE_MANY_2,
    //           'rest-update-many-2',
    //         ),
    //       ],
    //     });
    //   });

    //   afterEach(async () => {
    //     await makeRestAPIRequest({
    //       method: 'delete',
    //       path: `/people?filter=id[in]:[${TEST_COMMON_API_IDS.REST_UPDATE_MANY_1},${TEST_COMMON_API_IDS.REST_UPDATE_MANY_2}]`,
    //     }).catch(() => {});
    //   });

    //   it('should update many people via REST', async () => {
    //     const response = await makeRestAPIRequest({
    //       method: 'put',
    //       path: `/batch/people?filter=id[in]:[${TEST_COMMON_API_IDS.REST_UPDATE_MANY_1},${TEST_COMMON_API_IDS.REST_UPDATE_MANY_2}]`,
    //       body: {
    //         city: 'RestBulkUpdatedCity',
    //       },
    //     });

    //     expect(response.status).toBe(200);
    //     expect(response.body.data.updatePeople).toHaveLength(2);

    //     // Sort for consistent snapshot
    //     const updatedPeople = response.body.data.updatePeople.sort(
    //       (a: any, b: any) => a.id.localeCompare(b.id),
    //     );

    //     expect(updatedPeople[0].city).toBe('RestBulkUpdatedCity');
    //     expect(updatedPeople[1].city).toBe('RestBulkUpdatedCity');
    //     expect({ updatePeople: updatedPeople }).toMatchSnapshot({
    //       updatePeople: [
    //         {
    //           id: TEST_COMMON_API_IDS.REST_UPDATE_MANY_1,
    //           createdAt: expect.any(String),
    //           deletedAt: null,
    //           createdBy: {
    //             source: expect.any(String),
    //             workspaceMemberId: null,
    //             name: expect.any(String),
    //           },
    //         },
    //         {
    //           id: TEST_COMMON_API_IDS.REST_UPDATE_MANY_2,
    //           createdAt: expect.any(String),
    //           deletedAt: null,
    //           createdBy: {
    //             source: expect.any(String),
    //             workspaceMemberId: null,
    //             name: expect.any(String),
    //           },
    //         },
    //       ],
    //     });
    //   });
    // });

    // describe('Restore One (PATCH)', () => {
    //   beforeEach(async () => {
    //     await makeRestAPIRequest({
    //       method: 'post',
    //       path: '/people',
    //       body: createPersonData(
    //         TEST_COMMON_API_IDS.REST_RESTORE_ONE,
    //         'rest-restore-one',
    //       ),
    //     });

    //     // Soft delete the person
    //     await makeRestAPIRequest({
    //       method: 'delete',
    //       path: `/people/${TEST_COMMON_API_IDS.REST_RESTORE_ONE}?softDelete=true`,
    //     });
    //   });

    //   afterEach(async () => {
    //     await makeRestAPIRequest({
    //       method: 'delete',
    //       path: `/people/${TEST_COMMON_API_IDS.REST_RESTORE_ONE}`,
    //     }).catch(() => {});
    //   });

    //   it('should restore one soft-deleted person via REST', async () => {
    //     const response = await makeRestAPIRequest({
    //       method: 'patch',
    //       path: `/people/${TEST_COMMON_API_IDS.REST_RESTORE_ONE}/restore`,
    //     });

    //     expect(response.status).toBe(200);
    //     expect(response.body.data.restorePerson.deletedAt).toBeNull();
    //     expect(response.body.data).toMatchSnapshot({
    //       restorePerson: {
    //         id: TEST_COMMON_API_IDS.REST_RESTORE_ONE,
    //         createdAt: expect.any(String),
    //         deletedAt: null,
    //         createdBy: {
    //           source: expect.any(String),
    //           workspaceMemberId: null,
    //           name: expect.any(String),
    //         },
    //       },
    //     });
    //   });
    // });

    // describe('Restore Many (PATCH batch)', () => {
    //   beforeEach(async () => {
    //     await makeRestAPIRequest({
    //       method: 'post',
    //       path: '/batch/people',
    //       body: [
    //         createPersonData(
    //           TEST_COMMON_API_IDS.REST_RESTORE_MANY_1,
    //           'rest-restore-many-1',
    //         ),
    //         createPersonData(
    //           TEST_COMMON_API_IDS.REST_RESTORE_MANY_2,
    //           'rest-restore-many-2',
    //         ),
    //       ],
    //     });

    //     // Soft delete the people
    //     await makeRestAPIRequest({
    //       method: 'delete',
    //       path: `/people?filter=id[in]:[${TEST_COMMON_API_IDS.REST_RESTORE_MANY_1},${TEST_COMMON_API_IDS.REST_RESTORE_MANY_2}]&softDelete=true`,
    //     });
    //   });

    //   afterEach(async () => {
    //     await makeRestAPIRequest({
    //       method: 'delete',
    //       path: `/people?filter=id[in]:[${TEST_COMMON_API_IDS.REST_RESTORE_MANY_1},${TEST_COMMON_API_IDS.REST_RESTORE_MANY_2}]`,
    //     }).catch(() => {});
    //   });

    //   it('should restore many soft-deleted people via REST', async () => {
    //     const response = await makeRestAPIRequest({
    //       method: 'patch',
    //       path: `/people/restore?filter=id[in]:[${TEST_COMMON_API_IDS.REST_RESTORE_MANY_1},${TEST_COMMON_API_IDS.REST_RESTORE_MANY_2}]`,
    //     });

    //     expect(response.status).toBe(200);
    //     expect(response.body.data.restorePeople).toHaveLength(2);

    //     // Sort for consistent snapshot
    //     const restoredPeople = response.body.data.restorePeople.sort(
    //       (a: any, b: any) => a.id.localeCompare(b.id),
    //     );

    //     expect(restoredPeople[0].deletedAt).toBeNull();
    //     expect(restoredPeople[1].deletedAt).toBeNull();
    //     expect({ restorePeople: restoredPeople }).toMatchSnapshot({
    //       restorePeople: [
    //         {
    //           id: TEST_COMMON_API_IDS.REST_RESTORE_MANY_1,
    //           createdAt: expect.any(String),
    //           deletedAt: null,
    //           createdBy: {
    //             source: expect.any(String),
    //             workspaceMemberId: null,
    //             name: expect.any(String),
    //           },
    //         },
    //         {
    //           id: TEST_COMMON_API_IDS.REST_RESTORE_MANY_2,
    //           createdAt: expect.any(String),
    //           deletedAt: null,
    //           createdBy: {
    //             source: expect.any(String),
    //             workspaceMemberId: null,
    //             name: expect.any(String),
    //           },
    //         },
    //       ],
    //     });
    //   });
    // });

    // describe('Merge Many (POST)', () => {
    //   beforeEach(async () => {
    //     await makeRestAPIRequest({
    //       method: 'post',
    //       path: '/batch/people',
    //       body: [
    //         {
    //           ...createPersonData(
    //             TEST_COMMON_API_IDS.REST_MERGE_MANY_1,
    //             'rest-merge-many-1',
    //           ),
    //           emails: {
    //             primaryEmail: 'rest-merge1@example.com',
    //             additionalEmails: ['rest-merge1-alt@example.com'],
    //           },
    //         },
    //         {
    //           ...createPersonData(
    //             TEST_COMMON_API_IDS.REST_MERGE_MANY_2,
    //             'rest-merge-many-2',
    //           ),
    //           emails: {
    //             primaryEmail: 'rest-merge2@example.com',
    //             additionalEmails: ['rest-merge2-alt@example.com'],
    //           },
    //         },
    //       ],
    //     });
    //   });

    //   afterEach(async () => {
    //     await makeRestAPIRequest({
    //       method: 'delete',
    //       path: `/people?filter=id[in]:[${TEST_COMMON_API_IDS.REST_MERGE_MANY_1},${TEST_COMMON_API_IDS.REST_MERGE_MANY_2}]`,
    //     }).catch(() => {});
    //   });

    //   it('should merge many people via REST', async () => {
    //     const response = await makeRestAPIRequest({
    //       method: 'post',
    //       path: '/people/merge',
    //       body: {
    //         ids: [
    //           TEST_COMMON_API_IDS.REST_MERGE_MANY_1,
    //           TEST_COMMON_API_IDS.REST_MERGE_MANY_2,
    //         ],
    //         conflictPriorityIndex: 0,
    //       },
    //     });

    //     expect(response.status).toBe(200);

    //     const mergedPerson = response.body.data.mergePeople;

    //     expect(mergedPerson.emails.primaryEmail).toBe(
    //       'rest-merge1@example.com',
    //     );
    //     expect(mergedPerson.emails.additionalEmails).toEqual(
    //       expect.arrayContaining([
    //         'rest-merge2@example.com',
    //         'rest-merge1-alt@example.com',
    //         'rest-merge2-alt@example.com',
    //       ]),
    //     );
    //     expect(response.body.data).toMatchSnapshot({
    //       mergePeople: {
    //         id: expect.any(String),
    //         createdAt: expect.any(String),
    //         deletedAt: null,
    //         createdBy: {
    //           source: expect.any(String),
    //           workspaceMemberId: null,
    //           name: expect.any(String),
    //         },
    //       },
    //     });
    //   });

    //   it('should handle merge with dryRun mode via REST', async () => {
    //     const response = await makeRestAPIRequest({
    //       method: 'post',
    //       path: '/people/merge',
    //       body: {
    //         ids: [
    //           TEST_COMMON_API_IDS.REST_MERGE_MANY_1,
    //           TEST_COMMON_API_IDS.REST_MERGE_MANY_2,
    //         ],
    //         conflictPriorityIndex: 0,
    //         dryRun: true,
    //       },
    //     });

    //     expect(response.status).toBe(200);

    //     const dryRunResult = response.body.data.mergePeople;

    //     expect(dryRunResult.emails.primaryEmail).toBe(
    //       'rest-merge1@example.com',
    //     );

    //     // Verify original records still exist
    //     const findResponse = await makeRestAPIRequest({
    //       method: 'get',
    //       path: `/people/${TEST_COMMON_API_IDS.REST_MERGE_MANY_2}`,
    //     });

    //     expect(findResponse.body.data.person).toBeTruthy();
    //     expect(findResponse.body.data.person.emails.primaryEmail).toBe(
    //       'rest-merge2@example.com',
    //     );
    //   });
    // });

    // describe('Find Duplicates (POST)', () => {
    //   beforeAll(async () => {
    //     await makeRestAPIRequest({
    //       method: 'post',
    //       path: '/batch/people',
    //       body: [
    //         {
    //           id: TEST_COMMON_API_IDS.REST_FIND_DUPLICATES_1,
    //           name: {
    //             firstName: 'RestDuplicate',
    //             lastName: 'Person',
    //           },
    //           emails: {
    //             primaryEmail: 'rest-duplicate@example.com',
    //             additionalEmails: [],
    //           },
    //           phones: {
    //             primaryPhoneNumber: '+33987654321',
    //             primaryPhoneCountryCode: 'FR',
    //             primaryPhoneCallingCode: '+33',
    //             additionalPhones: [],
    //           },
    //           city: 'RestDuplicateCity',
    //           jobTitle: 'RestDuplicateJob',
    //           avatarUrl: 'https://example.com/rest-avatar.jpg',
    //           intro: 'Rest duplicate intro',
    //         },
    //         {
    //           id: TEST_COMMON_API_IDS.REST_FIND_DUPLICATES_2,
    //           name: {
    //             firstName: 'RestDuplicate',
    //             lastName: 'Person',
    //           },
    //           emails: {
    //             primaryEmail: 'rest-duplicate2@example.com',
    //             additionalEmails: [],
    //           },
    //           phones: {
    //             primaryPhoneNumber: '+33987654321',
    //             primaryPhoneCountryCode: 'FR',
    //             primaryPhoneCallingCode: '+33',
    //             additionalPhones: [],
    //           },
    //           city: 'RestDuplicateCity',
    //           jobTitle: 'RestDuplicateJob',
    //           avatarUrl: 'https://example.com/rest-avatar2.jpg',
    //           intro: 'Rest duplicate intro 2',
    //         },
    //       ],
    //     });
    //   });

    //   afterAll(async () => {
    //     await makeRestAPIRequest({
    //       method: 'delete',
    //       path: `/people?filter=id[in]:[${TEST_COMMON_API_IDS.REST_FIND_DUPLICATES_1},${TEST_COMMON_API_IDS.REST_FIND_DUPLICATES_2}]`,
    //     }).catch(() => {});
    //   });

    //   it('should find duplicates by data via REST', async () => {
    //     const response = await makeRestAPIRequest({
    //       method: 'post',
    //       path: '/people/duplicates',
    //       body: {
    //         data: [
    //           {
    //             name: {
    //               firstName: 'RestDuplicate',
    //               lastName: 'Person',
    //             },
    //           },
    //         ],
    //       },
    //     });

    //     expect(response.status).toBe(200);
    //     const duplicates = response.body.data;

    //     expect(duplicates).toHaveLength(1);
    //     expect(duplicates[0].totalCount).toBeGreaterThanOrEqual(2);
    //     expect(duplicates[0].personDuplicates).toHaveLength(2);
    //   });

    //   it('should find duplicates by ids via REST', async () => {
    //     const response = await makeRestAPIRequest({
    //       method: 'post',
    //       path: '/people/duplicates',
    //       body: {
    //         ids: [TEST_COMMON_API_IDS.REST_FIND_DUPLICATES_1],
    //       },
    //     });

    //     expect(response.status).toBe(200);
    //     const duplicates = response.body.data;

    //     expect(duplicates).toHaveLength(1);
    //     expect(duplicates[0].totalCount).toBeGreaterThanOrEqual(1);
    //   });
    // });

    // describe('Destroy Many - Hard Delete (DELETE)', () => {
    //   beforeEach(async () => {
    //     await makeRestAPIRequest({
    //       method: 'post',
    //       path: '/batch/people',
    //       body: [
    //         createPersonData(
    //           TEST_COMMON_API_IDS.REST_DESTROY_MANY_1,
    //           'rest-destroy-many-1',
    //         ),
    //         createPersonData(
    //           TEST_COMMON_API_IDS.REST_DESTROY_MANY_2,
    //           'rest-destroy-many-2',
    //         ),
    //       ],
    //     });
    //   });

    //   it('should hard delete many people via REST', async () => {
    //     const response = await makeRestAPIRequest({
    //       method: 'delete',
    //       path: `/people?filter=id[in]:[${TEST_COMMON_API_IDS.REST_DESTROY_MANY_1},${TEST_COMMON_API_IDS.REST_DESTROY_MANY_2}]`,
    //     });

    //     expect(response.status).toBe(200);
    //     expect(response.body.data.deletePeople).toHaveLength(2);

    //     // Sort for consistent snapshot
    //     const deletedPeople = response.body.data.deletePeople.sort(
    //       (a: any, b: any) => a.id.localeCompare(b.id),
    //     );

    //     expect(deletedPeople).toMatchSnapshot([
    //       {
    //         id: TEST_COMMON_API_IDS.REST_DESTROY_MANY_1,
    //       },
    //       {
    //         id: TEST_COMMON_API_IDS.REST_DESTROY_MANY_2,
    //       },
    //     ]);

    //     // Verify they're really gone
    //     const findResponse = await makeRestAPIRequest({
    //       method: 'get',
    //       path: `/people?filter=id[in]:[${TEST_COMMON_API_IDS.REST_DESTROY_MANY_1},${TEST_COMMON_API_IDS.REST_DESTROY_MANY_2}]`,
    //     });

    //     expect(findResponse.body.data.people.edges).toHaveLength(0);
    //   });
    // });
  });
});
