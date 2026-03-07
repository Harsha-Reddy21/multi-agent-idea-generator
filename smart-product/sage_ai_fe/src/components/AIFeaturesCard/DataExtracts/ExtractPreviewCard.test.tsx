/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { Provenance } from '../../../core/models/data-extracts.model'
import {
  ExtractPreviewCard,
  ExtractPreviewCardProps,
} from './ExtractPreviewCard'

// Mock LDS components
vi.mock('@elilillyco/ux-lds-react', () => ({
  LdsImage: ({ src, alt, className }: any) => (
    <img src={src} alt={alt} className={className} data-testid="lds-image" />
  ),
}))

describe('ExtractPreviewCard', () => {
  const createMockProvenance = (
    overrides?: Partial<Provenance>
  ): Provenance => ({
    text: 'Sample text from the document',
    span_id: 1,
    char_end: 150,
    file_name: 'test-document.pdf',
    block_type: 'paragraph',
    char_start: 100,
    block_index: 5,
    page_or_slide: 3,
    answer: 'Sample answer text',
    question: 'What is the sample question?',
    ...overrides,
  })

  describe('Uploaded Document Type', () => {
    const defaultProps: ExtractPreviewCardProps = {
      provenance: createMockProvenance(),
      documentType: 'uploadedDocument',
    }

    it('renders the extract preview card with correct structure', () => {
      render(<ExtractPreviewCard {...defaultProps} />)

      const article = screen.getByRole('article', { name: 'Extract preview' })
      expect(article).toBeInTheDocument()
    })

    it('displays the excerpt text from provenance.text', () => {
      const mockProvenance = createMockProvenance({
        text: 'This is important content',
      })
      render(
        <ExtractPreviewCard
          provenance={mockProvenance}
          documentType="uploadedDocument"
        />
      )

      expect(
        screen.getByText('...This is important content...')
      ).toBeInTheDocument()
    })

    it('displays the file name', () => {
      const mockProvenance = createMockProvenance({
        file_name: 'my-document.pdf',
      })
      render(
        <ExtractPreviewCard
          provenance={mockProvenance}
          documentType="uploadedDocument"
        />
      )

      expect(screen.getByText('my-document.pdf')).toBeInTheDocument()
    })

    it('displays bookmark icon for uploaded documents', () => {
      render(<ExtractPreviewCard {...defaultProps} />)

      const images = screen.getAllByTestId('lds-image')
      const bookmarkImage = images.find(
        img => img.getAttribute('alt') === 'Bookmark'
      )
      expect(bookmarkImage).toBeInTheDocument()
    })

    it('displays "Page" label for non-slide documents', () => {
      const mockProvenance = createMockProvenance({
        file_name: 'document.pdf',
        page_or_slide: 5,
      })
      render(
        <ExtractPreviewCard
          provenance={mockProvenance}
          documentType="uploadedDocument"
        />
      )

      expect(screen.getByText(/Page.*:.*5/)).toBeInTheDocument()
    })

    it('displays "Slide" label for PowerPoint files (.ppt)', () => {
      const mockProvenance = createMockProvenance({
        file_name: 'presentation.ppt',
        page_or_slide: 10,
      })
      render(
        <ExtractPreviewCard
          provenance={mockProvenance}
          documentType="uploadedDocument"
        />
      )

      expect(screen.getByText(/Slide.*:.*10/)).toBeInTheDocument()
    })

    it('displays "Slide" label for PowerPoint files (.pptx)', () => {
      const mockProvenance = createMockProvenance({
        file_name: 'presentation.pptx',
        page_or_slide: 7,
      })
      render(
        <ExtractPreviewCard
          provenance={mockProvenance}
          documentType="uploadedDocument"
        />
      )

      expect(screen.getByText(/Slide:/)).toBeInTheDocument()
    })

    it('displays "Slide" label for other PowerPoint formats (.pptm, .ppsx, .ppsm)', () => {
      const formats = [
        'presentation.pptm',
        'slides.ppsx',
        'show.ppsm',
        'template.potx',
      ]

      formats.forEach(fileName => {
        const { unmount } = render(
          <ExtractPreviewCard
            provenance={createMockProvenance({ file_name: fileName })}
            documentType="uploadedDocument"
          />
        )
        expect(screen.getByText(/Slide:/)).toBeInTheDocument()
        unmount()
      })
    })

    it('is case-insensitive when detecting slide files', () => {
      const mockProvenance = createMockProvenance({
        file_name: 'PRESENTATION.PPTX',
        page_or_slide: 3,
      })
      render(
        <ExtractPreviewCard
          provenance={mockProvenance}
          documentType="uploadedDocument"
        />
      )

      expect(screen.getByText(/Slide:/)).toBeInTheDocument()
    })

    it('displays paragraph metadata with start and end characters', () => {
      const mockProvenance = createMockProvenance({
        char_start: 250,
        char_end: 400,
      })
      render(
        <ExtractPreviewCard
          provenance={mockProvenance}
          documentType="uploadedDocument"
        />
      )

      expect(screen.getByText(/Paragraph :/)).toBeInTheDocument()
      expect(screen.getByText(/Start : 250/)).toBeInTheDocument()
      expect(screen.getByText(/End : 400/)).toBeInTheDocument()
    })

    it('displays info icon in paragraph metadata', () => {
      render(<ExtractPreviewCard {...defaultProps} />)

      const images = screen.getAllByTestId('lds-image')
      const infoImage = images.find(img => img.getAttribute('alt') === 'Info')
      expect(infoImage).toBeInTheDocument()
    })

    it('shows all metadata for uploaded documents', () => {
      const mockProvenance = createMockProvenance({
        page_or_slide: 8,
        char_start: 100,
        char_end: 200,
      })
      render(
        <ExtractPreviewCard
          provenance={mockProvenance}
          documentType="uploadedDocument"
        />
      )

      // Should show page/slide number, and character range
      expect(screen.getByText(/Page:/)).toBeInTheDocument()
      expect(screen.getByText(/8/)).toBeInTheDocument()
      expect(screen.getByText(/Start : 100/)).toBeInTheDocument()
      expect(screen.getByText(/End : 200/)).toBeInTheDocument()
    })
  })

  describe('Common Field Type', () => {
    const defaultCommonFieldProps: ExtractPreviewCardProps = {
      provenance: createMockProvenance({
        answer: 'The answer to the question',
        question: 'What is your question?',
      }),
      documentType: 'commonField',
    }

    it('renders the extract preview card for common fields', () => {
      render(<ExtractPreviewCard {...defaultCommonFieldProps} />)

      const article = screen.getByRole('article', { name: 'Extract preview' })
      expect(article).toBeInTheDocument()
    })

    it('displays the excerpt from provenance.answer instead of text', () => {
      const mockProvenance = createMockProvenance({
        answer: 'This is the common field answer',
        text: 'This should not appear',
      })
      render(
        <ExtractPreviewCard
          provenance={mockProvenance}
          documentType="commonField"
        />
      )

      expect(
        screen.getByText('...This is the common field answer...')
      ).toBeInTheDocument()
      expect(
        screen.queryByText('...This should not appear...')
      ).not.toBeInTheDocument()
    })

    it('displays the question instead of file name', () => {
      const mockProvenance = createMockProvenance({
        question: 'What is the project name?',
        file_name: 'should-not-appear.pdf',
      })
      render(
        <ExtractPreviewCard
          provenance={mockProvenance}
          documentType="commonField"
        />
      )

      expect(screen.getByText('What is the project name?')).toBeInTheDocument()
      expect(
        screen.queryByText('should-not-appear.pdf')
      ).not.toBeInTheDocument()
    })

    it('displays files icon instead of bookmark for common fields', () => {
      render(<ExtractPreviewCard {...defaultCommonFieldProps} />)

      const images = screen.getAllByTestId('lds-image')
      const filesImage = images.find(img => img.getAttribute('alt') === 'Files')
      expect(filesImage).toBeInTheDocument()
    })

    it('does not display metadata row for common fields', () => {
      render(<ExtractPreviewCard {...defaultCommonFieldProps} />)

      // Metadata should not be present for commonField type
      expect(screen.queryByText(/Page:/)).not.toBeInTheDocument()
      expect(screen.queryByText(/Slide:/)).not.toBeInTheDocument()
      expect(screen.queryByText(/Paragraph :/)).not.toBeInTheDocument()
      expect(screen.queryByText(/Start :/)).not.toBeInTheDocument()
      expect(screen.queryByText(/End :/)).not.toBeInTheDocument()
    })

    it('does not display info icon for common fields', () => {
      render(<ExtractPreviewCard {...defaultCommonFieldProps} />)

      const images = screen.getAllByTestId('lds-image')
      const infoImage = images.find(img => img.getAttribute('alt') === 'Info')
      expect(infoImage).toBeUndefined()
    })
  })

  describe('Edge Cases', () => {
    it('handles empty text/answer gracefully', () => {
      const mockProvenance = createMockProvenance({ text: '' })
      render(
        <ExtractPreviewCard
          provenance={mockProvenance}
          documentType="uploadedDocument"
        />
      )

      expect(screen.getByText('......')).toBeInTheDocument()
    })

    it('handles zero page number', () => {
      const mockProvenance = createMockProvenance({ page_or_slide: 0 })
      render(
        <ExtractPreviewCard
          provenance={mockProvenance}
          documentType="uploadedDocument"
        />
      )

      expect(screen.getByText(/Page.*:.*0/)).toBeInTheDocument()
    })

    it('handles zero character positions', () => {
      const mockProvenance = createMockProvenance({
        char_start: 0,
        char_end: 0,
      })
      render(
        <ExtractPreviewCard
          provenance={mockProvenance}
          documentType="uploadedDocument"
        />
      )

      expect(screen.getByText(/Start : 0/)).toBeInTheDocument()
      expect(screen.getByText(/End : 0/)).toBeInTheDocument()
    })

    it('handles very long text with proper truncation format', () => {
      const longText = 'A'.repeat(500)
      const mockProvenance = createMockProvenance({ text: longText })
      render(
        <ExtractPreviewCard
          provenance={mockProvenance}
          documentType="uploadedDocument"
        />
      )

      expect(screen.getByText(`...${longText}...`)).toBeInTheDocument()
    })

    it('handles file names without extensions', () => {
      const mockProvenance = createMockProvenance({ file_name: 'document' })
      render(
        <ExtractPreviewCard
          provenance={mockProvenance}
          documentType="uploadedDocument"
        />
      )

      expect(screen.getByText(/Page:/)).toBeInTheDocument()
      expect(screen.getByText('document')).toBeInTheDocument()
    })

    it('handles special characters in file names', () => {
      const mockProvenance = createMockProvenance({
        file_name: 'my-doc_final (2023).pdf',
      })
      render(
        <ExtractPreviewCard
          provenance={mockProvenance}
          documentType="uploadedDocument"
        />
      )

      expect(screen.getByText('my-doc_final (2023).pdf')).toBeInTheDocument()
    })

    it('handles special characters in question text', () => {
      const mockProvenance = createMockProvenance({
        question: 'What is the cost ($) & timeline?',
      })
      render(
        <ExtractPreviewCard
          provenance={mockProvenance}
          documentType="commonField"
        />
      )

      expect(
        screen.getByText('What is the cost ($) & timeline?')
      ).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('has proper aria-label on article element', () => {
      const props: ExtractPreviewCardProps = {
        provenance: createMockProvenance(),
        documentType: 'uploadedDocument',
      }
      render(<ExtractPreviewCard {...props} />)

      expect(
        screen.getByRole('article', { name: 'Extract preview' })
      ).toBeInTheDocument()
    })

    it('has descriptive alt text for all images', () => {
      render(
        <ExtractPreviewCard
          provenance={createMockProvenance()}
          documentType="uploadedDocument"
        />
      )

      const images = screen.getAllByTestId('lds-image')
      images.forEach(img => {
        expect(img.getAttribute('alt')).toBeTruthy()
      })
    })
  })

  describe('Component Rendering', () => {
    it('renders without crashing with minimal props', () => {
      const minimalProvenance: Provenance = {
        text: 'text',
        span_id: 1,
        char_end: 10,
        file_name: 'file.pdf',
        block_type: 'type',
        char_start: 0,
        block_index: 0,
        page_or_slide: 1,
        answer: 'answer',
        question: 'question',
      }

      const { container } = render(
        <ExtractPreviewCard
          provenance={minimalProvenance}
          documentType="uploadedDocument"
        />
      )

      expect(container.firstChild).toBeInTheDocument()
    })

    it('applies correct CSS classes', () => {
      const { container } = render(
        <ExtractPreviewCard
          provenance={createMockProvenance()}
          documentType="uploadedDocument"
        />
      )

      const article = container.querySelector('article')
      expect(article?.className).toContain('extractCard')
    })
  })
})
