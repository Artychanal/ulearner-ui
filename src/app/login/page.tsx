import type { Metadata } from "next";
import LoginScreen from "./LoginScreen";

export const metadata: Metadata = {
  title: "Login • ULearner",
};

export default function LoginPage() {
  return <LoginScreen />;
}
