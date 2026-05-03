import { cookies } from "next/headers";
import { AppearanceToggle } from "@/components/AppearanceToggle";
import { BrandMark, SotamaMark } from "@/components/BrandMark";
import { WaitlistForm } from "@/components/WaitlistForm";
import { getCount } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function Page() {
  let initialCount = 0;
  try {
    initialCount = await getCount();
  } catch {
    initialCount = 0;
  }

  const cookieStore = await cookies();
  const initialJoined = cookieStore.get("sotama_joined")?.value === "1";

  return (
    <>
      <div className="ambient-bg" aria-hidden="true" />

      <BrandMark />

      <div
        style={{
          position: "fixed",
          top: "1rem",
          right: "1rem",
          zIndex: 5,
          display: "flex",
          alignItems: "center",
          gap: "0.625rem",
        }}
      >
        <AppearanceToggle />
      </div>

      <main
        style={{
          position: "relative",
          zIndex: 1,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "6rem 1.5rem 5rem",
        }}
      >
        <header
          style={{
            width: "100%",
            maxWidth: "40rem",
            textAlign: "center",
            marginBottom: "4rem",
          }}
        >
          <div className="fade-slide" style={{ marginBottom: "1.75rem", display: "inline-flex" }}>
            <SotamaMark size={4.25} />
          </div>

          <h1
            className="fade-slide-1 hig-large-title"
            style={{
              margin: 0,
              fontSize: "clamp(2.5rem, 6vw, 3.75rem)",
              lineHeight: 1.05,
              letterSpacing: "-0.022em",
              fontWeight: 700,
              color: "var(--label-primary)",
            }}
          >
            Solana automations,
            <br />
            <span style={{ color: "var(--label-primary)", opacity: 0.78, fontWeight: 600 }}>
              one sentence at a time.
            </span>
          </h1>

          <p
            className="fade-slide-2 hig-body"
            style={{
              marginTop: "1.25rem",
              color: "var(--label-primary)",
              opacity: 0.85,
              fontWeight: 500,
              fontSize: "1.125rem",
              lineHeight: "1.625rem",
              textWrap: "pretty",
              maxWidth: "32rem",
              marginLeft: "auto",
              marginRight: "auto",
            }}
          >
            Compose a rule. Sotama runs it on auto mode.
          </p>
        </header>

        <div className="fade-slide-3" style={{ width: "100%", display: "flex", justifyContent: "center" }}>
          <WaitlistForm initialCount={initialCount} initialJoined={initialJoined} />
        </div>

        <footer
          className="fade-slide-4"
          style={{
            marginTop: "4.5rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            color: "var(--label-tertiary)",
          }}
        >
          <span
            className="pulse-dot"
            style={{
              width: "0.5rem",
              height: "0.5rem",
              borderRadius: "999px",
              background: "var(--green)",
              flexShrink: 0,
            }}
          />
          <span className="hig-footnote">Building now · invites rolling out soon</span>
        </footer>
      </main>
    </>
  );
}
