import type { Metadata } from "next";
import { VIBES } from "@/lib/style";
import { StyleResult } from "@/components/StyleResult";

// Parse the slug ("minimal_old-money") into known vibes.
function parseVibes(slug: string) {
  const ids = decodeURIComponent(slug).split("_");
  return VIBES.filter((v) => ids.includes(v.id));
}

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await props.params;
  const vibes = parseVibes(slug);
  const label = vibes.map((v) => v.label).join(" + ") || "Curated";
  return {
    title: `My style is ${label} — Threadloop`,
    description: `I took the Threadloop style quiz. Find your vibe and shop every store at once.`,
  };
}

export default async function StylePage(props: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await props.params;
  const vibes = parseVibes(slug);
  return <StyleResult vibes={vibes} slug={slug} />;
}
