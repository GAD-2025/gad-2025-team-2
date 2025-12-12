// Define types for the content structure
export interface GrammarContent {
  type: 'grammar';
  title: string;
  explanation: string;
  examples: string[];
}

export interface DialogueContent {
  type: 'dialogue';
  title: string;
  conversation: { speaker: string; line: string }[];
}

export interface TipContent {
  type: 'tip';
  title: string;
  content: string;
}

export type ContentItem = GrammarContent | DialogueContent | TipContent;

export interface LessonData {
  title: string;
  content: ContentItem[];
  quiz: {
    question: string;
    options: string[];
    answer: string;
    quizExplanation: string;
  };
}

export const LESSON_CONTENTS: { [key: string]: LessonData } = {
  '1-1': {
    title: '1강. 안녕하세요',
    content: [
      {
        type: 'grammar',
        title: '안녕하세요 (Annyeonghaseyo)',
        explanation: '가장 기본적인 인사말로, "Hello", "Good morning/afternoon/evening"의 의미를 가집니다. 처음 만나는 사람이나 윗사람에게 정중하게 인사할 때 사용합니다.',
        examples: [
          '가게에 들어갈 때: 안녕하세요.',
          '새로운 사람을 만났을 때: 안녕하세요, 저는 [이름]입니다.',
        ],
      },
      {
        type: 'grammar',
        title: '감사합니다 (Gamsahamnida)',
        explanation: '"Thank you"라는 의미의 정중한 표현입니다. 도움을 받았거나 고마움을 표현하고 싶을 때 사용합니다.',
        examples: [
          '물건을 건네받을 때: 감사합니다.',
          '칭찬을 들었을 때: 감사합니다!',
        ],
      },
      {
        type: 'grammar',
        title: '죄송합니다 (Joesonghamnida)',
        explanation: '"I\'m sorry"라는 의미의 정중한 사과 표현입니다. 실수했거나 미안함을 표현할 때 사용합니다.',
        examples: [
          '실수로 다른 사람과 부딪혔을 때: 죄송합니다.',
          '약속에 늦었을 때: 늦어서 죄송합니다.',
        ],
      },
      {
        type: 'dialogue',
        title: '대화 예시',
        conversation: [
          { speaker: 'A', line: '안녕하세요!' },
          { speaker: 'B', line: '네, 안녕하세요! 반갑습니다.' },
        ],
      },
      {
        type: 'tip',
        title: '문화 팁',
        content: '한국에서는 인사할 때 가볍게 고개를 숙이는 것이 예의입니다. 특히 윗사람에게는 허리를 좀 더 숙여 존경을 표합니다.',
      },
    ],
    quiz: {
      question: '다음 중 "Thank you"를 의미하는 한국어 표현은 무엇일까요?',
      options: ['안녕하세요', '감사합니다', '죄송합니다'],
      answer: '감사합니다',
      quizExplanation: '"감사합니다"는 "Thank you"라는 뜻입니다. "안녕하세요"는 "Hello", "죄송합니다"는 "I\'m sorry"를 의미합니다.',
    },
  },
  '1-2': {
    title: '2강. 저는 학생입니다',
    content: [
      {
        type: 'grammar',
        title: '입니다 (imnida)',
        explanation: '"입니다"는 명사 뒤에 붙어 "~is/am/are"의 의미를 나타내는 서술격 조사입니다. 자신이나 다른 사물을 소개할 때 사용되는 정중한 표현입니다.',
        examples: [
          '저는 학생입니다. (I am a student.)',
          '이것은 책입니다. (This is a book.)',
          '저 사람은 의사입니다. (That person is a doctor.)',
        ],
      },
      {
        type: 'grammar',
        title: '은/는 (eun/neun)',
        explanation: '주제가 되는 명사 뒤에 붙는 보조사입니다. 명사의 마지막 글자에 받침이 있으면 "은"을, 받침이 없으면 "는"을 사용합니다.',
        examples: [
          '저**는** 학생입니다. (I am a student.) - "저"에 받침 없음',
          '이것**은** 책입니다. (This is a book.) - "것"에 받침 있음',
        ],
      },
      {
        type: 'dialogue',
        title: '자기소개 예시',
        conversation: [
          { speaker: 'A', line: '안녕하세요. 저는 김민준입니다.' },
          { speaker: 'B', line: '안녕하세요. 저는 마이클입니다. 학생입니다.' },
        ],
      },
    ],
    quiz: {
      question: '빈칸에 들어갈 올바른 조사는? "이것__ 책입니다." ',
      options: ['은', '는', '이', '가'],
      answer: '은',
      quizExplanation: '명사 "이것"은 받침(ㅅ)으로 끝나므로 뒤에 "은"이 와야 합니다.',
    },
  },
  '2-1': {
    title: '1강. 음식 주문하기',
    content: [
      {
        type: 'grammar',
        title: '주세요 (Juseyo)',
        explanation: '"주세요"는 무언가를 요청할 때 사용하는 가장 일반적인 표현입니다. 명사 뒤에 붙여 사용합니다.',
        examples: [
          '물 주세요. (Please give me water.)',
          '이거 주세요. (Please give me this.)',
        ],
      },
      {
        type: 'dialogue',
        title: '대화 예시',
        conversation: [
          { speaker: '손님', line: '안녕하세요. 주문할게요.' },
          { speaker: '점원', line: '네, 안녕하세요. 무엇을 드릴까요?' },
          { speaker: '손님', line: '김밥 한 줄 주세요.' },
          { speaker: '점원', line: '네, 알겠습니다.' },
        ],
      },
    ],
    quiz: {
      question: '"I would like to order"를 한국어로 어떻게 말할까요?',
      options: ['주문할게요', '얼마예요?', '이거 주세요'],
      answer: '주문할게요',
      quizExplanation: '"주문할게요"는 "I would like to order"의 자연스러운 표현입니다.',
    },
  },
  '2-2': {
    title: '2강. 길 묻기',
    content: [
      {
        type: 'grammar',
        title: '어디예요? (Eodiyeyo?)',
        explanation: '"어디예요?"는 장소의 위치를 물을 때 사용하는 표현입니다. 장소 명사 뒤에 붙여 사용합니다.',
        examples: [
          '화장실 어디예요? (Where is the restroom?)',
          '시청 어디예요? (Where is the city hall?)',
        ],
      },
      {
        type: 'dialogue',
        title: '대화 예시',
        conversation: [
          { speaker: '관광객', line: '실례합니다. 경복궁이 어디예요?' },
          { speaker: '행인', line: '여기서 쭉 직진하시면 돼요.' },
        ],
      },
    ],
    quiz: {
      question: '"Where is the restroom?"을 한국어로 어떻게 말할까요?',
      options: ['화장실 어디예요?', '여기 어디예요?', '이거 뭐예요?'],
      answer: '화장실 어디예요?',
      quizExplanation: '"화장실 어디예요?"는 화장실의 위치를 묻는 정확한 표현입니다.',
    },
  },
  '3-1': {
    title: '1강. 자기소개',
    content: [
      {
        type: 'grammar',
        title: '저는 OOO입니다',
        explanation: '자신을 소개하는 가장 기본적인 표현입니다.',
        examples: ['저는 김민준입니다.', '저는 학생입니다.'],
      },
    ],
    quiz: {
      question: '자신을 소개할 때 "My name is"를 어떻게 표현할까요?',
      options: ['제 이름은...입니다', '저는...입니다', '둘 다 가능'],
      answer: '둘 다 가능',
      quizExplanation: '"제 이름은 [이름]입니다"와 "저는 [이름]입니다" 둘 다 자신을 소개하는 올바른 표현입니다.',
    },
  },
  '3-2': {
    title: '2강. 취미 이야기하기',
    content: [
      {
        type: 'grammar',
        title: '제 취미는 OOO입니다',
        explanation: '자신의 취미를 소개하는 표현입니다.',
        examples: ['제 취미는 독서입니다.', '제 취미는 영화 보기입니다.'],
      },
    ],
    quiz: {
      question: '취미를 물어볼 때 "What is your hobby?"를 어떻게 표현할까요?',
      options: ['취미가 뭐예요?', '뭐 좋아해요?', '둘 다 가능'],
      answer: '둘 다 가능',
      quizExplanation: '"취미가 뭐예요?"와 "뭐 좋아해요?" 둘 다 상대방의 취미를 물어볼 때 사용할 수 있는 자연스러운 표현입니다.',
    },
  },
  '4-1': {
    title: '1강. 비즈니스 인사와 소개',
    content: [
      {
        type: 'grammar',
        title: 'OOO에서 온 OOO입니다',
        explanation: '비즈니스 상황에서 자신의 소속과 이름을 밝히는 표현입니다.',
        examples: ['ABC 회사에서 온 김민준입니다.'],
      },
    ],
    quiz: {
      question: '비즈니스 미팅에서 처음 만난 사람에게 자신을 소개할 때 적절한 표현은?',
      options: ['만나서 반가워요', '만나서 반갑습니다. 저는 OOO입니다.', '수고하셨습니다'],
      answer: '만나서 반갑습니다. 저는 OOO입니다.',
      quizExplanation: '비즈니스 상황에서는 "만나서 반갑습니다"와 같이 격식 있고 완전한 문장으로 자신을 소개하는 것이 좋습니다.',
    },
  },
  '4-2': {
    title: '2강. 이메일 작성 기초',
    content: [
      {
        type: 'grammar',
        title: 'OOO 드림 / OOO 올림',
        explanation: '비즈니스 이메일의 끝인사로 사용하는 표현입니다.',
        examples: ['감사합니다. 김민준 드림.'],
      },
    ],
    quiz: {
      question: '비즈니스 이메일의 끝인사로 적절한 것은?',
      options: ['안녕히 계세요', '수고하세요', '감사합니다. OOO 드림'],
      answer: '감사합니다. OOO 드림',
      quizExplanation: '"OOO 드림" 또는 "OOO 올림"은 이메일을 정중하게 마무리하는 표현입니다.',
    },
  },
};
