import { cookies } from "next/headers";
import { AppearanceToggle } from "@/components/AppearanceToggle";
import { BrandMark, SotamaMark } from "@/components/BrandMark";
import { SocialLinks } from "@/components/SocialLinks";
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

      <main className="hero-main">
        <div className="hero-content">
          <header className="hero-header">
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
        </div>

        <div className="hero-bottom">
          <footer className="fade-slide-4 hero-footer">
            <span className="hig-footnote">
              Have an invite code?{" "}
              <a href="https://beta.sotama.xyz" className="hero-footer-link">
                Access the beta here
              </a>
            </span>
          </footer>

          <div className="fade-slide-4 hero-social">
            <SocialLinks />
          </div>
        </div>
      </main>
    </>
  );
}
