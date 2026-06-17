import {
  ConsultationCard,
  ConsultationCardLoading,
} from "@/components/shared/consultation-card";
import { Container } from "@/components/shared/container";
import { CONSULTATION_QUERY_RESULT } from "@/sanity.types";

export const Consultations: React.FC<{
  data: CONSULTATION_QUERY_RESULT;
  messageType?: "success" | "canceled" | null;
}> = ({ data, messageType }) => {
  return (
    <div className="py-24 lg:py-32">
      <Container>
        <div className="grid grid-cols-1 gap-12 md:gap-16 lg:gap-24">
          {data.length > 0
            ? data.map((service, index) => (
                <ConsultationCard key={index} data={service} />
              ))
            : Array.from({ length: 4 }).map((_, index) => (
                <ConsultationCardLoading key={index} />
              ))}
        </div>
      </Container>
    </div>
  );
};
