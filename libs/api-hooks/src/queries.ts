export const TRACES_QUERY = `
  query Traces($serviceName: String, $operationName: String, $startTime: DateTime!, $endTime: DateTime!, $limit: Int) {
    traces(serviceName: $serviceName, operationName: $operationName, startTime: $startTime, endTime: $endTime, limit: $limit) {
      traceId
      spans {
        spanId
        parentSpanId
        operationName
        serviceName
        startTime
        duration
        statusCode
        attributes {
          key
          value
        }
        events {
          name
          timestamp
          attributes {
            key
            value
          }
        }
      }
    }
  }
`

export const TRACE_QUERY = `
  query Trace($id: String!) {
    trace(id: $id) {
      traceId
      spans {
        spanId
        parentSpanId
        operationName
        serviceName
        startTime
        duration
        statusCode
        attributes {
          key
          value
        }
        events {
          name
          timestamp
          attributes {
            key
            value
          }
        }
      }
    }
  }
`

export const LOGS_QUERY = `
  query Logs($serviceName: String, $severity: String, $query: String, $startTime: DateTime!, $endTime: DateTime!, $limit: Int) {
    logs(serviceName: $serviceName, severity: $severity, query: $query, startTime: $startTime, endTime: $endTime, limit: $limit) {
      timestamp
      severity
      body
      traceId
      attributes {
        key
        value
      }
    }
  }
`

export const METRICS_QUERY = `
  query Metrics($query: String!, $startTime: DateTime!, $endTime: DateTime!, $step: Int!) {
    metrics(query: $query, startTime: $startTime, endTime: $endTime, step: $step) {
      metricName
      labels
      values {
        timestamp
        value
      }
    }
  }
`

export const UQL_QUERY = `
  query UQL($query: String!) {
    uql(query: $query) {
      ... on TraceList {
        traces {
          traceId
          spans {
            spanId
            parentSpanId
            operationName
            serviceName
            startTime
            duration
            statusCode
            attributes {
              key
              value
            }
            events {
              name
              timestamp
              attributes {
                key
                value
              }
            }
          }
        }
      }
      ... on LogList {
        logs {
          timestamp
          severity
          body
          attributes {
            key
            value
          }
        }
      }
    }
  }
`

export const GET_PIPELINES = `
  query Pipelines {
    pipelines {
      id
      name
      nodes {
        id
        type
        label
        properties
        position {
          x
          y
        }
      }
      edges {
        id
        source
        target
        sourceHandle
        targetHandle
      }
    }
  }
`

export const GET_PIPELINE = `
  query Pipeline($id: ID!) {
    pipeline(id: $id) {
      id
      name
      nodes {
        id
        type
        label
        properties
        position {
          x
          y
        }
      }
      edges {
        id
        source
        target
        sourceHandle
        targetHandle
      }
    }
  }
`

export const CREATE_PIPELINE = `
  mutation CreatePipeline($input: PipelineInput!) {
    pipelineCreate(input: $input) {
      id
      name
    }
  }
`

export const UPDATE_PIPELINE = `
  mutation UpdatePipeline($id: ID!, $input: PipelineInput!) {
    pipelineUpdate(id: $id, input: $input) {
      id
      name
    }
  }
`

export const DELETE_PIPELINE = `
  mutation DeletePipeline($id: ID!) {
    pipelineDelete(id: $id)
  }
`

export const VALIDATE_PIPELINE = `
  query ValidatePipeline($id: ID!) {
    pipelineValidate(id: $id) {
      valid
      errors
    }
  }
`

export const EXPORT_PIPELINE_YAML = `
  query ExportPipelineYAML($id: ID!) {
    pipelineExportYAML(id: $id)
  }
`

export const DEPLOY_PIPELINE = `
  mutation DeployPipeline($id: ID!) {
    pipelineDeploy(id: $id) {
      containerId
      status
    }
  }
`
