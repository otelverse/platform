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
  query Logs($severity: String, $message: String, $startTime: DateTime!, $endTime: DateTime!, $limit: Int) {
    logs(severity: $severity, message: $message, startTime: $startTime, endTime: $endTime, limit: $limit) {
      timestamp
      severity
      body
      attributes {
        key
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
