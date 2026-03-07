import React from 'react'
import { Route, Routes } from 'react-router-dom'

import InitialRoute from '../components/InitialRoute/InitialRoute'
import ProtectedRoute from '../components/ProtectedRoute/ProtectedRoute'
import AIRegistryForm from '../pages/AIRegistryForm/AIRegistryForm'
import BeginSubmission from '../pages/BeginSubmission/BeginSubmission'
import DigitalLegalOffice from '../pages/DigitalLegalOffice/DigitalLegalOffice'
import FormDashboard from '../pages/FormDashboard/FormDashboard'
import IdeaSubmissionForm from '../pages/IdeaSubmission/IdeaSubmissionForm'
import LandingPage from '../pages/Landing/LandingPage'
import SecurityAndEng from '../pages/SecurityAndEng/SecurityAndEng'
import SubmitterDashboard from '../pages/SubmitterDashboard/SubmitterDashboard'
import WnvVendorEngagement from '../pages/WnvVendorEngagement/WnvVendorEngagement'
import WorkingWithThirdParty from '../pages/WorkingWithThirdParty/WorkingWithThirdParty'

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<InitialRoute />} />
      <Route
        path="/landing"
        element={
          <ProtectedRoute requiresNoSubmissions>
            <LandingPage />
          </ProtectedRoute>
        }
      />
      <Route path="/begin" element={<BeginSubmission />} />
      <Route
        path="/idea-submission/:formId/:submissionId"
        element={<IdeaSubmissionForm />}
      />
      <Route path="/form-dashboard/:submissionId" element={<FormDashboard />} />
      <Route
        path="/submitter-dashboard"
        element={<SubmitterDashboard userName="" />}
      />
      <Route
        path="/ai-registry/:formId/:submissionId"
        element={<AIRegistryForm />}
      />
      <Route
        path="/digital-legal-office/:formId/:submissionId"
        element={<DigitalLegalOffice />}
      />
      <Route
        path="/working-with-third-party/:formId/:submissionId"
        element={<WorkingWithThirdParty />}
      />
      <Route
        path="/wnv-vendor-engagement/:formId/:submissionId"
        element={<WnvVendorEngagement />}
      />
      <Route
        path="/security-and-engineering/:formId/:submissionId"
        element={<SecurityAndEng />}
      />
    </Routes>
  )
}

export default AppRoutes
