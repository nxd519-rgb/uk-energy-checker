
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const token = process.env.PLUG_API_TOKEN;

    if (!token) {
      return Response.json(
        { error: "PLUG API token is missing from Vercel." },
        { status: 500 }
      );
    }

    const headers = {
      Authorization: `Token ${token}`,
      Accept: "application/json",
    };

    // Step 1: Discover the available OCPI version
    const versionsResponse = await fetch(
      "https://plugcharging.co.uk/ocpi/versions",
      { headers, cache: "no-store" }
    );

    if (!versionsResponse.ok) {
      throw new Error("Could not connect to PLUG versions endpoint.");
    }

    const versionsJson = await versionsResponse.json();
    const versions = versionsJson?.data?.versions;

    if (!versions?.length) {
      throw new Error("No OCPI versions were returned.");
    }

    // Step 2: Discover the locations endpoint
    const versionResponse = await fetch(versions[0].url, {
      headers,
      cache: "no-store",
    });

    if (!versionResponse.ok) {
      throw new Error("Could not retrieve PLUG endpoint information.");
    }

    const versionJson = await versionResponse.json();
    const endpoints = versionJson?.data?.endpoints;

    const locationsEndpoint = endpoints?.find(
      (endpoint: { identifier: string; role?: string }) =>
        endpoint.identifier === "locations" &&
        (!endpoint.role || endpoint.role === "CPO")
    );

    if (!locationsEndpoint?.url) {
      throw new Error("PLUG locations endpoint was not found.");
    }

    // Step 3: Retrieve charging locations
    const locationsUrl = new URL(locationsEndpoint.url);
    locationsUrl.searchParams.set("limit", "100");
    locationsUrl.searchParams.set("offset", "0");

    const locationsResponse = await fetch(locationsUrl.toString(), {
      headers,
      cache: "no-store",
    });

    if (!locationsResponse.ok) {
      throw new Error("Could not retrieve charging locations.");
    }

    const locationsJson = await locationsResponse.json();

    return Response.json({
      source: "PLUG Charging",
      locations: locationsJson?.data ?? [],
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error("Charger API error:", error);

    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Something went wrong retrieving charging data.",
      },
      { status: 500 }
    );
  }
}
