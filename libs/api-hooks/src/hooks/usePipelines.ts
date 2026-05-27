import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { gqlRequest } from '../client'
import {
  GET_PIPELINES,
  GET_PIPELINE,
  CREATE_PIPELINE,
  UPDATE_PIPELINE,
  DELETE_PIPELINE,
  VALIDATE_PIPELINE,
  EXPORT_PIPELINE_YAML,
  DEPLOY_PIPELINE,
} from '../queries'
import type { Pipeline, PipelineInput, ValidationResult, DeployResult } from '../types'

interface PipelinesResponse {
  pipelines: Pipeline[]
}

interface PipelineResponse {
  pipeline: Pipeline | null
}

interface CreatePipelineResponse {
  pipelineCreate: Pipeline
}

interface UpdatePipelineResponse {
  pipelineUpdate: Pipeline
}

interface DeletePipelineResponse {
  pipelineDelete: boolean
}

interface ValidatePipelineResponse {
  pipelineValidate: ValidationResult
}

interface ExportPipelineYAMLResponse {
  pipelineExportYAML: string
}

interface DeployPipelineResponse {
  pipelineDeploy: DeployResult
}

export function usePipelines() {
  return useQuery<PipelinesResponse>({
    queryKey: ['pipelines'],
    queryFn: () => gqlRequest<PipelinesResponse>(GET_PIPELINES),
  })
}

export function usePipeline(id: string | null) {
  return useQuery<PipelineResponse>({
    queryKey: ['pipeline', id],
    queryFn: () => gqlRequest<PipelineResponse>(GET_PIPELINE, { id }),
    enabled: !!id,
  })
}

export function useCreatePipeline() {
  const queryClient = useQueryClient()
  return useMutation<CreatePipelineResponse, Error, { input: PipelineInput }>({
    mutationFn: ({ input }) =>
      gqlRequest<CreatePipelineResponse>(CREATE_PIPELINE, { input }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pipelines'] })
    },
  })
}

export function useUpdatePipeline() {
  const queryClient = useQueryClient()
  return useMutation<UpdatePipelineResponse, Error, { id: string; input: PipelineInput }>({
    mutationFn: ({ id, input }) =>
      gqlRequest<UpdatePipelineResponse>(UPDATE_PIPELINE, { id, input }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pipelines'] })
    },
  })
}

export function useDeletePipeline() {
  const queryClient = useQueryClient()
  return useMutation<DeletePipelineResponse, Error, { id: string }>({
    mutationFn: ({ id }) =>
      gqlRequest<DeletePipelineResponse>(DELETE_PIPELINE, { id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pipelines'] })
    },
  })
}

export function useValidatePipeline() {
  return useMutation<ValidatePipelineResponse, Error, { id: string }>({
    mutationFn: ({ id }) =>
      gqlRequest<ValidatePipelineResponse>(VALIDATE_PIPELINE, { id }),
  })
}

export function useExportPipelineYAML() {
  return useMutation<ExportPipelineYAMLResponse, Error, { id: string }>({
    mutationFn: ({ id }) =>
      gqlRequest<ExportPipelineYAMLResponse>(EXPORT_PIPELINE_YAML, { id }),
  })
}

export function useDeployPipeline() {
  return useMutation<DeployPipelineResponse, Error, { id: string }>({
    mutationFn: ({ id }) =>
      gqlRequest<DeployPipelineResponse>(DEPLOY_PIPELINE, { id }),
  })
}
