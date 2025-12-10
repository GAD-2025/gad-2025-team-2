import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';

// Define types for the content structure
interface GrammarContent {
  type: 'grammar';
  title: string;
  explanation: string;
  examples: string[];
}

interface DialogueContent {
  type: 'dialogue';
  title: string;
  conversation: { speaker: string; line: string }[];
}

interface TipContent {
  type: 'tip';
  title: string;
  content: string;
}

type ContentItem = GrammarContent | DialogueContent | TipContent;

interface LessonData {
  title: string;
  content: ContentItem[];
  quiz: {
    question: string;
    options: string[];
    answer: string;
    quizExplanation: string;
  };
}

const LESSON_CONTENTS: { [key: string]: LessonData } = {
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
      question: '빈칸에 들어갈 올바른 조사는? "이것__ 책입니다."',
      options: ['은', '는', '이', '가'],
      answer: '은',
      quizExplanation: '명사 "이것"은 받침(ㅅ)으로 끝나므로 뒤에 "은"이 와야 합니다.',
    },
  },
};

export const LessonContentPage = () => {
  const { lessonId, topicId } = useParams<{ lessonId: string; topicId: string }>();
  const navigate = useNavigate();

  const contentKey = `${lessonId}-${topicId}`;
  const lessonContent = LESSON_CONTENTS[contentKey as keyof typeof LESSON_CONTENTS];

  const goToQuiz = () => navigate(`/learning/lesson/${lessonId}/topic/${topicId}/quiz`);

  if (!lessonContent) {
    return <div>콘텐츠를 찾을 수 없습니다.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <Header title={lessonContent.title} showBack />
      <div className="p-6 space-y-6">
        {lessonContent.content.map((item, index) => {
          let content;
          switch (item.type) {
            case 'grammar':
              content = (
                <>
                  <p className="text-gray-700 mb-4">{item.explanation}</p>
                  <div className="space-y-2">
                    {item.examples.map((ex, i) => (
                      <p key={i} className="text-sm text-gray-600 pl-2 border-l-2 border-mint-200">
                        <span className="font-semibold">예)</span> {ex}
                      </p>
                    ))}
                  </div>
                </>
              );
              break;
            case 'dialogue':
              const dialogueItem = item as DialogueContent;
              content = (
                <div className="space-y-2">
                  {dialogueItem.conversation?.map((chat, i) => (
                    <p key={i}><span className="font-bold">{chat.speaker}:</span> {chat.line}</p>
                  ))}
                </div>
              );
              break;
            case 'tip':
              content = <p className="text-gray-700">{item.content}</p>;
              break;
            default:
              content = null;
          }

          return (
            <div key={index} className="bg-white p-5 rounded-lg shadow">
              <h2 className="text-xl font-bold text-mint-700 mb-3">{item.title}</h2>
              {content}
            </div>
          );
        })}

        <button
          onClick={goToQuiz}
          className="w-full h-12 bg-mint-600 text-white rounded-lg font-semibold"
        >
          연습문제 풀러가기
        </button>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t">
        <button
          onClick={goToQuiz}
          className="w-full h-12 bg-mint-600 text-white rounded-lg font-semibold"
        >
          문제 풀기
        </button>
      </div>
    </div>
  );
};
