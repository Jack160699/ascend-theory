import { GatewayHome } from "@/components/pages/GatewayHome";
import { AssessmentModalProvider } from "@/contexts/assessment-modal";

export default function Home() {
  return (
    <AssessmentModalProvider>
      <GatewayHome />
    </AssessmentModalProvider>
  );
}
