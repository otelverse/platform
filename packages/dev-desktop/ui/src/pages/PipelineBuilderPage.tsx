import { useState, useEffect, ChangeEvent } from 'react'
import { invoke } from '@tauri-apps/api/core'

interface PipelineNode {
  id: string
  type: string
  label: string
}

interface Pipeline {
  id: string
  name: string
  nodes: PipelineNode[]
}

const defaultPipelineYaml = `receivers:
  otlp:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317
processors:
  batch:
    timeout: 1s
exporters:
  otlp:
    endpoint: localhost:4317
    tls:
      insecure: true
service:
  pipelines:
    traces:
      receivers: [otlp]
      processors: [batch]
      exporters: [otlp]
    logs:
      receivers: [otlp]
      processors: [batch]
      exporters: [otlp]
`

export default function PipelineBuilderPage() {
  const [pipelines, setPipelines] = useState<Pipeline[]>([])
  const [yamlConfig, setYamlConfig] = useState(defaultPipelineYaml)
  const [deployStatus, setDeployStatus] = useState<string | null>(null)

  useEffect(() => {
    fetch('/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: '{ pipelines { id name nodes { id type label } } }' }),
    })
      .then(r => r.json())
      .then(data => setPipelines(data.data?.pipelines ?? []))
      .catch(() => {})
  }, [])

  const handleDeploy = async () => {
    setDeployStatus('Deploying...')
    try {
      const resp = await invoke<{ status: string, error?: string }>('deploy_pipeline', { yaml: yamlConfig })
      if (resp.status === 'ok') {
        setDeployStatus('Deployed successfully')
      } else {
        setDeployStatus(`Failed: ${resp.error}`)
      }
    } catch (err: any) {
      setDeployStatus(`Failed to deploy: ${err.toString()}`)
    }
  }

  return (
    <div>
      <h1 style={{ margin: '0 0 16px', fontSize: 24 }}>Pipeline Builder</h1>
      <div style={{ display: 'flex', gap: 24 }}>
        <div style={{ flex: 1 }}>
          <h3>Existing Pipelines</h3>
          {pipelines.length === 0 ? (
            <p style={{ color: '#888' }}>No pipelines configured.</p>
          ) : (
            <ul>
              {pipelines.map(p => (
                <li key={p.id}>{p.name} ({p.nodes.length} nodes)</li>
              ))}
            </ul>
          )}
        </div>
        <div style={{ flex: 2 }}>
          <h3>Collector Configuration (YAML)</h3>
          <textarea
            value={yamlConfig}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setYamlConfig(e.target.value)}
            style={{ width: '100%', height: 300, fontFamily: 'monospace', fontSize: 12, padding: 8, border: '1px solid #ccc', borderRadius: 4 }}
          />
          <div style={{ marginTop: 12, display: 'flex', gap: 8, alignItems: 'center' }}>
            <button onClick={handleDeploy}
              style={{ padding: '8px 20px', background: '#0f3460', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}>
              Deploy to Local Collector
            </button>
            {deployStatus && <span style={{ fontSize: 13, color: '#666' }}>{deployStatus}</span>}
          </div>
        </div>
      </div>
    </div>
  )
}
