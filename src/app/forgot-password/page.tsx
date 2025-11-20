import type { Metadata } from "next";
import ForgotPasswordScreen from "./ForgotPasswordScreen";
import { SuspenseBoundary } from "@/components/SuspenseBoundary";

export const metadata: Metadata = {
  title: "Forgot password • ULearner",
};

export default function ForgotPasswordPage() {
  return (
    <SuspenseBoundary>
      <ForgotPasswordScreen />
    </SuspenseBoundary>
  );
}
