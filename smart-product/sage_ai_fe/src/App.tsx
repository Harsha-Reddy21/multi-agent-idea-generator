import './App.scss'
import '@elilillyco/ux-lds-react/src/css/lds.css'

import { LdsHeader, LdsToast, LdsToastProvider } from '@elilillyco/ux-lds-react'
import React, { useEffect, useState } from 'react'
import { BrowserRouter, useLocation } from 'react-router-dom'

import websiteLogo from './assets/lilly-long-logo.svg'
import ExtractionStatusBanner from './components/ExtractionStatusBanner'
import Footer from './components/Footer/Footer'
import UserProfile from './components/UserProfile/UserProfile'
import { DataExtractsStatusProvider } from './contexts/DataExtractsStatusContext'
import { ExtractionStatusProvider } from './contexts/ExtractionStatusContext'
import { UserProvider } from './contexts/UserContext'
import { UserSubmissionsProvider } from './contexts/UserSubmissionsContext'
import { userApi } from './core/api/user.api'
import { UserProfile as UserProfileModel } from './core/models/user.model'
import AppRoutes from './routes/AppRoutes'

function App() {
  const AppInner: React.FC = () => {
    const [userProfile, setUserProfile] = useState<UserProfileModel | null>(
      null
    )
    const location = useLocation()

    useEffect(() => {
      const fetchUserInfo = async () => {
        try {
          const profile = await userApi.getUserInfo()
          setUserProfile(profile)
        } catch (error) {
          console.error('Error fetching user info:', error)
        }
      }

      fetchUserInfo()
    }, [])

    return (
      <LdsToastProvider maxToasts={5}>
        <div className="App">
          <ExtractionStatusBanner />
          <main className="App-content">
            <LdsHeader
              className="Lds-header"
              customLogo={
                <img
                  src={websiteLogo}
                  alt="Eli Lilly and Company logo"
                  style={{ padding: '0' }}
                />
              }
            >
              <div className="header-nav-wrapper">
                {userProfile?.anyIdeasSubmitted &&
                  !location.pathname.includes('submitter-dashboard') && (
                    <LdsHeader.Link href="/submitter-dashboard">
                      Dashboard
                    </LdsHeader.Link>
                  )}
                <LdsHeader.Link href="https://ai.lilly.com/frequently-asked-questions">
                  FAQ
                </LdsHeader.Link>
                {userProfile && <UserProfile userProfile={userProfile} />}
              </div>
            </LdsHeader>

            <AppRoutes />
          </main>
          <Footer />
        </div>
        <LdsToast />
      </LdsToastProvider>
    )
  }
  return (
    <BrowserRouter>
      <UserProvider>
        <UserSubmissionsProvider>
          <ExtractionStatusProvider>
            <DataExtractsStatusProvider>
              <AppInner />
            </DataExtractsStatusProvider>
          </ExtractionStatusProvider>
        </UserSubmissionsProvider>
      </UserProvider>
    </BrowserRouter>
  )
}

export default App
