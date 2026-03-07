import { LdsImage } from '@elilillyco/ux-lds-react'
import React from 'react'

import bookmarkIcon from '../../../assets/bookmark.svg'
import files from '../../../assets/Files.svg'
import infoIcon from '../../../assets/Info.svg'
import { Provenance } from '../../../core/models/data-extracts.model'
import styles from './ExtractPreviewCard.module.scss'

export interface ExtractPreviewCardProps {
  provenance: Provenance
  documentType: 'uploadedDocument' | 'commonField'
}

export const ExtractPreviewCard: React.FC<ExtractPreviewCardProps> = ({
  provenance,
  documentType,
}) => {
  const isSlide = /\.(ppt|pptx|pptm|ppsx|ppsm|potx|potm|pot|pps)$/i.test(
    provenance.file_name
  )

  return (
    <article className={styles.extractCard} aria-label="Extract preview">
      <div className={styles.extractCardTop}>
        <p
          className={styles.extractExcerpt}
        >{`...${documentType === 'commonField' ? provenance.answer : provenance.text}...`}</p>
      </div>
      <div className={styles.extractCardBottom}>
        <div className={styles.fileRow}>
          <LdsImage
            src={documentType === 'commonField' ? files : bookmarkIcon}
            alt={documentType === 'commonField' ? 'Files' : 'Bookmark'}
            className={styles.bookmarkIcon}
          />
          <h6 className={styles.fileName}>
            {documentType === 'commonField'
              ? provenance.question
              : provenance.file_name}
          </h6>
        </div>
        {documentType === 'uploadedDocument' && (
          <div className={styles.metaRow}>
            <p className={styles.info}>
              {isSlide ? 'Slide' : 'Page'}: {provenance.page_or_slide}
            </p>
            <p className={styles.info}>
              <span className={styles.paragraph_icon}>
                Paragraph :{' '}
                <LdsImage
                  src={infoIcon}
                  alt="Info"
                  className={styles.infoIcon}
                />
              </span>
              <span>Start : {provenance.char_start}</span>
              <span>End : {provenance.char_end}</span>
            </p>
          </div>
        )}
      </div>
    </article>
  )
}

export default ExtractPreviewCard
