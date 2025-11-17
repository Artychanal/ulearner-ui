import type { Metadata } from "next";
import ResetPasswordScreen from "./ResetPasswordScreen";
import { SuspenseBoundary } from "@/components/SuspenseBoundary";

export const metadata: Metadata = {
  title: "Reset password • ULearner",
};

export default function ResetPasswordPage() {
  return (
    <SuspenseBoundary>
      <ResetPasswordScreen />
    </SuspenseBoundary>
  );
}
