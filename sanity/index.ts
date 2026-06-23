import { type SchemaTypeDefinition } from "sanity";
import { permissionType } from "./schemas/permission.schema";
import { heroType } from "./schemas/hero.schema";
import { socialType } from "./schemas/social.schema";
import { businessHoursType } from "./schemas/hours.schema";
import { reviewType } from "./schemas/review.schema";
import { galleryType } from "./schemas/gallery.schema";
import { categoryType } from "./schemas/category.schema";
import { consultationType } from "./schemas/consultation.schema";
import { formCardType } from "./schemas/consultation/formCard.object";
import { formFieldType } from "./schemas/consultation/formField.object";
import { fieldDescriptionType } from "./schemas/consultation/fieldDescription";
import { fieldIconsType } from "./schemas/consultation/fieldIcons.object";
import { fieldOptionType } from "./schemas/consultation/fieldOptions.object";
import { fieldInterestType } from "./schemas/consultation/fieldInterest.object";
import { fieldItemType } from "./schemas/consultation/fieldItem.object";
import { fieldRangeType } from "./schemas/consultation/fieldRange.object";
import { faqType } from "./schemas/faq.schema";
import { bookingProcessType } from "./schemas/process.schema";
import { inquiryType } from "./schemas/inquiry.schema";
import { cancellationPolicyType } from "./schemas/cancellation-policy";
import { pricingTierType } from "./schemas/pricing.schema";
import { blockedSlotType } from "./schemas/blockedSlot.schema";
import { productType } from "./schemas/product.schema";
import { colorType } from "./schemas/color.schema";
import { orderType } from "./schemas/order.schema";
import { bookingType } from "./schemas/booking.schema";

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
    colorType,
    productType,
    inquiryType,
    bookingProcessType,
    orderType,
    bookingType,
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
