import { Container } from "@/components/shared/container";
import { resolveIcon } from "@/lib/icons";
import { QUERY_BOOKING_PROCESS_RESULT } from "@/sanity.types";
import React from "react";

export const BookingProcess: React.FC<{
  process: QUERY_BOOKING_PROCESS_RESULT;
}> = (props) => {
  if (!props.process.length) return null;

  return (
    <div
      className="py-24 lg:py-32 from-secondary/50 via-secondary/20 bg-linear-to-b to-transparent"
      id="productionProcess"
    >
      <Container size="sm">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-12">
          {/* Sticky Header Section */}
          <div className="lg:col-span-4">
            <div className="md:sticky md:top-28">
              <h2 className="font-serif text-4xl capitalize">
                Booking Process
              </h2>
              <p className="mt-6 text-muted-foreground">
                From your initial vision to the final fitting, every step is
                crafted to ensure perfection.
              </p>
            </div>
          </div>

          {/* Process Steps */}
          <div className="lg:col-span-8">
            <div className="space-y-16">
              {props.process.map((process, index) => {
                const Icon = resolveIcon(process.icon);

                return (
                  <div
                    key={process._id}
                    className="group flex gap-8 border-t pt-16 first:border-t-0 first:pt-0"
                  >
                    {/* Numbering */}
                    <span className="font-serif text-3xl transition-colors">
                      {String(index + 1).padStart(2, "0")}
                    </span>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="p-2 border rounded-full">
                          {Icon && <Icon className="size-4" />}
                        </div>
                        <h3 className="font-serif text-xl">{process.title}</h3>
                      </div>
                      <p className="text-muted-foreground leading-relaxed max-w-md">
                        {process.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
};
