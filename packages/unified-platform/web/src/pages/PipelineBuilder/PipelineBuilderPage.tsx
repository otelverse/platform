import { useState, useCallback } from 'react'
import {
  usePipelines,
  usePipeline,
  useCreatePipeline,
  useUpdatePipeline,
  useDeletePipeline,
  useValidatePipeline,
  useExportPipelineYAML,
  useDeployPipeline,
} from '@otelverse/api-hooks'
import type {
  PipelineNode,
  PipelineEdge,
  PipelineInput,
  PipelineNodeInput,
  PipelineEdgeInput,
  Position,
} from '@otelverse/api-hooks'
import { Button, Card, Input, Spinner, CodeBlock } from '@otelverse/ui-kit'
import PipelineCanvas from './PipelineCanvas'

interface NodeFormData {
  label: string
  [key: string]: unknown
}

export default function PipelineBuilderPage() {
  const [selectedPipelineId, setSelectedPipelineId] = useState<string | null>(null)
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [showExport, setShowExport] = useState(false)
  const [exportYaml, setExportYaml] = useState('')
  const [deployResult, setDeployResult] = useState<string | null>(null)
  const [validationResult, setValidationResult] = useState<{ valid: boolean; errors: string[] } | null>(null)
  const [nodeForm, setNodeForm] = useState<NodeFormData>({ label: '' })

  const { data: pipelinesData, isLoading: pipelinesLoading } = usePipelines()
  const { data: pipelineData } = usePipeline(selectedPipelineId)
  const createPipeline = useCreatePipeline()
  const updatePipeline = useUpdatePipeline()
  const deletePipeline = useDeletePipeline()
  const validatePipeline = useValidatePipeline()
  const exportYAMLMutation = useExportPipelineYAML()
  const deployPipeline = useDeployPipeline()

  const pipelines = pipelinesData?.pipelines ?? []
  const activePipeline = pipelineData?.pipeline ?? null

  const handleCreate = useCallback(() => {
    const input: PipelineInput = {
      name: `Pipeline ${pipelines.length + 1}`,
      nodes: [],
      edges: [],
    }
    createPipeline.mutate(
      { input },
      {
        onSuccess: (data) => {
          setSelectedPipelineId(data.pipelineCreate.id)
        },
      },
    )
  }, [pipelines.length, createPipeline])

  const handleDelete = useCallback(
    (id: string) => {
      deletePipeline.mutate(
        { id },
        {
          onSuccess: () => {
            if (selectedPipelineId === id) {
              setSelectedPipelineId(null)
            }
          },
        },
      )
    },
    [deletePipeline, selectedPipelineId],
  )

  const handleCanvasChange = useCallback(
    (nodes: PipelineNode[], edges: PipelineEdge[]) => {
      if (!activePipeline) return
      const nodeInputs: PipelineNodeInput[] = nodes.map((n) => ({
        id: n.id,
        type: n.type,
        label: n.label,
        properties: n.properties,
        position: { x: n.position.x, y: n.position.y } as Position,
      }))
      const edgeInputs: PipelineEdgeInput[] = edges.map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        sourceHandle: e.sourceHandle,
        targetHandle: e.targetHandle,
      }))
      updatePipeline.mutate({
        id: activePipeline.id,
        input: { name: activePipeline.name, nodes: nodeInputs, edges: edgeInputs },
      })
    },
    [activePipeline, updatePipeline],
  )

  const handleValidate = useCallback(() => {
    if (!selectedPipelineId) return
    validatePipeline.mutate(
      { id: selectedPipelineId },
      {
        onSuccess: (data) => {
          setValidationResult(data.pipelineValidate)
        },
      },
    )
  }, [selectedPipelineId, validatePipeline])

  const handleExportYAML = useCallback(() => {
    if (!selectedPipelineId) return
    exportYAMLMutation.mutate(
      { id: selectedPipelineId },
      {
        onSuccess: (data) => {
          setExportYaml(data.pipelineExportYAML)
          setShowExport(true)
        },
      },
    )
  }, [selectedPipelineId, exportYAMLMutation])

  const handleDeploy = useCallback(() => {
    if (!selectedPipelineId) return
    deployPipeline.mutate(
      { id: selectedPipelineId },
      {
        onSuccess: (data) => {
          setDeployResult(`Container ${data.pipelineDeploy.containerId}: ${data.pipelineDeploy.status}`)
        },
        onError: (err) => {
          setDeployResult(`Deploy failed: ${err.message}`)
        },
      },
    )
  }, [selectedPipelineId, deployPipeline])

  const selectedNode = activePipeline?.nodes.find((n) => n.id === selectedNodeId)

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 64px)', gap: 0 }}>
      <div style={{ width: 260, borderRight: '1px solid var(--border-default)', padding: 16, overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>Pipelines</h3>
          <Button variant="primary" size="sm" onClick={handleCreate} disabled={createPipeline.isPending}>
            + New
          </Button>
        </div>
        {pipelinesLoading ? (
          <Spinner />
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {pipelines.map((p) => (
              <li
                key={p.id}
                style={{
                  padding: '8px 12px',
                  marginBottom: 4,
                  borderRadius: 6,
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  backgroundColor: selectedPipelineId === p.id ? 'var(--bg-elevated)' : 'transparent',
                  border: selectedPipelineId === p.id ? '1px solid var(--border-default)' : '1px solid transparent',
                }}
                onClick={() => setSelectedPipelineId(p.id)}
              >
                <span style={{ fontSize: 14 }}>{p.name}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDelete(p.id)
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--text-secondary)',
                    fontSize: 12,
                  }}
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div
          style={{
            padding: '8px 16px',
            borderBottom: '1px solid var(--border-default)',
            display: 'flex',
            gap: 8,
            alignItems: 'center',
          }}
        >
          <Button variant="outline" size="sm" onClick={handleValidate} disabled={!selectedPipelineId || validatePipeline.isPending}>
            Validate
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportYAML} disabled={!selectedPipelineId || exportYAMLMutation.isPending}>
            Export YAML
          </Button>
          <Button variant="primary" size="sm" onClick={handleDeploy} disabled={!selectedPipelineId || deployPipeline.isPending}>
            Deploy
          </Button>
          {validationResult && (
            <span style={{ fontSize: 12, marginLeft: 8, color: validationResult.valid ? '#22c55e' : '#ef4444' }}>
              {validationResult.valid ? '✓ Valid' : `✗ ${validationResult.errors.length} error(s)`}
            </span>
          )}
          {deployResult && <span style={{ fontSize: 12, marginLeft: 8 }}>{deployResult}</span>}
        </div>

        <div style={{ flex: 1, position: 'relative' }}>
          {activePipeline ? (
            <PipelineCanvas
              pipeline={activePipeline}
              selectedNodeId={selectedNodeId}
              onSelectNode={setSelectedNodeId}
              onChange={handleCanvasChange}
            />
          ) : (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                color: 'var(--text-secondary)',
              }}
            >
              Select or create a pipeline to start editing
            </div>
          )}
        </div>
      </div>

      <div
        style={{
          width: 280,
          borderLeft: '1px solid var(--border-default)',
          padding: 16,
          overflowY: 'auto',
        }}
      >
        {selectedNode ? (
          <Card title="Node Properties">
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Label</label>
              <Input
                value={selectedNode.label}
                onChange={(e) => {
                  setNodeForm({ ...nodeForm, label: e.target.value })
                }}
              />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Type</label>
              <div style={{ fontSize: 14, fontWeight: 500 }}>{selectedNode.type}</div>
            </div>
            {selectedNode.type === 'RECEIVER_OTLP' && (
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Endpoint</label>
                <Input
                  value={(selectedNode.properties?.endpoint as string) || ''}
                  onChange={() => {}}
                />
              </div>
            )}
          </Card>
        ) : (
          <div style={{ color: 'var(--text-secondary)', fontSize: 14, textAlign: 'center', marginTop: 40 }}>
            Select a node to edit properties
          </div>
        )}

        {showExport && exportYaml && (
          <div style={{ marginTop: 16 }}>
            <Card title="YAML Export">
              <CodeBlock code={exportYaml} language="yaml" />
              <div style={{ marginTop: 8 }}>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    const blob = new Blob([exportYaml], { type: 'text/yaml' })
                    const url = URL.createObjectURL(blob)
                    const a = document.createElement('a')
                    a.href = url
                    a.download = 'otel-collector-config.yaml'
                    a.click()
                    URL.revokeObjectURL(url)
                  }}
                >
                  Download
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
