import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { request } from 'graphql-request';
import { getGraphQLUrl } from '../config';

export interface ChaosExperiment {
  id: string;
  name: string;
  targetService: string;
  targetSpanName?: string;
  faultType: 'LATENCY' | 'ERROR';
  config: Record<string, any>;
  status: 'SCHEDULED' | 'RUNNING' | 'COMPLETED' | 'CANCELLED';
  startTime: string;
  endTime?: string;
  creator: string;
}

export interface ChaosExperimentInput {
  name: string;
  targetService: string;
  targetSpanName?: string;
  faultType: 'LATENCY' | 'ERROR';
  config: Record<string, any>;
}

export interface AffectedService {
  serviceName: string;
  spanCount: number;
  errorCount: number;
  latencyIncreasePct: number;
}

export interface BlastRadiusResult {
  affectedServices: AffectedService[];
  totalAffectedSpans: number;
  averageLatencyIncrease: number;
}

const GET_EXPERIMENTS = `
  query GetChaosExperiments {
    chaosExperiments {
      id
      name
      targetService
      targetSpanName
      faultType
      config
      status
      startTime
      endTime
      creator
    }
  }
`;

const GET_EXPERIMENT = `
  query GetChaosExperiment($id: ID!) {
    chaosExperiment(id: $id) {
      id
      name
      targetService
      targetSpanName
      faultType
      config
      status
      startTime
      endTime
      creator
    }
  }
`;

const GET_BLAST_RADIUS = `
  query GetBlastRadius($experimentId: ID!) {
    chaosBlastRadius(experimentId: $experimentId) {
      affectedServices {
        serviceName
        spanCount
        errorCount
        latencyIncreasePct
      }
      totalAffectedSpans
      averageLatencyIncrease
    }
  }
`;

const CREATE_EXPERIMENT = `
  mutation CreateChaosExperiment($input: ChaosExperimentInput!) {
    chaosCreateExperiment(input: $input) {
      id
    }
  }
`;

const START_EXPERIMENT = `
  mutation StartChaosExperiment($id: ID!) {
    chaosStartExperiment(id: $id) {
      id
      status
    }
  }
`;

const CANCEL_EXPERIMENT = `
  mutation CancelChaosExperiment($id: ID!) {
    chaosCancelExperiment(id: $id) {
      id
      status
    }
  }
`;

export function useChaosExperiments() {
  return useQuery({
    queryKey: ['chaosExperiments'],
    queryFn: async () => {
      const data = await request<{ chaosExperiments: ChaosExperiment[] }>(
        getGraphQLUrl(),
        GET_EXPERIMENTS
      );
      return data.chaosExperiments;
    },
  });
}

export function useChaosExperiment(id: string) {
  return useQuery({
    queryKey: ['chaosExperiment', id],
    queryFn: async () => {
      const data = await request<{ chaosExperiment: ChaosExperiment }>(
        getGraphQLUrl(),
        GET_EXPERIMENT,
        { id }
      );
      return data.chaosExperiment;
    },
    enabled: !!id,
  });
}

export function useChaosBlastRadius(experimentId: string) {
  return useQuery({
    queryKey: ['chaosBlastRadius', experimentId],
    queryFn: async () => {
      const data = await request<{ chaosBlastRadius: BlastRadiusResult }>(
        getGraphQLUrl(),
        GET_BLAST_RADIUS,
        { experimentId }
      );
      return data.chaosBlastRadius;
    },
    enabled: !!experimentId,
  });
}

export function useCreateChaosExperiment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: ChaosExperimentInput) => {
      const data = await request<{ chaosCreateExperiment: ChaosExperiment }>(
        getGraphQLUrl(),
        CREATE_EXPERIMENT,
        { input }
      );
      return data.chaosCreateExperiment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chaosExperiments'] });
    },
  });
}

export function useStartChaosExperiment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const data = await request<{ chaosStartExperiment: ChaosExperiment }>(
        getGraphQLUrl(),
        START_EXPERIMENT,
        { id }
      );
      return data.chaosStartExperiment;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['chaosExperiments'] });
      queryClient.invalidateQueries({ queryKey: ['chaosExperiment', id] });
    },
  });
}

export function useCancelChaosExperiment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const data = await request<{ chaosCancelExperiment: ChaosExperiment }>(
        getGraphQLUrl(),
        CANCEL_EXPERIMENT,
        { id }
      );
      return data.chaosCancelExperiment;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['chaosExperiments'] });
      queryClient.invalidateQueries({ queryKey: ['chaosExperiment', id] });
    },
  });
}
