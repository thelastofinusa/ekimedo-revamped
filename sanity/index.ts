import { type SchemaTypeDefinition } from "sanity";
import { categoryType } from "./schema/category.schema";
import { galleryType } from "./schema/gallery.schema";
import { cancellationPolicyType } from "./schema/cancellation-policy";
import { heroType } from "./schema/hero.schema";
import { reviewType } from "./schema/review.schema";
import { permissionType } from "./schema/permission.schema";
import { socialType } from "./schema/social.schema";
import { faqType } from "./schema/faq.schema";
import { pricingTierType } from "./schema/pricing.schema";
import { businessHoursType } from "./schema/hours.schema";
import { consultationType } from "./schema/consultation";
import { formFieldType } from "./schema/consultation/formField.object";
import { fieldDescriptionType } from "./schema/consultation/fieldDescription";
import { fieldIconsType } from "./schema/consultation/fieldIcons.object";
import { fieldOptionType } from "./schema/consultation/fieldOptions.object";
import { fieldInterestType } from "./schema/consultation/fieldInterest.object";
import { fieldItemType } from "./schema/consultation/fieldItem.object";
import { fieldRangeType } from "./schema/consultation/fieldRange.object";
import { formCardType } from "./schema/consultation/formCard.object";
import { blockedSlotType } from "./schema/blockedSlot.schema";
import { bookingType } from "./schema/booking.schema";
import { colorType } from "./schema/color.schema";
import { productType } from "./schema/product.schema";
import { orderType } from "./schema/order.schema";
import { inquiryType } from "./schema/inquiry.schema";

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
    pricingTierType,
    businessHoursType,
    blockedSlotType,
    bookingType,
    colorType,
    productType,
    orderType,
    inquiryType,
    // consultation
    consultationType,
    formCardType,
    formFieldType,
    fieldDescriptionType,
    fieldIconsType,
    fieldOptionType,
    fieldInterestType,
    fieldItemType,
    fieldRangeType,
  ],
};
