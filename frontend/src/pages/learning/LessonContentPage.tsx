import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { LESSON_CONTENTS, DialogueContent } from '@/data/lessonContents';

export const LessonContentPage = () => {
  const { lessonId, topicId } = useParams<{ lessonId: string; topicId: string }>();
  const navigate = useNavigate();

  const contentKey = `${lessonId}-${topicId}`;
  console.log('Attempting to load content for key:', contentKey);
  const lessonContent = LESSON_CONTENTS[contentKey as keyof typeof LESSON_CONTENTS];
  console.log('Found content:', lessonContent);

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
