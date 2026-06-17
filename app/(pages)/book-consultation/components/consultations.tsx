import { ConsultationCard } from "@/components/shared/consultation-card";
import { containerVariants } from "@/components/shared/container";
import { ConsultationDataType } from "@/constants/consultation";

export const Consultations: React.FC<{
  data: ConsultationDataType;
  messageType?: "success" | "canceled" | null;
}> = ({ data, messageType }) => {
  return (
    <div className="py-24 lg:py-32">
      <div className={containerVariants()}>
        <div className="grid grid-cols-1 gap-12 md:gap-16 lg:gap-24">
          {data
            .filter((item) => item.slug !== "try-on")
            .map((service, index) => (
              <ConsultationCard key={index} data={service} />
            ))}
        </div>
      </div>
    </div>
  );
};
