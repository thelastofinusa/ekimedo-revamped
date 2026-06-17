import { TbBrandPaypalFilled } from "react-icons/tb";
import { BsStripe } from "react-icons/bs";

export const FILE_SIZE_MB = 5 * 1024 * 1024;

export const bookingLocation = [
  {
    value: "virtual",
    label: "Virtual (Zoom/Google Meet)",
  },
  { value: "in-person", label: "In-Person (Showroom)" },
];

export const preferredPaymentMethod = [
  {
    id: "stripe",
    label: "Stripe",
    icon: BsStripe,
    description: "Fast, secure card payment.",
    disabled: false,
  },
  {
    id: "paypal",
    label: "PayPal",
    icon: TbBrandPaypalFilled,
    description: "Quick checkout with PayPal.",
    disabled: true,
  },
];

export const sizeFilters = [
  { name: "0-2 (XS)", value: "0-2 (XS)" },
  { name: "4-6 (S)", value: "4-6 (S)" },
  { name: "8-10 (M)", value: "8-10 (M)" },
  { name: "12-14 (L)", value: "12-14 (L)" },
  { name: "16-18 (XL)", value: "16-18 (XL)" },
];

export type ConsultationDataType = Array<{
  title: string;
  slug: string;
  description: string;
  duration: number;
  price: number;
  dresses?: number;
  image: string;
  includes?: Array<string>;
  formCards: Array<{
    id: string;
    title: string;
    info?: string;
    description: string;
    fields: Array<{
      name: string;
      type: string;
      label: string;
      placeholder?: string;
      description?: string | { path: string; value: string; newTab?: boolean };
      required?: boolean;
      items?: {
        id: string;
        title: string;
        description: string;
        range: {
          from: number;
          to?: number;
        };
      }[];
      errMsg?: string;
      group?: string;
      min?: number;
      max?: number;
      size?: number;
      sizes?: unknown[];
      icons?: {
        start: {
          icon: string;
        };
        end?: { value?: string };
      };
      defaultValue?: string | number;
      options?: unknown[];
    }>;
  }>;
}>;

