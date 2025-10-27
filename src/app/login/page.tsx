import type { Metadata } from "next";
import LoginScreen from "./LoginScreen";
import { SuspenseBoundary } from "@/components/SuspenseBoundary";

export const metadata: Metadata = {
  title: "Login • ULearner",
};

export default function LoginPage() {
  return (
    <SuspenseBoundary>
      <LoginScreen />
    </SuspenseBoundary>
  );
}
