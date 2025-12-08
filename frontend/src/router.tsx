import { createBrowserRouter } from 'react-router-dom';
import { AppLayout } from './pages/layout/AppLayout';
import { Home } from './pages/Home';
import { JobSeekerHome } from './pages/jobseeker/Home';
import { JobList } from './pages/jobseeker/JobList';
import { JobDetail } from './pages/jobseeker/JobDetail';
import { ApplyDone } from './pages/jobseeker/ApplyDone';
import { MyApplications } from './pages/jobseeker/MyApplications';
import { TalentFilter } from './pages/filters/TalentFilter';
import { ApplicantFilter } from './pages/filters/ApplicantFilter';
import { EmployerHome } from './pages/employer/EmployerHome';
import { ApplicantDetail } from './pages/employer/ApplicantDetail';
import { HireDone } from './pages/employer/HireDone';
import { JobCreate } from './pages/employer/JobCreate';
import { JobEdit } from './pages/employer/JobEdit';
import { Recruitment } from './pages/employer/Recruitment';
import { StoreAdd } from './pages/employer/StoreAdd';
import { JobManagement } from './pages/employer/JobManagement';
import { JobDetailForEmployer } from './pages/employer/JobDetailForEmployer';
import { MessageList } from './pages/messages/List';
import { Chat } from './pages/messages/Chat';
import { SignIn } from './pages/auth/SignIn';
import { SignUp } from './pages/auth/SignUp';
import { AutoRedirect } from './pages/auth/AutoRedirect';
import Onboarding from './pages/auth/Onboarding';
import EmployerSignupWizard from './features/auth/signup/EmployerSignupWizard';
import { MyPage } from './pages/mypage/MyPage';
import { LearningHome } from './pages/learning/LearningHome';
import { LevelTest } from './pages/learning/LevelTest';
import { LessonQuiz } from './pages/learning/LessonQuiz';
import { LessonDetail } from './pages/learning/LessonDetail';
import { Network } from './pages/network/Network';
import { ProfileEdit } from './pages/profile/ProfileEdit';
import { EmployeeScheduleList } from './pages/employer/EmployeeScheduleList';
import { SharedSchedule } from './pages/employer/SharedSchedule';
import { MySchedule } from './pages/jobseeker/MySchedule';
import { ResumeEdit } from './pages/jobseeker/ResumeEdit';
import { NotFound } from './pages/NotFound';
import { CommunityDetail } from './pages/network/CommunityDetail';

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
    path: '/signup/employer',
    element: <EmployerSignupWizard />,
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
    path: '/auth/signin',
    element: <SignIn />,
  },
  {
    path: '/',
    element: <AppLayout />,
    children: [
      {
        path: 'jobseeker/home',
        element: <JobSeekerHome />,
      },
      {
        path: 'job/:id',
        element: <JobDetail />,
      },
      {
        path: 'jobseeker/apply-done',
        element: <ApplyDone />,
      },
      {
        path: 'filters/talent',
        element: <TalentFilter />,
      },
      {
        path: 'filters/applicant',
        element: <ApplicantFilter />,
      },
      {
        path: 'employer/home',
        element: <EmployerHome />,
      },
      {
        path: 'employer/store-add',
        element: <StoreAdd />,
      },
      {
        path: 'applicant/:id',
        element: <ApplicantDetail />,
      },
      {
        path: 'employer/hire-done',
        element: <HireDone />,
      },
      {
        path: 'messages',
        element: <MessageList />,
      },
      {
        path: 'messages/:id',
        element: <Chat />,
      },
      {
        path: 'jobs',
        element: <JobList />,
      },
      {
        path: 'jobs/:id',
        element: <JobDetail />,
      },
      {
        path: 'my-applications',
        element: <MyApplications />,
      },
      {
        path: 'resume/edit',
        element: <ResumeEdit />,
      },
      {
        path: 'learning',
        element: <LearningHome />,
      },
      {
        path: 'learning/level-test',
        element: <LevelTest />,
      },
      {
        path: 'learning/lesson/:id',
        element: <LessonDetail />,
      },
      {
        path: 'learning/lesson/:id/quiz',
        element: <LessonQuiz />,
      },
      {
        path: 'network',
        element: <Network />,
      },
      {
        path: 'network/community/:id',
        element: <CommunityDetail />,
      },
      {
        path: 'employer/job-create',
        element: <JobCreate />,
      },
      {
        path: 'employer/job/:id',
        element: <JobDetailForEmployer />,
      },
      {
        path: 'employer/job-edit/:id',
        element: <JobEdit />,
      },
      {
        path: 'recruitment',
        element: <Recruitment />,
      },
      {
        path: 'job-management',
        element: <JobManagement />,
      },
      {
        path: 'employer/applicant/:id',
        element: <ApplicantDetail />,
      },
      {
        path: 'employer/schedule',
        element: <EmployeeScheduleList />,
      },
      {
        path: 'employer/schedule/:userId',
        element: <SharedSchedule />,
      },
      {
        path: 'jobseeker/schedule',
        element: <MySchedule />,
      },
      {
        path: 'profile/edit',
        element: <ProfileEdit />,
      },
      {
        path: 'mypage',
        element: <MyPage />,
      },
    ],
  },
  {
    path: '*',
    element: <NotFound />,
  },
]);

