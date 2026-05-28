import React from 'react';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className="hero hero--primary" style={{ padding: '6rem 0', textAlign: 'center', backgroundColor: '#25c2a0', color: 'white' }}>
      <div className="container">
        <h1 className="hero__title">{siteConfig.title}</h1>
        <p className="hero__subtitle" style={{ fontSize: '1.5rem', marginBottom: '2rem' }}>
          OpenTelemetry, Unified. Start Observing in Minutes.
        </p>
        <div style={{ marginTop: '2rem' }}>
          <Link
            className="button button--secondary button--lg"
            to="/docs/intro">
            Get Started
          </Link>
          <span style={{ margin: '0 10px' }}></span>
          <Link
            className="button button--outline button--secondary button--lg"
            href="https://discord.gg/otelverse"
            style={{ color: 'white', borderColor: 'white' }}>
            Join Discord
          </Link>
        </div>
      </div>
    </header>
  );
}

function Features() {
  const featureList = [
    {
      title: 'Visual Pipelines',
      description: 'Drag and drop ReactFlow interface to build OTel Collector configurations effortlessly.'
    },
    {
      title: 'Session Replay',
      description: 'Link DOM snapshots directly to traces so you see exactly what the user saw.'
    },
    {
      title: 'AI Optimizer',
      description: 'Automatically detect PII and high-error traces, recommending robust sampling policies.'
    },
    {
      title: 'Chaos Engineering',
      description: 'Inject OTLP-native latency and errors directly into traces to test system resilience.'
    }
  ];

  return (
    <section style={{ padding: '4rem 0' }}>
      <div className="container">
        <div className="row">
          {featureList.map((f, idx) => (
            <div key={idx} className="col col--6" style={{ padding: '2rem' }}>
              <h3>{f.title}</h3>
              <p>{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Community() {
  return (
    <section style={{ padding: '4rem 0', backgroundColor: '#f5f6f7', textAlign: 'center' }}>
      <div className="container">
        <h2>Join the Community</h2>
        <p style={{ fontSize: '1.2rem', marginBottom: '2rem' }}>
          Connect with other developers, share your setups, and contribute to the open-source platform.
        </p>
        <div>
          <Link
            className="button button--primary button--lg"
            href="https://discord.gg/otelverse"
            style={{ marginRight: '1rem' }}>
            💬 Join our Discord
          </Link>
          <Link
            className="button button--outline button--primary button--lg"
            href="https://github.com/otelverse/platform">
            ⭐ Star on GitHub
          </Link>
        </div>
      </div>
    </section>
  );
}

function SocialProof() {
  return (
    <section style={{ padding: '4rem 0', textAlign: 'center' }}>
      <div className="container">
        <h2 style={{ color: '#606770' }}>Trusted By Open Source Pioneers</h2>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginTop: '2rem', flexWrap: 'wrap' }}>
          <div style={{ width: '150px', height: '60px', backgroundColor: '#e4e6eb', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8c939d' }}>[Logo Placeholder]</div>
          <div style={{ width: '150px', height: '60px', backgroundColor: '#e4e6eb', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8c939d' }}>[Logo Placeholder]</div>
          <div style={{ width: '150px', height: '60px', backgroundColor: '#e4e6eb', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8c939d' }}>[Logo Placeholder]</div>
          <div style={{ width: '150px', height: '60px', backgroundColor: '#e4e6eb', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8c939d' }}>[Logo Placeholder]</div>
        </div>
      </div>
    </section>
  );
}

export default function Home(): JSX.Element {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={`Welcome to ${siteConfig.title}`}
      description="OpenTelemetry, Unified. Start Observing in Minutes.">
      <HomepageHeader />
      <main>
        <Features />
        <SocialProof />
        <Community />
      </main>
    </Layout>
  );
}
