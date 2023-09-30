import Models from "../models/Models.js";
import localCache from "./localCache/index.js";

// entityServiceFactory is a factory function that returns a service for interacting with a particular entity.
export default function entityServiceFactory (entityName, pluralEntityName, additionalExports) {
  const capitalize = (str) => str[0].toUpperCase() + str.slice(1);
  const capitalizedEntityName = capitalize(entityName);
  const capitalizedPluralEntityName = capitalize(pluralEntityName);
  const entityUuidName = `${entityName}Uuid`;

  const getEntitiesFn = (breweryUuid) => {
    return Models[entityName].select(breweryUuid && { breweryUuid });
  }

  return {

    // getEntities (i.e. getHops)
    [`get${capitalizedPluralEntityName}`]: getEntitiesFn,

    //createEntity (i.e. createHop)
    [`create${capitalizedEntityName}`]: async (breweryUuid, entityData) => {
      const entityUuid = entityData[entityUuidName];
      const hopRow = {
        breweryUuid,
        ...entityData,
      };
      const { insertId } = await Models[entityName].insert([hopRow], false);
      localCache.invalidate(entityName);
      if (entityUuid) {
        // if user passed a UUID for the new hop
        return entityUuid;
      }
      const [newEntity] = await Models[entityName].select({
        [`${entityName}Key`]: insertId,
      });
      return newEntity[entityUuidName];
    },

    // updateEntity (i.e. updateHop)
    [`update${capitalizedEntityName}`]: async (breweryUuid, entityUuid, updateData) => {

      const result = await Models[entityName].update(updateData, {
        breweryUuid,
        [entityUuidName]: entityUuid,
      });
      localCache.invalidate(entityName);
      return result;
    },

    // deleteEntity (i.e. deleteHop)
    [`delete${capitalizedEntityName}`]: async (breweryUuid, entityUuid) => {
      const result = await Models[entityName].delete({
        breweryUuid,
        [entityUuidName]: entityUuid,
      });
      if (!result.affectedRows) {
        throw (
          (`The brewery with the breweryUuid ${breweryUuid} has no ${entityName} with the ${entityUuidName} ${entityUuid}`)
        );
      }
      localCache.invalidate(entityName);
      return result;
    },

    // isExistingEntityAttribute (i.e. isExistingHopAttribute)
    [`isExisting${capitalizedEntityName}Attribute`]: localCache.isExistingTableAttribute(entityName, getEntitiesFn),

    // additional exports (i.e. constants, like HOP_FORMS)
    ...additionalExports,
  };
}

