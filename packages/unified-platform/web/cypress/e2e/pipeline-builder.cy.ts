describe('Pipeline Builder', () => {
  beforeEach(() => {
    cy.intercept('POST', '/graphql', (req) => {
      if (req.body.query?.includes('pipelines')) {
        req.reply({
          data: {
            pipelines: [
              { id: 'p1', name: 'Test Pipeline', nodes: [], edges: [] },
            ],
          },
        })
      } else if (req.body.query?.includes('pipelineCreate')) {
        req.reply({
          data: {
            pipelineCreate: {
              id: 'p-new',
              name: 'New Pipeline',
            },
          },
        })
      } else if (req.body.query?.includes('pipelineValidate')) {
        req.reply({
          data: {
            pipelineValidate: {
              valid: true,
              errors: [],
            },
          },
        })
      } else if (req.body.query?.includes('pipelineExportYAML')) {
        req.reply({
          data: {
            pipelineExportYAML: 'receivers:\n  otlp:\n    protocols:\n      grpc:\n        endpoint: 0.0.0.0:4317\nprocessors:\n  batch:\nexporters:\n  logging:\n    verbosity: detailed\nservice:\n  pipelines:\n    traces:\n      receivers: [otlp]\n      processors: [batch]\n      exporters: [logging]\n',
          },
        })
      } else {
        req.reply({ data: {} })
      }
    })
  })

  it('visits the pipeline builder page', () => {
    cy.visit('/pipelines')
    cy.contains('Pipelines')
    cy.contains('Test Pipeline')
  })

  it('shows toolbar buttons', () => {
    cy.visit('/pipelines')
    cy.contains('Validate')
    cy.contains('Export YAML')
    cy.contains('Deploy')
  })
})
