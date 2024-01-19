"use client";

import { Card } from "@/components/ui/card";
import UserInfo from "@/components/user/UserInfo";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen items-center p-8">
      <UserInfo />
    </div>
  );
}
