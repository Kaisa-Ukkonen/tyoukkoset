"use client";

import { useSearchParams } from "next/navigation";

export default function ContactOpenId() {
  const params = useSearchParams();
  const openIdParam = params.get("open");
  const openId = openIdParam ? Number(openIdParam) : null;
  return openId;
}
