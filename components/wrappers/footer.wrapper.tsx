import { client, clientOptions } from "@/sanity/lib/client";
import { QUERY_BUSINESS_HOURS } from "@/sanity/queries/hour.query";
import { QUERY_SOCIAL_HANDLES } from "@/sanity/queries/social.query";
import { Footer } from "../shared/footer";

export const FooterWrapper = async () => {
  const businessHours = await client.fetch(
    QUERY_BUSINESS_HOURS,
    {},
    clientOptions,
  );
  const socialHandles = await client.fetch(
    QUERY_SOCIAL_HANDLES,
    {},
    clientOptions,
  );

  return <Footer initialHours={businessHours} socialHandles={socialHandles} />;
};
