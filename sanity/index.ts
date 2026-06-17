import { type SchemaTypeDefinition } from "sanity";
import { categoryType } from "./schema/category.schema";
import { galleryType } from "./schema/gallery.schema";
import { cancellationPolicyType } from "./schema/cancellation-policy";
import { heroType } from "./schema/hero.schema";
import { reviewType } from "./schema/review.schema";
import { permissionType } from "./schema/permission.schema";
import { socialType } from "./schema/social.schema";
import { faqType } from "./schema/faq.schema";

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [
    categoryType,
    galleryType,
    cancellationPolicyType,
    heroType,
    reviewType,
    permissionType,
    socialType,
    faqType,
  ],
};
