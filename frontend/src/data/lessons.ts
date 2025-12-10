export interface Lesson {
  id: string;
  title: string;
  level: string;
  description: string;
  objectives: string[];
  duration: string;
  topics: {
    id: string;
    title: string;
  }[];
}

export const LESSONS_DATA: Lesson[] = [
  {
    id: '1',
    title: '한국어 기본 문법',
    level: 'Lv.1 기초',
    description: '한국어의 기초 문법을 배웁니다.',
    objectives: ['문장 구조 이해', '기본 조사 사용'],
    duration: '약 1주',
    topics: [
      { id: '1', title: '1강. 안녕하세요' },
      { id: '2', title: '2강. 저는 학생입니다' },
    ],
  },
  {
    id: '2',
    title: '한국어 어휘 확장',
    level: 'Lv.2 초급',
    description: '다양한 상황에서 사용할 수 있는 어휘를 학습합니다.',
    objectives: ['100개 신규 단어 암기', '상황별 어휘 사용'],
    duration: '약 2주',
    topics: [
      { id: '1', title: '1강. 음식 주문하기' },
      { id: '2', title: '2강. 길 묻기' },
    ],
  },
  {
    id: '3',
    title: '일상 대화 연습',
    level: 'Lv.3 중급',
    description: '자연스러운 한국어 대화를 연습합니다.',
    objectives: ['친구와 대화하기', '가게에서 물건 사기'],
    duration: '약 3주',
    topics: [
      { id: '1', title: '1강. 자기소개' },
      { id: '2', title: '2강. 취미 이야기하기' },
    ],
  },
  {
    id: '4',
    title: '비즈니스 한국어',
    level: 'Lv.4 상급',
    description: '직장에서 필요한 비즈니스 한국어를 배웁니다. 이메일 작성, 전화 응대, 회의 참석 등 실무에서 바로 사용할 수 있는 표현들을 학습합니다.',
    objectives: [
      '비즈니스 이메일을 작성할 수 있다',
      '전화로 정중하게 대화할 수 있다',
      '회의에서 의견을 표현할 수 있다',
      '보고서를 작성할 수 있다'
    ],
    duration: '약 2주 소요',
    topics: [
      { id: '1', title: '1강. 비즈니스 인사와 소개' },
      { id: '2', title: '2강. 이메일 작성 기초' },
      { id: '3', title: '3강. 전화 응대 표현' },
      { id: '4', 'title': '4강. 회의 진행 표현' },
      { id: '5', 'title': '5강. 보고서 작성 연습' },
    ]
  },
  {
    id: '5',
    title: '고급 문법',
    level: 'Lv.4 상급',
    description: '복잡한 문장 구조와 고급 문법을 학습합니다.',
    objectives: ['뉴스 기사 읽기', '논리적으로 글쓰기'],
    duration: '약 4주',
    topics: [
      { id: '1', title: '1강. 피동 표현' },
      { id: '2', title: '2강. 사동 표현' },
    ],
  },
];
