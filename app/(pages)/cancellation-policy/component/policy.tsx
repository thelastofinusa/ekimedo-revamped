"use client";
import { motion } from "motion/react";
import * as LucideIcons from "lucide-react";

import { Container } from "@/components/shared/container";
import { CANCELLATION_POLICY_QUERY_RESULT } from "@/sanity.types";

export const Policy: React.FC<{
  policies: CANCELLATION_POLICY_QUERY_RESULT;
}> = ({ policies }) => {
  return (
    <div className="py-24 lg:py-32">
      <Container size="xs" className="flex flex-col gap-6">
        <div className="bg-card border-border grid h-auto gap-6 overflow-hidden rounded-md border p-6 text-sm shadow-xs md:gap-8 md:p-8 xl:gap-12 xl:p-12">
          {policies.map((policy, index) => {
            const Icon = policy.icon
              ? (LucideIcons[
                  policy.icon as keyof typeof LucideIcons
                ] as React.ComponentType<{ className?: string }>)
              : LucideIcons.CircleAlert;

            return (
              <motion.div
                key={policy._id}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group flex gap-6"
              >
                <div className="bg-primary-foreground text-primary flex h-12 w-12 shrink-0 items-center justify-center rounded-full transition-colors duration-300">
                  <Icon />
                </div>
                <div className="flex flex-col gap-2">
                  <h3 className="text-xl font-medium tracking-tight">
                    {policy.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {policy.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </Container>
    </div>
  );
};
