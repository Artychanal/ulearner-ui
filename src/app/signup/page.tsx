import type { Metadata } from "next";
import SignupScreen from "./SignupScreen";

export const metadata: Metadata = {
  title: "Create account • ULearner",
};

export default function SignupPage() {
  return <SignupScreen />;
}
