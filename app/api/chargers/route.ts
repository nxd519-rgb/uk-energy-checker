
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const token = process.env.PLUG_API_TOKEN;

    if (!token) {
      return Response.json(
        { error: "PLUG_API_TOKEN is missing from Vercel." },
        { status: 500 }
      );
    }

    const headers = {
      Authorization: `Token ${token}`,
      Accept: "application/json",
    };

    // 1. Discover available OCPI versions
    const versionsResponse = await fetch(
      "https://plugcharging.co.uk/ocpi/versions",
      { headers, cache: "no-store" }
    );

    const versionsJson = await versionsResponse.json();

    if (!versionsResponse.ok) {
      throw new Error(
        `PLUG versions request failed: ${versionsResponse.status}`
      );
    }

    // OCPI normally returns data as an array
    const versions = Array.isArray(versionsJson?.data)
      ? versionsJson.data
      : versionsJson?.data?.versions;

    if (!versions?.length) {
      return Response.json({
        error: "PLUG returned no OCPI versions.",
        status_code: versionsJson?.status_code,
        status_message: versionsJson?.status_message,
        response: versionsJson,
      }, { status: 502 });
    }

    // Prefer OCPI 2.2.1
    const selectedVersion =
      versions.find((item: { version: string }) =>
        item.version === "2.2.1"
      ) ?? versions[0];

    // 2. Discover the module endpoints
    const versionResponse = await fetch(selectedVersion.url, {
      headers,
      cache: "no-store",
    });

    const versionJson = await versionResponse.json();

    if (!versionResponse.ok) {
      throw new Error(
        `PLUG endpoint discovery failed: ${versionResponse.status}`
      );
    }

    const endpoints = versionJson?.data?.endpoints;

    const locationsEndpoint = endpoints?.find(
      (endpoint: { identifier: string }) =>
        endpoint.identifier === "locations"
    );

    if (!locationsEndpoint?.url) {
      return Response.json({
        error: "PLUG locations endpoint was not found.",
        availableEndpoints: endpoints?.map(
          (endpoint: { identifier: string }) => endpoint.identifier
        ) ?? [],
      }, { status: 502 });
    }

    // 3. Retrieve charging locations
    const locationsUrl = new URL(locationsEndpoint.url);
    locationsUrl.searchParams.set("limit", "100");
    locationsUrl.searchParams.set("offset", "0");

    const locationsResponse = await fetch(locationsUrl.toString(), {
      headers,
      cache: "no-store",
    });

    const locationsJson = await locationsResponse.json();

    if (!locationsResponse.ok) {
      throw new Error(
        `PLUG locations request failed: ${locationsResponse.status}`
      );
    }

    return Response.json({
      source: "PLUG Charging",
      version: selectedVersion.version,
      locations: locationsJson?.data ?? [],
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error("Charger API error:", error);

    return Response.json({
      error: error instanceof Error
        ? error.message
        : "Unknown charging API error.",
    }, { status: 500 });
  }
}
