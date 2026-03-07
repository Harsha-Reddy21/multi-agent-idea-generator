import { act,renderHook } from '@testing-library/react'
import { beforeEach,describe, expect, it, vi } from 'vitest'

import { useDataExtracts } from '../useDataExtracts'

// Mock cortexApiService
vi.mock('../../core/api/cortex.api', () => ({
  cortexApiService: {
    getDocExtracts: vi.fn(),
  },
}))

// Mock data extracts status context
vi.mock('../../contexts/DataExtractsStatusContext', () => ({
  useDataExtractsStatus: () => ({
    setIsFileNotFound: vi.fn(),
    resetFileNotFound: vi.fn(),
  }),
}))

import { cortexApiService } from '../../core/api/cortex.api'

describe('useDataExtracts', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const params = { questionId: 'q1', submissionId: 's1', formId: 'f1' }

  it('returns idle status initially and populates on success', async () => {
    const getDocExtractsMock = cortexApiService.getDocExtracts as any
    getDocExtractsMock.mockResolvedValueOnce({
      interaction_id: 'iid-123',
      extracted_content: {
        answer_text: 'Answer from API',
        provenance: [{ file_name: 'Ops.doc' }],
      },
    })

    const { result } = renderHook(() => useDataExtracts(params))

    // The hook starts in loading state
    expect(result.current.fetchStatus).toBe('loading')

    // Wait for effect to run
    await act(async () => {})

    expect(result.current.fetchStatus).toBe('success')
    expect(result.current.answerText).toBe('Answer from API')
    expect(result.current.provenanceList).toEqual([{ file_name: 'Ops.doc' }])
    expect(result.current.interactionId).toBe('iid-123')
  })

  it('sets error state on failure and supports retry', async () => {
    const getDocExtractsMock = cortexApiService.getDocExtracts as any
    getDocExtractsMock.mockRejectedValueOnce({ status: 500 })

    const { result } = renderHook(() => useDataExtracts(params))

    await act(async () => {})
    expect(result.current.fetchStatus).toBe('error')
    expect(result.current.errorMessage).toBeDefined()

    // Retry success path
    getDocExtractsMock.mockResolvedValueOnce({
      interaction_id: 'iid-456',
      extracted_content: {
        answer_text: 'Retry answer',
        provenance: [{ file_name: 'Retry.doc' }],
      },
    })

    await act(async () => {
      result.current.retry()
    })

    expect(result.current.fetchStatus).toBe('success')
    expect(result.current.answerText).toBe('Retry answer')
    expect(result.current.provenanceList).toEqual([{ file_name: 'Retry.doc' }])
    expect(result.current.interactionId).toBe('iid-456')
  })
})
