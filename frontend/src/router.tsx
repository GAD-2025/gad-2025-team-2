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
import { ApplicantsList } from './pages/employer/ApplicantsList';
import { ApplicantDetail } from './pages/employer/ApplicantDetail';
import { HireDone } from './pages/employer/HireDone';
import { InterviewProposed } from './pages/employer/InterviewProposed';
import { JobCreate } from './pages/employer/JobCreate';
import { JobEdit } from './pages/employer/JobEdit';
import { Recruitment } from './pages/employer/Recruitment';
import { StoreAdd } from './pages/employer/StoreAdd';
import { StoreEdit } from './pages/employer/StoreEdit';
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
import { LessonContentPage } from './pages/learning/LessonContentPage';
import { LessonTopicQuiz } from './pages/learning/LessonTopicQuiz';
import { LessonDetail } from './pages/learning/LessonDetail';
import { Network } from './pages/network/Network';
import { ProfileEdit } from './pages/profile/ProfileEdit';
import { EmployeeScheduleList } from './pages/employer/EmployeeScheduleList';
import { SharedSchedule } from './pages/employer/SharedSchedule';
import { MySchedule } from './pages/jobseeker/MySchedule';
import { ResumeEdit } from './pages/jobseeker/ResumeEdit';
import { NotFound } from './pages/NotFound';
import { EmployerHelp } from './pages/employer/Help';
import { JobSeekerHelp } from './pages/jobseeker/Help';
import { CommunityDetail } from './pages/network/CommunityDetail';
import { ComingSoon } from './pages/employer/ComingSoon';
import { PostsPage } from './pages/PostsPage';
import { FirstWorkDateEdit } from './pages/employer/FirstWorkDateEdit';
import { HiredConfirmation } from './pages/employer/HiredConfirmation';

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
        path: 'jobseeker/help',
        element: <JobSeekerHelp />,
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
        path: 'employer/applicants',
        element: <ApplicantsList />,
      },
      {
        path: 'employer/help',
        element: <EmployerHelp />,
      },
      {
        path: 'employer/coming-soon',
        element: <ComingSoon />,
      },
      {
        path: 'employer/store-add',
        element: <StoreAdd />,
      },
      {
        path: 'employer/store-edit/:storeId',
        element: <StoreEdit />,
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
        path: 'employer/interview-proposed',
        element: <InterviewProposed />,
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
        path: 'learning/lesson/:lessonId/topic/:topicId',
        element: <LessonContentPage />,
      },
      {
        path: 'learning/lesson/:lessonId/topic/:topicId/quiz',
        element: <LessonTopicQuiz />,
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
        path: 'employer/recruitment',
        element: <Recruitment />,
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
        path: 'employer/first-work-date-edit/:id',
        element: <FirstWorkDateEdit />,
      },
      {
        path: 'employer/hired-confirmation/:applicationId',
        element: <HiredConfirmation />,
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
      {
        path: 'posts',
        element: <PostsPage />,
      },
    ],
  },
  {
    path: '*',
    element: <NotFound />,
  },
]);

