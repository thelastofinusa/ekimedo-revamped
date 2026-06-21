import AdminEnquiryNotificationEmail from "@/components/emails/adminEnquiryNotofication.email";
import AdminOrderNotificationEmail from "@/components/emails/adminOrderNotification.email";
import ContactEmail from "@/components/emails/contactForm.email";
import CustomerEnquiryNotificationEmail from "@/components/emails/customerEnquiryNotification.email";
import CustomerOrderNotificationEmail from "@/components/emails/customerOrderNotification.email";
import { OrderStatusEmail } from "@/components/emails/orderStatus.email";
import { Container } from "@/components/shared/container";
import { siteConfig } from "@/config/site.config";
import { client, clientOptions } from "@/sanity/lib/client";
import { SOCIAL_QUERY } from "@/sanity/queries/socials";
import { EmailCard } from "./email-card";
import AdminReviewNotificationEmail from "@/components/emails/adminReviewNotification.email";

export default async function EmailPreview() {
  const socialHandles = await client.fetch(SOCIAL_QUERY, {}, clientOptions);

  return (
    <div className="min-h-screen bg-neutral-50 py-32 md:py-40">
      <Container size="lg">
        <div className="mb-20">
          <h1 className="mb-12 font-serif text-4xl text-neutral-900">
            Email Previews
          </h1>

          <div className="grid gap-8 sm:grid-cols-1 lg:grid-cols-3">
            <EmailCard
              name="Contact Form"
              component={
                <ContactEmail
                  fName="Jane"
                  lName="Doe"
                  email="jane@example.com"
                  phone="+1 234 567 890"
                  inquiryType="General Question"
                  message="I'm interested in your upcoming collection. When will it be released? Also, do you offer international shipping?"
                  socialHandles={socialHandles}
                />
              }
            />
            <EmailCard
              name="Admin Order Notification"
              component={
                <AdminOrderNotificationEmail
                  orderId="kye_urblan"
                  orderNumber="ORD-2026-00124"
                  customerName="John Doe"
                  customerEmail="john@example.com"
                  total={249.99}
                  paymentMethod="Stripe"
                  paymentStatus="Paid"
                  items={[
                    {
                      name: "Premium Hoodie",
                      quantity: 2,
                      price: 79.99,
                    },
                    {
                      name: "Logo T-Shirt",
                      quantity: 1,
                      price: 49.99,
                    },
                    {
                      name: "Coffee Mug",
                      quantity: 1,
                      price: 40.02,
                    },
                  ]}
                  socialHandles={socialHandles}
                />
              }
            />
            <EmailCard
              name="Customer Order Notification"
              component={
                <CustomerOrderNotificationEmail
                  customerName="John Doe"
                  orderId="ord_123456"
                  orderNumber="ORD-2026-0001"
                  ordersUrl={`${siteConfig.url}/my-orders`}
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
              }
            />
            <EmailCard
              name="Order Status"
              component={
                <OrderStatusEmail
                  customerName="John Doe"
                  orderNumber="ORD-2026-0015"
                  status="pending"
                  orderId="ord_123456"
                  ordersUrl={`${siteConfig.url}/my-orders`}
                  socialHandles={socialHandles}
                />
              }
            />
            <EmailCard
              name="Order Status"
              component={
                <OrderStatusEmail
                  customerName="John Doe"
                  orderNumber="ORD-2026-0015"
                  status="paid"
                  orderId="ord_123456"
                  ordersUrl={`${siteConfig.url}/my-orders`}
                  socialHandles={socialHandles}
                />
              }
            />
            <EmailCard
              name="Order Status"
              component={
                <OrderStatusEmail
                  customerName="John Doe"
                  orderNumber="ORD-2026-0015"
                  status="shipped"
                  orderId="ord_123456"
                  ordersUrl={`${siteConfig.url}/my-orders`}
                  socialHandles={socialHandles}
                />
              }
            />
            <EmailCard
              name="Order Status"
              component={
                <OrderStatusEmail
                  customerName="John Doe"
                  orderNumber="ORD-2026-0015"
                  status="delivered"
                  orderId="ord_123456"
                  ordersUrl={`${siteConfig.url}/my-orders`}
                  socialHandles={socialHandles}
                />
              }
            />
            <EmailCard
              name="Order Status"
              component={
                <OrderStatusEmail
                  customerName="John Doe"
                  orderNumber="ORD-2026-0015"
                  status="cancelled"
                  orderId="ord_123456"
                  ordersUrl={`${siteConfig.url}/my-orders`}
                  socialHandles={socialHandles}
                />
              }
            />
            <EmailCard
              name="Admin Enquiry Notification"
              component={
                <AdminEnquiryNotificationEmail
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
              }
            />
            <EmailCard
              name="Customer Enquiry Notification"
              component={
                <CustomerEnquiryNotificationEmail
                  fullName="Sarah Johnson"
                  eventType="Wedding Dress"
                  socialHandles={socialHandles}
                />
              }
            />
            <EmailCard
              name="Customer Enquiry Notification"
              component={
                <AdminReviewNotificationEmail
                  fullName="Amina Bello"
                  service="Custom Bridal Dress"
                  rating={5}
                  testimonialId="4817622c-4d84-47b8-8787-108a7fd9df1f"
                  review={`Absolutely stunning work. The dress exceeded my expectations and the attention to detail was incredible.`}
                  images={[
                    "https://picsum.photos/200",
                    "https://picsum.photos/201",
                  ]}
                  socialHandles={socialHandles}
                />
              }
            />
          </div>
        </div>
      </Container>
    </div>
  );
}
