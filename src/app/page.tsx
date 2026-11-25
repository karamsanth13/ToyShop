import { PageContainer } from "@/components/ui/page-container";

export default function HomePage() {
  return (
    <main style={{ paddingBlock: "4rem" }}>
      <PageContainer>
        <section className="surface-card" style={{ padding: "2rem" }}>
          <p style={{ color: "var(--text-muted)" }}>A little more play, a lot more wonder.</p>
          <h1>Welcome to your local toy shop</h1>
          <p style={{ color: "var(--text-muted)" }}>
            The shared foundation is ready for the shop and catalogue teams to connect their sections.
          </p>
        </section>
      </PageContainer>
    </main>
  );
}
