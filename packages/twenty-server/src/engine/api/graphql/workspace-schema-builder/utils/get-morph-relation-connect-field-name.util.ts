export const getMorphRelationConnectFieldName = (joinColumnName: string) => {
  return joinColumnName.replace(/Id$/, '');
};

export const getMorphRelationJoinColumnName = (
  morphRelationConnectFieldName: string,
) => {
  return morphRelationConnectFieldName + 'Id';
};
