
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const postcode = request.nextUrl.searchParams.get("postcode")?.trim();

  if (!postcode) {
    return NextResponse.json(
      { error: "Please enter a postcode." },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(
      `https://api.postcodes.io/postcodes/${encodeURIComponent(postcode)}`,
      { cache: "no-store" }
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: "Postcode not found. Please check and try again." },
        { status: 404 }
      );
    }

    const data = await response.json();
    const result = data.result;

    if (
      typeof result?.latitude !== "number" ||
      typeof result?.longitude !== "number"
    ) {
      return NextResponse.json(
        { error: "Coordinates unavailable for this postcode." },
        { status: 422 }
      );
    }

    return NextResponse.json({
      postcode: result.postcode,
      latitude: result.latitude,
      longitude: result.longitude,
    });
  } catch {
    return NextResponse.json(
      { error: "Postcode lookup is temporarily unavailable." },
      { status: 500 }
    );
  }
}
