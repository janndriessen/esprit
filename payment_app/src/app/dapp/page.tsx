"use client";

import UserInfo from "@/components/user/UserInfo";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen items-center py-8 px-4">
      <UserInfo />
    </div>
  );
}
