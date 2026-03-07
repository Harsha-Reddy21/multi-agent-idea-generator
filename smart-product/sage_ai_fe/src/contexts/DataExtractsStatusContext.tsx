import React, { createContext, useContext, useMemo, useState } from 'react'

import { DataExtractsStatusContextType } from '../core/models/enhance-answer.model'

const DataExtractsStatusContext = createContext<
  DataExtractsStatusContextType | undefined
>(undefined)

export const useDataExtractsStatus = () => {
  const context = useContext(DataExtractsStatusContext)
  if (!context) {
    throw new Error(
      'useDataExtractsStatus must be used within DataExtractsStatusProvider'
    )
  }
  return context
}

interface DataExtractsStatusProviderProps {
  children: React.ReactNode
}

export const DataExtractsStatusProvider: React.FC<
  DataExtractsStatusProviderProps
> = ({ children }) => {
  const [isFileNotFound, setIsFileNotFound] = useState<boolean>(false)

  const resetFileNotFound = () => {
    setIsFileNotFound(false)
  }

  const value = useMemo(
    () => ({
      isFileNotFound,
      setIsFileNotFound,
      resetFileNotFound,
    }),
    [isFileNotFound]
  )

  return (
    <DataExtractsStatusContext.Provider value={value}>
      {children}
    </DataExtractsStatusContext.Provider>
  )
}
