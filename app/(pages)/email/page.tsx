import { Container } from "@/components/shared/container";
import { siteConfig } from "@/config/site.config";
import { EmailCard } from "./email-card";

import { AdminContactEmail } from "@/components/emails/admin/adminContact.email";
import { AdminInquiryEmail } from "@/components/emails/admin/adminInquiry.email";
import { AdminOrderEmail } from "@/components/emails/admin/adminOrder.email";
import { AdminReviewEmail } from "@/components/emails/admin/adminReview.email";
import { AdminBookingEmail } from "@/components/emails/admin/adminBooking.email";

import { CustomerOrderEmail } from "@/components/emails/customer/customerOrder.email";
import { CustomerOrderStatusEmail } from "@/components/emails/customer/customerOrderStatus.email";
import { CustomerInquiryEmail } from "@/components/emails/customer/customerInquiry.email";

import { client, clientOptions } from "@/sanity/lib/client";
import { QUERY_SOCIAL_HANDLES } from "@/sanity/queries/social.query";
import { QUERY_SOCIAL_HANDLES_RESULT } from "@/sanity.types";
import { CustomerBookingEmail } from "@/components/emails/customer/customerBooking.email";
import { notFound } from "next/navigation";

export default async function EmailPreview() {
  if (process.env.NODE_ENV === "production") return notFound();

  const socialHandles = await client.fetch(
    QUERY_SOCIAL_HANDLES,
    {},
    clientOptions,
  );

  const previews = [
    {
      name: "Contact Form",
      render: (socialHandles: QUERY_SOCIAL_HANDLES_RESULT) => (
        <AdminContactEmail
          fName="Jane"
          lName="Doe"
          email="jane@example.com"
          phone="+1 234 567 890"
          inquiryType="General Question"
          message="I'm interested in your upcoming collection. When will it be released? Also, do you offer international shipping?"
          socialHandles={socialHandles}
        />
      ),
    },

    {
      name: "Admin Order Notification",
      render: (socialHandles: QUERY_SOCIAL_HANDLES_RESULT) => (
        <AdminOrderEmail
          orderId="ORD-1782205773971-347"
          orderNumber="ORD-1782205773971-347"
          customerName="John Doe"
          customerEmail="john@example.com"
          total={249.99}
          paymentMethod="Stripe"
          paymentStatus="Paid"
          items={[
            {
              name: "Premium Hoodie",
              quantity: 2,
              price: 59.99,
              imageUrl: "https://picsum.photos/200",
            },
            {
              name: "Coffee Mug",
              quantity: 1,
              price: 14.99,
              imageUrl: "https://picsum.photos/201",
            },
            {
              name: "Logo T-Shirt",
              quantity: 3,
              price: 24.99,
              imageUrl: "https://picsum.photos/202",
            },
          ]}
          socialHandles={socialHandles}
        />
      ),
    },

    {
      name: "Customer Order Notification",
      render: (socialHandles: QUERY_SOCIAL_HANDLES_RESULT) => (
        <CustomerOrderEmail
          customerName="John Doe"
          orderId="ORD-1782205773971-347"
          orderNumber="ORD-1782205773971-347"
          ordersUrl={`${siteConfig.url}/orders`}
          totalAmount={209.94}
          items={[
            {
              name: "Premium Hoodie",
              quantity: 2,
              price: 59.99,
              imageUrl: "https://picsum.photos/200",
            },
            {
              name: "Coffee Mug",
              quantity: 1,
              price: 14.99,
              imageUrl: "https://picsum.photos/201",
            },
            {
              name: "Logo T-Shirt",
              quantity: 3,
              price: 24.99,
              imageUrl: "https://picsum.photos/202",
            },
          ]}
          socialHandles={socialHandles}
        />
      ),
    },

    {
      name: "Order Status - Pending",
      render: (socialHandles: QUERY_SOCIAL_HANDLES_RESULT) => (
        <CustomerOrderStatusEmail
          customerName="John Doe"
          orderNumber="ORD-1782205773971-347"
          status="pending"
          orderId="ORD-1782205773971-347"
          ordersUrl={`${siteConfig.url}/orders`}
          socialHandles={socialHandles}
        />
      ),
    },

    {
      name: "Order Status - Paid",
      render: (socialHandles: QUERY_SOCIAL_HANDLES_RESULT) => (
        <CustomerOrderStatusEmail
          customerName="John Doe"
          orderNumber="ORD-1782205773971-347"
          status="paid"
          orderId="ORD-1782205773971-347"
          ordersUrl={`${siteConfig.url}/orders`}
          socialHandles={socialHandles}
        />
      ),
    },

    {
      name: "Order Status - Shipped",
      render: (socialHandles: QUERY_SOCIAL_HANDLES_RESULT) => (
        <CustomerOrderStatusEmail
          customerName="John Doe"
          orderNumber="ORD-1782205773971-347"
          status="shipped"
          orderId="ORD-1782205773971-347"
          ordersUrl={`${siteConfig.url}/orders`}
          socialHandles={socialHandles}
        />
      ),
    },

    {
      name: "Order Status - Delivered",
      render: (socialHandles: QUERY_SOCIAL_HANDLES_RESULT) => (
        <CustomerOrderStatusEmail
          customerName="John Doe"
          orderNumber="ORD-1782205773971-347"
          status="delivered"
          orderId="ORD-1782205773971-347"
          ordersUrl={`${siteConfig.url}/orders`}
          socialHandles={socialHandles}
        />
      ),
    },

    {
      name: "Order Status - Cancelled",
      render: (socialHandles: QUERY_SOCIAL_HANDLES_RESULT) => (
        <CustomerOrderStatusEmail
          customerName="John Doe"
          orderNumber="ORD-1782205773971-347"
          status="cancelled"
          orderId="ORD-1782205773971-347"
          ordersUrl={`${siteConfig.url}/orders`}
          socialHandles={socialHandles}
        />
      ),
    },

    {
      name: "Admin Enquiry Notification",
      render: (socialHandles: QUERY_SOCIAL_HANDLES_RESULT) => (
        <AdminInquiryEmail
          fullName="Sarah Johnson"
          email="sarah@example.com"
          phone="+1 (202) 555-0182"
          eventType="Wedding"
          eventDate="October 12, 2026"
          budget={5000}
          inquiryId="105hjsbad"
          dreamDress="I'm looking for a modern fitted wedding gown with lace sleeves, an open back, and a detachable train. I love minimalist designs with elegant details."
          inspirationPhotos={[
            "https://picsum.photos/200",
            "https://picsum.photos/201",
            "https://picsum.photos/202",
            "https://picsum.photos/203",
            "https://picsum.photos/204",
          ]}
          socialHandles={socialHandles}
        />
      ),
    },

    {
      name: "Customer Enquiry Notification",
      render: (socialHandles: QUERY_SOCIAL_HANDLES_RESULT) => (
        <CustomerInquiryEmail
          fullName="Sarah Johnson"
          eventType="Wedding Dress"
          socialHandles={socialHandles}
        />
      ),
    },

    {
      name: "Admin Review Notification",
      render: (socialHandles: QUERY_SOCIAL_HANDLES_RESULT) => (
        <AdminReviewEmail
          fullName="Amina Bello"
          service="Custom Bridal Dress"
          rating={5}
          testimonialId="4817622c-4d84-47b8-8787-108a7fd9df1f"
          review="Absolutely stunning work. The dress exceeded my expectations and the attention to detail was incredible."
          images={["https://picsum.photos/200", "https://picsum.photos/201"]}
          socialHandles={socialHandles}
        />
      ),
    },

    {
      name: "Admin Booking Notification",
      render: (socialHandles: QUERY_SOCIAL_HANDLES_RESULT) => (
        <AdminBookingEmail
          bookingId="booking-123456"
          consultationTitle="Bridal Consultation"
          dateTime="2026-10-12T14:00:00"
          customerName="Sarah Johnson"
          customerEmail="sarah@example.com"
          customerPhone="+1 (202) 555-0182"
          paymentMethod="Stripe"
          socialHandles={socialHandles}
          formFields={[
            {
              fieldName: "eventDate",
              fieldLabel: "Wedding Date",
              fieldType: "date",
              value: "October 12, 2026",
            },
            {
              fieldName: "guests",
              fieldLabel: "Expected Guests",
              fieldType: "number",
              value: "150",
            },
            {
              fieldName: "location",
              fieldLabel: "Consultation Location",
              fieldType: "select",
              value: "Virtual",
            },
            {
              fieldName: "budget",
              fieldLabel: "Dress Budget",
              fieldType: "number",
              value: "$6,000",
            },
            {
              fieldName: "interests",
              fieldLabel: "Dress Interests",
              fieldType: "checkbox",
              value:
                "Wedding Gown, Classic, Modern, Reception Dress, Bridal Robe",
            },
            {
              fieldName: "referBy",
              fieldLabel: "Referral",
              fieldType: "email",
              value: "andrewgarfield@gmail.com",
            },
            {
              fieldName: "timeline",
              fieldLabel: "Timeline",
              fieldType: "checkbox",
              value: "Timeline Acknowledged, Rush Order Required",
            },
            {
              fieldName: "cancellationPolicy",
              fieldLabel: "Cancellation Policy",
              fieldType: "checkbox",
              value: "Accepted",
            },
            {
              fieldName: "inspiration",
              fieldLabel: "Inspiration Photos",
              fieldType: "file",
              value: "",
              files: [
                {
                  url: "https://picsum.photos/300?random=1",
                },
                {
                  url: "https://picsum.photos/300?random=2",
                },
                {
                  url: "https://picsum.photos/300?random=3",
                },
              ],
            },
          ]}
        />
      ),
    },

    {
      name: "Customer Booking Notification",
      render: (socialHandles: QUERY_SOCIAL_HANDLES_RESULT) => (
        <CustomerBookingEmail
          customerName="Sarah Johnson"
          consultationTitle="Bridal Consultation"
          dateTime="2026-10-12T14:00:00"
          bookingId="booking-123456"
          socialHandles={socialHandles}
          formFields={[
            {
              fieldName: "eventDate",
              fieldLabel: "Wedding Date",
              fieldType: "date",
              value: "October 12, 2026",
            },
            {
              fieldName: "guests",
              fieldLabel: "Expected Guests",
              fieldType: "number",
              value: "150",
            },
            {
              fieldName: "location",
              fieldLabel: "Consultation Location",
              fieldType: "select",
              value: "Virtual",
            },
            {
              fieldName: "budget",
              fieldLabel: "Dress Budget",
              fieldType: "number",
              value: "$6,000",
            },
            {
              fieldName: "interests",
              fieldLabel: "Dress Interests",
              fieldType: "checkbox",
              value:
                "Wedding Gown, Classic, Modern, Reception Dress, Bridal Robe",
            },
            {
              fieldName: "referBy",
              fieldLabel: "Referral",
              fieldType: "email",
              value: "andrewgarfield@gmail.com",
            },
            {
              fieldName: "timeline",
              fieldLabel: "Timeline",
              fieldType: "checkbox",
              value: "Timeline Acknowledged, Rush Order Required",
            },
            {
              fieldName: "cancellationPolicy",
              fieldLabel: "Cancellation Policy",
              fieldType: "checkbox",
              value: "Accepted",
            },
            {
              fieldName: "inspiration",
              fieldLabel: "Inspiration Photos",
              fieldType: "file",
              value: "",
              files: [
                {
                  url: "https://picsum.photos/300?random=1",
                },
                {
                  url: "https://picsum.photos/300?random=2",
                },
                {
                  url: "https://picsum.photos/300?random=3",
                },
              ],
            },
          ]}
        />
      ),
    },

    {
      name: "Customer Booking Notification",
      render: (socialHandles: QUERY_SOCIAL_HANDLES_RESULT) => (
        <CustomerBookingEmail
          customerName="Sarah Johnson"
          consultationTitle="Bridal Consultation"
          dateTime="2026-10-12T14:00:00"
          bookingId="booking-123456"
          socialHandles={socialHandles}
          formFields={[
            {
              fieldName: "eventDate",
              fieldLabel: "Wedding Date",
              fieldType: "date",
              value: "October 12, 2026",
            },
            {
              fieldName: "guests",
              fieldLabel: "Expected Guests",
              fieldType: "number",
              value: "150",
            },
            {
              fieldName: "location",
              fieldLabel: "Consultation Location",
              fieldType: "select",
              value: "In-Person (Showroom)",
            },
            {
              fieldName: "budget",
              fieldLabel: "Dress Budget",
              fieldType: "number",
              value: "$6,000",
            },
            {
              fieldName: "interests",
              fieldLabel: "Dress Interests",
              fieldType: "checkbox",
              value:
                "Wedding Gown, Classic, Modern, Reception Dress, Bridal Robe",
            },
            {
              fieldName: "referBy",
              fieldLabel: "Referral",
              fieldType: "email",
              value: "andrewgarfield@gmail.com",
            },
            {
              fieldName: "timeline",
              fieldLabel: "Timeline",
              fieldType: "checkbox",
              value: "Timeline Acknowledged, Rush Order Required",
            },
            {
              fieldName: "cancellationPolicy",
              fieldLabel: "Cancellation Policy",
              fieldType: "checkbox",
              value: "Accepted",
            },
            {
              fieldName: "inspiration",
              fieldLabel: "Inspiration Photos",
              fieldType: "file",
              value: "",
              files: [
                {
                  url: "https://picsum.photos/300?random=1",
                },
                {
                  url: "https://picsum.photos/300?random=2",
                },
                {
                  url: "https://picsum.photos/300?random=3",
                },
              ],
            },
          ]}
        />
      ),
    },

    {
      name: "Customer Booking Notification - Prom Consultation",
      render: (socialHandles: QUERY_SOCIAL_HANDLES_RESULT) => (
        <CustomerBookingEmail
          customerName="Sophia Williams"
          consultationTitle="Prom Consultation"
          dateTime="2026-05-15T16:00:00"
          bookingId="booking-prom-123456"
          socialHandles={socialHandles}
          formFields={[
            {
              fieldName: "eventDate",
              fieldLabel: "Prom Date",
              fieldType: "date",
              value: "May 30, 2026",
            },
            {
              fieldName: "location",
              fieldLabel: "Consultation Location",
              fieldType: "select",
              value: "In-Person (Showroom)",
            },
            {
              fieldName: "budget",
              fieldLabel: "Dress Budget",
              fieldType: "number",
              value: "$1,500",
            },
            {
              fieldName: "dressColor",
              fieldLabel: "Preferred Color",
              fieldType: "text",
              value: "Emerald Green",
            },
            {
              fieldName: "inspiration",
              fieldLabel: "Inspiration Photos",
              fieldType: "file",
              value: "",
              files: [
                {
                  url: "https://picsum.photos/300?random=11",
                },
                {
                  url: "https://picsum.photos/300?random=12",
                },
              ],
            },
          ]}
        />
      ),
    },

    {
      name: "Customer Booking Notification - Pre-Made Dress Try-On",
      render: (socialHandles: QUERY_SOCIAL_HANDLES_RESULT) => (
        <CustomerBookingEmail
          customerName="Emily Carter"
          consultationTitle="Pre-Made Dresses Try On"
          dateTime="2026-08-20T13:00:00"
          bookingId="booking-tryon-123456"
          socialHandles={socialHandles}
          formFields={[
            {
              fieldName: "location",
              fieldLabel: "Consultation Location",
              fieldType: "select",
              value: "In-Person (Showroom)",
            },
            {
              fieldName: "dressSize",
              fieldLabel: "Dress Size",
              fieldType: "text",
              value: "US 8",
            },
            {
              fieldName: "preferredStyles",
              fieldLabel: "Preferred Styles",
              fieldType: "checkbox",
              value: "Mermaid, A-Line, Satin",
            },
            {
              fieldName: "inspiration",
              fieldLabel: "Inspiration Photos",
              fieldType: "file",
              value: "",
              files: [
                {
                  url: "https://picsum.photos/300?random=21",
                },
                {
                  url: "https://picsum.photos/300?random=22",
                },
                {
                  url: "https://picsum.photos/300?random=23",
                },
              ],
            },
          ]}
        />
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-neutral-50 py-32 md:py-40">
      <Container size="lg">
        <div className="mb-20">
          <h1 className="mb-12 font-serif text-4xl text-neutral-900">
            Email Previews
          </h1>

          <div className="grid gap-8 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
            {previews.map((preview) => (
              <EmailCard
                key={preview.name}
                name={preview.name}
                component={preview.render(socialHandles)}
              />
            ))}
          </div>
        </div>
      </Container>
    </div>
  );
}
