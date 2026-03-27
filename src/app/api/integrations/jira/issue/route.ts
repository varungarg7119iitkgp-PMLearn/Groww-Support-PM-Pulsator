import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const { summary, description, labels = [], issueType = "Bug" } = await request.json();

    if (!summary || !description) {
      return NextResponse.json({ error: "summary and description are required" }, { status: 400 });
    }

    const baseUrl = process.env.JIRA_BASE_URL;
    const email = process.env.JIRA_USER_EMAIL;
    const token = process.env.JIRA_API_TOKEN;
    const projectKey = process.env.JIRA_PROJECT_KEY;

    if (!baseUrl || !email || !token || !projectKey) {
      return NextResponse.json(
        { error: "Jira not configured. Set JIRA_BASE_URL, JIRA_USER_EMAIL, JIRA_API_TOKEN, JIRA_PROJECT_KEY" },
        { status: 400 }
      );
    }

    const auth = Buffer.from(`${email}:${token}`).toString("base64");

    const payload = {
      fields: {
        project: { key: projectKey },
        summary,
        description: {
          type: "doc",
          version: 1,
          content: [
            {
              type: "paragraph",
              content: [{ type: "text", text: description }],
            },
          ],
        },
        issuetype: { name: issueType },
        labels,
      },
    };

    const res = await fetch(`${baseUrl}/rest/api/3/issue`, {
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
      return NextResponse.json({ error: data?.errorMessages?.join(", ") || "Failed to create Jira issue" }, { status: res.status });
    }

    return NextResponse.json({
      success: true,
      issueKey: data.key,
      issueId: data.id,
      issueUrl: `${baseUrl}/browse/${data.key}`,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
