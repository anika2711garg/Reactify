import { NextRequest, NextResponse } from "next/server";
import { analyzeJsx } from "@/lib/parser/jsx-tree";
import { publicErrorMessage } from "@/lib/ai/contract";

export async function POST(req: NextRequest) {
  try {
    const { code } = await req.json();
    if (typeof code !== "string") {
      return NextResponse.json({ error: "Code is required" }, { status: 400 });
    }

    const analysis = analyzeJsx(code);
    return NextResponse.json({
      tree: analysis.tree,
      componentName: analysis.componentName,
      warnings: analysis.warnings,
    });
  } catch (error) {
    return NextResponse.json(
      { error: publicErrorMessage(error, "Failed to analyze component tree") },
      { status: 500 }
    );
  }
}
