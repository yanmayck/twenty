import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { isCompositeFieldType } from '@/object-record/object-filter-dropdown/utils/isCompositeFieldType';
import { SETTINGS_COMPOSITE_FIELD_TYPE_CONFIGS } from '@/settings/data-model/constants/SettingsCompositeFieldTypeConfigs';
import { FieldMetadataType } from 'twenty-shared/types';
import { RelationType } from '~/generated/graphql';

export const canBeUnique = (
  field: Pick<FieldMetadataItem, 'type' | 'isCustom' | 'settings'>,
) => {
  if (
    field.isCustom === false ||
    [FieldMetadataType.MORPH_RELATION, FieldMetadataType.ACTOR].includes(
      field.type,
    ) ||
    (field.type === FieldMetadataType.RELATION &&
      field.settings?.relationType === RelationType.ONE_TO_MANY) ||
    (isCompositeFieldType(field.type) &&
      SETTINGS_COMPOSITE_FIELD_TYPE_CONFIGS[field.type].subFields.some(
        (subField) => subField.isIncludedInUniqueConstraint,
      ))
  )
    return false;

  return true;
};