export const consultationsData: ConsultationDataType = [
  {
    title: "Bridal Consultation",
    slug: "bridal",
    description:
      "Work with our design team to create your perfect custom bridal gown. Includes 3 design consultations, fabric selection, and unlimited alterations.",
    duration: 60,
    price: 250,
    image: "bridal-banner.jpeg",
    includes: [
      "3 design consultations",
      "Fabric & embellishment selection",
      "Unlimited alterations",
      "2-piece initial sketches",
    ],
    formCards: [
      {
        id: "personal-information",
        title: "Personal Information",
        description:
          "We need your contact details to reach you about your consultation",
        fields: [
          {
            name: "fName",
            type: "text",
            label: "First Name",
            placeholder: "Enter your first name",
            required: true,
            errMsg: "First name is required",
            group: "first",
            icons: {
              start: {
                icon: "UserIcon",
              },
            },
          },
          {
            name: "lName",
            type: "text",
            label: "Last Name",
            placeholder: "Enter your last name",
            required: true,
            errMsg: "Last name is required",
            group: "first",
            icons: {
              start: {
                icon: "UserMultipleIcon",
              },
            },
          },
          {
            name: "email",
            type: "email",
            label: "Email address",
            placeholder: "Enter your email address",
            required: true,
            icons: {
              start: {
                icon: "Mail01Icon",
              },
            },
            errMsg: "Email address is required",
            group: "second",
          },
          {
            name: "phone",
            type: "tel",
            label: "Phone Number",
            placeholder: "+1 (5555) 000-0000",
            required: true,
            errMsg: "Phone number is required",
            group: "second",
          },
          {
            name: "eventDate",
            type: "date",
            label: "Wedding Date",
            required: true,
            errMsg: "Wedding date is required",
            group: "third",
          },
          {
            name: "guests",
            type: "number",
            label: "Number of expected guests",
            required: true,
            defaultValue: 1,
            errMsg: "This field is required",
            icons: {
              start: {
                icon: "UserMultiple02Icon",
              },
              end: { value: "Guests" },
            },
            group: "third",
          },
          {
            name: "location",
            type: "select",
            options: [...bookingLocation],
            label: "Booking Location Preference",
            defaultValue: bookingLocation[0].value,
            required: true,
            errMsg: "Booking location is required",
          },
          {
            name: "consultationDate",
            type: "datetime-local",
            label: "Pick a date for the consultation",
            required: true,
            errMsg: "Consultation date is required",
          },
        ],
      },
      {
        id: "bridal-preferences",
        title: "Bridal Preferences",
        description: "Customize your bridal consultation experience",
        fields: [
          {
            name: "interests",
            type: "checkbox",
            label: "What dresses are you interested in?",
            options: [
              {
                id: "wedding-gown",
                label: "Wedding Gown",
                description: "Main bridal dress for the ceremony",
                interests: [
                  {
                    id: "classic",
                    label: "Classic",
                    description: "Timeless and traditional designs",
                  },
                  {
                    id: "modern",
                    label: "Modern",
                    description: "Contemporary and minimalist styles",
                  },
                  {
                    id: "bohemian",
                    label: "Bohemian",
                    description: "Free-spirited and romantic aesthetic",
                  },
                  {
                    id: "vintage",
                    label: "Vintage",
                    description: "Retro and historical inspirations",
                  },
                ],
              },
              {
                id: "reception-dress",
                label: "Reception Dress",
                description: "Change of dress for reception or dancing",
              },
              {
                id: "bridal-robe",
                label: "Bridal Robe",
                description: "Getting ready robe and undergarments",
              },
            ],
            required: true,
            errMsg: "Please select at least one interest",
          },
          {
            name: "referBy",
            type: "text",
            label: "Who can I thank for this referral?",
            required: false,
            placeholder: "Enter the person's name",
            icons: {
              start: {
                icon: "UserIcon",
              },
            },
          },
        ],
      },
      {
        id: "consultation-details",
        title: "Consultation Details",
        description: "Tell us about your vision and preferences",
        fields: [
          {
            name: "budget",
            type: "number",
            label: "What is your dress budget?",
            placeholder: "Enter your budget (e.g. $2,500)",
            required: true,
            errMsg: "Your budget is required is required",
            description: {
              path: "/pricing",
              value: "Check out our pricing details",
            },
            icons: {
              start: {
                icon: "Dollar01Icon",
              },
            },
          },
          {
            name: "inspiration",
            type: "file",
            label: "Style Inspiration Photos",
            required: true,
            min: 3,
            max: 5,
            size: FILE_SIZE_MB,
            errMsg: "At least 3 inspirations are required",
            placeholder: "Click to upload or drag and drop",
          },
          {
            name: "timeline",
            type: "checkbox",
            label: "Have you read through our FAQ for production?",
            options: [
              {
                id: "timeline-acknowledged",
                label: "Timeline understood",
                description: "I understand the standard production timeline.",
                interests: [
                  {
                    id: "rush-required",
                    label: "Rush order",
                    description: "I need expedited production.",
                  },
                ],
              },
            ],
            description: {
              path: "/contact#productionProcess",
              value: "See out production process",
            },
            required: true,
            errMsg: "We need to be sure you understand",
          },
          {
            name: "cancellationPolicy",
            type: "checkbox",
            label: "Do you agree with the Cancellation Policy",
            options: [
              {
                id: "cancellation-accepted",
                label: "Policy accepted",
                description: "I agree to the cancellation policy.",
              },
            ],
            description: {
              path: "/policies",
              value: "See our cancellation policy",
            },
            required: true,
            errMsg: "We need to be sure you understand",
          },
        ],
      },
    ],
  },
  {
    title: "Prom Consultation",
    slug: "prom",
    description:
      "Design a standout prom dress tailored to your style, body type, and event theme. Perfect for making a bold statement.",
    duration: 30,
    price: 150,
    image: "prom-banner.jpeg",
    includes: [
      "1-on-1 styling consultation",
      "Custom design discussion",
      "Fabric & color selection",
      "Fit guidance and sizing",
    ],
    formCards: [
      {
        id: "personal-information",
        title: "Personal Information",
        description:
          "We need your contact details to reach you about your consultation",
        info: "Accompanied by an adult 23 years and above",
        fields: [
          {
            name: "fName",
            type: "text",
            label: "First Name",
            placeholder: "Enter your first name",
            required: true,
            errMsg: "First name is required",
            group: "first",
            icons: {
              start: {
                icon: "UserIcon",
              },
            },
          },
          {
            name: "lName",
            type: "text",
            label: "Last Name",
            placeholder: "Enter your last name",
            required: true,
            errMsg: "Last name is required",
            group: "first",
            icons: {
              start: {
                icon: "UserMultipleIcon",
              },
            },
          },
          {
            name: "email",
            type: "email",
            label: "Email address",
            placeholder: "Enter your email address",
            required: true,
            icons: {
              start: {
                icon: "Mail01Icon",
              },
            },
            errMsg: "Email address is required",
            group: "second",
          },
          {
            name: "phone",
            type: "tel",
            label: "Phone Number",
            placeholder: "+1 (5555) 000-0000",
            required: true,
            errMsg: "Phone number is required",
            group: "second",
          },
          {
            name: "eventDate",
            type: "date",
            label: "Prom Date",
            required: true,
            errMsg: "Prom date is required",
            group: "third",
          },
          {
            name: "guests",
            type: "number",
            label: "Number of expected guests",
            required: true,
            defaultValue: 1,
            errMsg: "This field is required",
            icons: {
              start: {
                icon: "UserMultiple02Icon",
              },
              end: { value: "Guests" },
            },
            group: "third",
          },
          {
            name: "location",
            type: "select",
            options: [...bookingLocation],
            label: "Booking Location Preference",
            defaultValue: bookingLocation[0].value,
            required: true,
            errMsg: "Booking location is required",
          },
          {
            name: "consultationDate",
            type: "datetime-local",
            label: "Pick a date for the consultation",
            required: true,
            errMsg: "Consultation date is required",
          },
        ],
      },
      {
        id: "dress-preferences",
        title: "Dress Preferences",
        description: "Customize your prom consultation experience",
        fields: [
          {
            name: "dressSize",
            type: "size",
            label: "Dress Size",
            sizes: [...sizeFilters],
            required: true,
            errMsg: "Please select a dress size",
          },
          {
            name: "dressColor",
            type: "text",
            label: "Dress Color",
            placeholder: "e.g. Ivory, Champagne, Blush",
            required: true,
            icons: {
              start: { icon: "PaintBoardIcon" },
            },
            errMsg: "Please select a dress color",
          },
          {
            name: "specialRequirements",
            type: "textarea",
            label: "Any Special Requirements?",
            placeholder: "Enter any special requirements or preference",
            required: false,
          },
        ],
      },
      {
        id: "consultation-details",
        title: "Consultation Details",
        description: "Tell us about your vision and preferences",
        fields: [
          {
            name: "priceRange",
            type: "radio",
            label: "Select your budget range",
            description: "Each option shows example styles within that budget.",
            required: true,
            items: [
              {
                id: "signature",
                title: "Signature",
                description:
                  "Intricate lace, custom embroidery, and premium fabric blends.",
                range: {
                  from: 3000,
                  to: 6000,
                },
                // images: [
                //   "/collections/bridal.avif",
                //   "/collections/prom.avif",
                //   "/collections/special-events.avif",
                // ],
              },
              {
                id: "bespoke",
                title: "Bespoke",
                description:
                  "Ultimate luxury. Custom patterns and rare European textiles.",
                range: {
                  from: 6000,
                },
              },
            ],
            errMsg: "Please select a budget range",
          },
          {
            name: "timeline",
            type: "checkbox",
            label: "Have you read through our FAQ for production?",
            options: [
              {
                id: "timeline-acknowledged",
                label: "Timeline understood",
                description: "I understand the standard production timeline.",
                interests: [
                  {
                    id: "rush-required",
                    label: "Rush order",
                    description: "I need expedited production.",
                  },
                ],
              },
            ],
            description: {
              path: "/contact#productionProcess",
              value: "See out production process",
            },
            required: true,
            errMsg: "We need to be sure you understand",
          },
          {
            name: "cancellationPolicy",
            type: "checkbox",
            label: "Do you agree with the Cancellation Policy",
            options: [
              {
                id: "cancellation-accepted",
                label: "Policy accepted",
                description: "I agree to the cancellation policy.",
              },
            ],
            description: {
              path: "/policies",
              value: "See our cancellation policy",
            },
            required: true,
            errMsg: "We need to be sure you understand",
          },
        ],
      },
    ],
  },
  {
    title: "Special Events Consultation",
    slug: "special-events",
    description:
      "Perfect for galas, birthdays, dinners, and red-carpet moments. Create a refined or statement look tailored to your occasion.",
    duration: 30,
    price: 100,
    image: "special-events-banner.jpeg",
    includes: [
      "Personal styling consultation",
      "Occasion-based design guidance",
      "Fabric & silhouette selection",
      "Styling and fit recommendations",
    ],
    formCards: [
      {
        id: "personal-information",
        title: "Personal Information",
        description:
          "We need your contact details to reach you about your consultation",
        fields: [
          {
            name: "fName",
            type: "text",
            label: "First Name",
            placeholder: "Enter your first name",
            required: true,
            errMsg: "First name is required",
            group: "first",
            icons: {
              start: {
                icon: "UserIcon",
              },
            },
          },
          {
            name: "lName",
            type: "text",
            label: "Last Name",
            placeholder: "Enter your last name",
            required: true,
            errMsg: "Last name is required",
            group: "first",
            icons: {
              start: {
                icon: "UserMultipleIcon",
              },
            },
          },
          {
            name: "email",
            type: "email",
            label: "Email address",
            placeholder: "Enter your email address",
            required: true,
            icons: {
              start: {
                icon: "Mail01Icon",
              },
            },
            errMsg: "Email address is required",
            group: "second",
          },
          {
            name: "phone",
            type: "tel",
            label: "Phone Number",
            placeholder: "+1 (5555) 000-0000",
            required: true,
            errMsg: "Phone number is required",
            group: "second",
          },
          {
            name: "eventDate",
            type: "date",
            label: "Event Date",
            required: true,
            errMsg: "Event date is required",
            group: "third",
          },
          {
            name: "guests",
            type: "number",
            label: "Number of expected guests",
            required: true,
            defaultValue: 1,
            errMsg: "This field is required",
            icons: {
              start: {
                icon: "UserMultiple02Icon",
              },
              end: { value: "Guests" },
            },
            group: "third",
          },
          {
            name: "location",
            type: "select",
            options: [...bookingLocation],
            label: "Booking Location Preference",
            defaultValue: bookingLocation[0].value,
            required: true,
            errMsg: "Booking location is required",
          },
          {
            name: "consultationDate",
            type: "datetime-local",
            label: "Pick a date for the consultation",
            required: true,
            errMsg: "Consultation date is required",
          },
        ],
      },
      {
        id: "preparation-and-inspiration",
        title: "Preparation & Inspiration",
        description: "Confirm your readiness and share your style references.",
        fields: [
          {
            name: "inspiration",
            type: "file",
            label: "Style Inspiration Photos",
            required: true,
            min: 3,
            max: 5,
            size: FILE_SIZE_MB,
            errMsg: "At least 3 inspirations are required",
            placeholder: "Click to upload or drag and drop",
          },
          {
            name: "timeline",
            type: "checkbox",
            label: "Have you read through our FAQ for production?",
            options: [
              {
                id: "timeline-acknowledged",
                label: "Timeline understood",
                description: "I understand the standard production timeline.",
                interests: [
                  {
                    id: "rush-required",
                    label: "Rush order",
                    description: "I need expedited production.",
                  },
                ],
              },
            ],
            description: {
              path: "/contact#productionProcess",
              value: "See out production process",
            },
            required: true,
            errMsg: "We need to be sure you understand",
          },
          {
            name: "cancellationPolicy",
            type: "checkbox",
            label: "Do you agree with the Cancellation Policy",
            options: [
              {
                id: "cancellation-accepted",
                label: "Policy accepted",
                description: "I agree to the cancellation policy.",
              },
            ],
            description: {
              path: "/policies",
              value: "See our cancellation policy",
            },
            required: true,
            errMsg: "We need to be sure you understand",
          },
        ],
      },
    ],
  },
  {
    title: "Pre-made Dress Try On",
    slug: "try-on",
    description:
      "Visit our atelier to try on our curated selection of ready-to-wear gowns. Our stylists will help you find the perfect fit for your special occasion.",
    duration: 60,
    dresses: 3,
    price: 150,
    image: "try-on-banner.jpeg",
    includes: [
      "Personal styling consultation with an in-house stylist",
      "Access to a curated selection of ready-to-wear gowns",
      "Guided fitting to find the best size and silhouette",
      "Basic alterations advice (length, fit, adjustments)",
    ],
    formCards: [
      {
        id: "personal-information",
        title: "Personal Information",
        description:
          "We need your contact details to reach you about your consultation",
        info: "Accompanied by an adult 23 years and above",
        fields: [
          {
            name: "fName",
            type: "text",
            label: "First Name",
            placeholder: "Enter your first name",
            required: true,
            errMsg: "First name is required",
            group: "first",
            icons: {
              start: {
                icon: "UserIcon",
              },
            },
          },
          {
            name: "lName",
            type: "text",
            label: "Last Name",
            placeholder: "Enter your last name",
            required: true,
            errMsg: "Last name is required",
            group: "first",
            icons: {
              start: {
                icon: "UserMultipleIcon",
              },
            },
          },
          {
            name: "email",
            type: "email",
            label: "Email address",
            placeholder: "Enter your email address",
            icons: {
              start: {
                icon: "Mail01Icon",
              },
            },
            required: true,
            errMsg: "Email address is required",
            group: "second",
          },
          {
            name: "phone",
            type: "tel",
            label: "Phone Number",
            placeholder: "+1 (5555) 000-0000",
            required: true,
            errMsg: "Phone number is required",
            group: "second",
          },
          {
            name: "guests",
            type: "number",
            label: "Number of expected guests",
            required: true,
            defaultValue: 1,
            icons: {
              start: {
                icon: "UserMultiple02Icon",
              },
              end: { value: "Guests" },
            },
            errMsg: "This field is required",
            group: "third",
          },
          {
            name: "consultationDate",
            type: "datetime-local",
            label: "Pick a date for the consultation",
            required: true,
            errMsg: "Consultation date is required",
            group: "third",
          },
          {
            name: "location",
            type: "select",
            options: [{ value: "in-person", label: "In-Person (Showroom)" }],
            label: "Booking Location Preference",
            defaultValue: "in-person",
            required: true,
            errMsg: "Booking location is required",
          },
        ],
      },
    ],
  },
];

export const sizeChart = [
  {
    name: "Extra Small",
    size: "XS",
    numeric: "0—2",
    bust: "32—33 / 81—84",
    waist: "24—25 / 61—64",
    hip: "34—35 / 86—89",
  },
  {
    name: "Small",
    size: "S",
    numeric: "4—6",
    bust: "34—35 / 86—89",
    waist: "26—27 / 66—69",
    hip: "36—37 / 91—94",
  },
  {
    name: "Medium",
    size: "M",
    numeric: "8—10",
    bust: "36—37 / 91—94",
    waist: "28—29 / 71—74",
    hip: "38—39 / 96—99",
  },
  {
    name: "Large",
    size: "L",
    numeric: "12—14",
    bust: "38.5—40 / 98—101",
    waist: "30.5—32 / 77—81",
    hip: "40.5—42 / 103—107",
  },
  {
    name: "Extra Large",
    size: "XL",
    numeric: "16—18",
    bust: "41.5—43 / 105—109",
    waist: "33.5—35 / 85—89",
    hip: "44.5—46 / 113—117",
  },
];
