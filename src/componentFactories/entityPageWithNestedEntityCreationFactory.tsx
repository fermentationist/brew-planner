import EntityPageWithNestedEntityCreation, {EntityOptions, SecondaryEntityOptions} from "../components/EntityPageWithNestedEntityCreation";
import { ComponentType } from "react";

export interface EntityPageWithNestedEntityCreationFactoryOptions {
  primaryEntity: EntityOptions;
  secondaryEntity: SecondaryEntityOptions;
}

// a factory to automate the creation of pages for entities like mashes, which have "nested" entities like mash steps
function entityPageWithNestedEntityCreationFactory<EntityType>(options: EntityPageWithNestedEntityCreationFactoryOptions) { 
  return EntityPageWithNestedEntityCreation.bind(null, options) as ComponentType<EntityType>;
}

export default entityPageWithNestedEntityCreationFactory;
