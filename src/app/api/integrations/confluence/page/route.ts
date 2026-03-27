import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const { title, htmlBody } = await request.json();

    if (!title || !htmlBody) {
      return NextResponse.json({ error: "title and htmlBody are required" }, { status: 400 });
    }

    const baseUrl = process.env.CONFLUENCE_BASE_URL;
    const email = process.env.CONFLUENCE_USER_EMAIL;
    const token = process.env.CONFLUENCE_API_TOKEN;
    const spaceKey = process.env.CONFLUENCE_SPACE_KEY;
    const parentPageId = process.env.CONFLUENCE_PARENT_PAGE_ID;

    if (!baseUrl || !email || !token || !spaceKey) {
      return NextResponse.json(
        {
          error:
            "Confluence not configured. Set CONFLUENCE_BASE_URL, CONFLUENCE_USER_EMAIL, CONFLUENCE_API_TOKEN, CONFLUENCE_SPACE_KEY",
        },
        { status: 400 }
      );
    }

    const auth = Buffer.from(`${email}:${token}`).toString("base64");

    const payload: Record<string, unknown> = {
      type: "page",
      title,
      space: { key: spaceKey },
      body: {
        storage: {
          value: htmlBody,
          representation: "storage",
        },
      },
    };

    if (parentPageId) {
      payload.ancestors = [{ id: parentPageId }];
    }

    const res = await fetch(`${baseUrl}/wiki/rest/api/content`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json({ error: data?.message || data?.errorMessages?.join(", ") || "Failed to create Confluence page" }, { status: res.status });
    }

    const pageId = data.id;
    const pageUrl = `${baseUrl}/wiki${data?._links?.webui || ""}`;

    return NextResponse.json({ success: true, pageId, pageUrl });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
