import { type SchemaTypeDefinition } from "sanity";
import { categoryType } from "./schema/category.schema";
import { galleryType } from "./schema/gallery.schema";
import { cancellationPolicyType } from "./schema/cancellation-policy";
import { heroType } from "./schema/hero.schema";
import { reviewType } from "./schema/review.schema";

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [
    categoryType,
    galleryType,
    cancellationPolicyType,
    heroType,
    reviewType,
  ],
};
