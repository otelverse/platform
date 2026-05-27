import React from 'react';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className="hero hero--primary" style={{ padding: '4rem 0', textAlign: 'center', backgroundColor: '#25c2a0', color: 'white' }}>
      <div className="container">
        <h1 className="hero__title">{siteConfig.title}</h1>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
        <div style={{ marginTop: '2rem' }}>
          <Link
            className="button button--secondary button--lg"
            to="/docs/getting-started">
            Get Started Tutorial - 5min ⏱️
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

export default function Home(): JSX.Element {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={`Welcome to ${siteConfig.title}`}
      description="The OpenTelemetry Universe">
      <HomepageHeader />
      <main>
        <Features />
      </main>
    </Layout>
  );
}
