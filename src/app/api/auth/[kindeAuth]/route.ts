import { handleAuth } from "@kinde-oss/kinde-auth-nextjs/server";
import { NextResponse } from "next/server";
export const GET = handleAuth();

export const OPTIONS = async () => {
  return new NextResponse("", {
    status: 200,
  });
};
