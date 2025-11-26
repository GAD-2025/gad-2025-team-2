import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppLayout } from './pages/layout/AppLayout';
import { Home } from './pages/Home';
import { JobSeekerHome } from './pages/jobseeker/Home';
import { JobList } from './pages/jobseeker/JobList';
import { JobDetail } from './pages/jobseeker/JobDetail';
import { ApplyDone } from './pages/jobseeker/ApplyDone';
import { MyApplications } from './pages/jobseeker/MyApplications';
import { TalentFilter } from './pages/filters/TalentFilter';
import { ApplicantFilter } from './pages/filters/ApplicantFilter';
import { EmployerHome as EmployerHomeOriginal } from './pages/employer/Home';
import { EmployerHome } from './pages/employer/EmployerHome';
import { ApplicantDetail } from './pages/employer/ApplicantDetail';
import { HireDone } from './pages/employer/HireDone';
import { JobCreate } from './pages/employer/JobCreate';
import { Recruitment } from './pages/employer/Recruitment';
import { JobManagement } from './pages/employer/JobManagement';
import { MessageList } from './pages/messages/List';
import { Chat } from './pages/messages/Chat';
import { SignIn } from './pages/auth/SignIn';
import { SignUp } from './pages/auth/SignUp';
import { AutoRedirect } from './pages/auth/AutoRedirect';
import Onboarding from './pages/auth/Onboarding';
//import EmployerSignupWizard from './features/auth/employerSignup/EmployerSignupWizard';
import { MyPage } from './pages/mypage/MyPage';
import { LearningHome } from './pages/learning/LearningHome';
import { LevelTest } from './pages/learning/LevelTest';
import { LessonDetail } from './pages/learning/LessonDetail';
import { Network } from './pages/network/Network';
import { ProfileEdit } from './pages/profile/ProfileEdit';
import { EmployeeScheduleList } from './pages/employer/EmployeeScheduleList';
import { SharedSchedule } from './pages/employer/SharedSchedule';
import { MySchedule } from './pages/jobseeker/MySchedule';
//import { NotFound } from './pages/NotFound';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AutoRedirect />,
  },
  {
    path: '/signup',
    element: <SignUp />,
  },
  {
    path: '/onboarding',
    element: <Onboarding />,
  },
  {
    path: '/home',
    element: <Home />,
  },
  {
    path: '/mypage',
    element: <MyPage />,
  },
]);
