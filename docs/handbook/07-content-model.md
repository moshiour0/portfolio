# 07 — The content model

You supplied a 36-page written brief (`Gmail - Writing.pdf`) with the
instruction _"don't leave anything crucial from this pdf"_. That document is now
[`lib/content.ts`](../../lib/content.ts) — **956 lines of typed data**, and it
is the single source of truth for every word on the site.

---

## 1. Why content is code here

No CMS, no markdown files, no JSON blobs. One TypeScript module, because:

- **A missing field is a build error.** If a project has no `summary`, the
  build fails rather than rendering a gap.
- **Everything is prerendered.** Content is read at build time, so all copy is
  in the HTML — good for search engines, and readable with JavaScript off.
- **Renaming propagates.** Change a field name and TypeScript shows you every
  component that used it.
- **One place to edit.** You never have to hunt through components for a
  sentence.

---

## 2. What is in it

| Export                                      | Shape            | Feeds                                              |
| ------------------------------------------- | ---------------- | -------------------------------------------------- |
| `profile`                                   | object           | Name, roles, location, email, one-line positioning |
| `links`                                     | `SocialLink[]`   | LinkedIn, GitHub, X, Email — with icon keys        |
| `achievementSignals`                        | array            | The thin strip under the hero                      |
| `intro`                                     | object           | "Turning Data Into Stories"                        |
| `pillars`                                   | `Pillar[]` (5)   | The "What I Do" deck                               |
| `projects`                                  | `Project[]` (5)  | Cards **and** the full case-study pages            |
| `research`                                  | object           | Research and exploration section                   |
| `skillGroups`                               | array (11)       | The technical skills deck                          |
| `journey`                                   | `JourneyEntry[]` | The timeline                                       |
| `education`                                 | array            | Foundations                                        |
| `academicDirection`                         | object           | Where the study is heading                         |
| `awards`                                    | array (3)        | Recognition                                        |
| `values`                                    | array (8)        | Working principles                                 |
| `about`, `philosophy`, `learningPhilosophy` | objects          | The reflective sections                            |
| `currentlyExploring`                        | array (6)        | Open threads deck                                  |
| `contact`                                   | object           | Call to action                                     |
| `sections`                                  | array            | Nav labels and ids                                 |

### The types are small and explicit

```ts
export type SocialLink = {
  label: string;
  href: string;
  handle: string;
  icon: "linkedin" | "x" | "github" | "mail";
};

export type Pillar = { index: string; title: string; statement: string; focus: string[] };

export type JourneyEntry = { period: string; title: string; body?: string; items?: string[] };
```

The `icon` union is worth noting — it means a typo like `"linkdin"` is caught
at compile time, and `SocialIcon` can switch on it exhaustively.

---

## 3. Rules encoded from your brief

Your brief contained explicit constraints, and several are enforced by the type
system or documented in the file itself:

```ts
/** Verified links only, as the spec requires. */
export const links: SocialLink[] = [ ... ];

/** Honest label: Project / Research Exploration / Architecture Study / Competition Project. */
label: string;

/** At most five, per the card design rule. */
tags: string[];
```

The `label` field matters. Your brief was insistent that work be described
accurately — a research exploration should not be presented as a shipped
project. That distinction lives in the data, so every surface that renders a
project renders the honest label with it.

**No invented metrics.** Nothing in this file states a statistic that was not
in your brief. Where a project has no measured outcome, none is claimed.

---

## 4. One project, two surfaces

`Project` carries both a short form and a `detail` object:

```ts
export type Project = {
  slug: string;        // the URL: /projects/sarguardian
  number: string;
  name: string;
  kicker: string;
  category: string;
  tagline?: string;
  summary: string;     // what the card shows
  label: string;
  tags: string[];      // max 5
  detail: { ... };     // the full case study
};
```

The carousel card reads the top-level fields. `app/projects/[slug]/page.tsx`
reads `detail` and generates a page per project at build time via
`generateStaticParams`. Add a project to the array and its page exists — no
routing to write.

---

## 5. Editing it

**Change a sentence:** find it in `lib/content.ts`, edit, save. Every place it
appears updates.

**Add a project:**

```ts
{
  slug: "new-thing",
  number: "06",
  name: "New Thing",
  kicker: "…",
  category: "…",
  summary: "…",
  label: "Research Exploration",
  tags: ["…"],            // five maximum
  detail: { /* TypeScript will list what is required */ },
}
```

The card appears in the deck and `/projects/new-thing` starts working
immediately.

**Add a skill group or a value:** append to the array. The decks size
themselves from their contents (chapter 03 §2).

**Rename a section:** change it in `sections`, in `SECTION_ORDER` in
[`lib/backdrops.ts`](../../lib/backdrops.ts), and on the `<Section id="…">`.
All three must agree — the id is what binds the nav link, the backdrop, and the
scroll target together.

---

## 6. One thing that was removed

The Allama Iqbal scholarship content was removed at your request, in full and
before anything was committed or published. Verified absent from source, from
the build output, and from the deployed site.

If you ever want to check that something is genuinely gone rather than just
hidden:

```bash
grep -rniE "term" --include="*.ts" --include="*.tsx" --include="*.md" . | grep -v node_modules
grep -rli "term" .next/server
```

The second command matters — content can survive in a stale build even after it
leaves the source.
