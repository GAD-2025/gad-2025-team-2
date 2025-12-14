import { useState } from 'react';
import { toast } from 'react-toastify';

interface AcceptanceGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: AcceptanceGuideData) => void;
  applicantName?: string;
}

export interface AcceptanceGuideData {
  documents: string[];
  workAttire: string[];
  workNotes: string[];
  message: string;
}

const defaultDocuments = ['통장 사본', '주민등록 사본', '보건증'];
const recommendedDocuments = ['외국인등록증 사본', '학생증', '경력증명서'];
const defaultAttire = ['검정색 바지', '셔츠', '구두', '머리망', '머리끈'];
const recommendedNotes = [
  '위 근무복장 외 착용불가',
  '노출이 많은 의상 지양',
  '화려한 액세서리 지양',
  '진한 향수 사용 지양'
];

export const AcceptanceGuideModal = ({ isOpen, onClose, onConfirm, applicantName }: AcceptanceGuideModalProps) => {
  const [documents, setDocuments] = useState<string[]>(defaultDocuments);
  const [workAttire, setWorkAttire] = useState<string[]>([]);
  const [workNotes, setWorkNotes] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const [showRecommendedDocs, setShowRecommendedDocs] = useState(false);
  const [documentInput, setDocumentInput] = useState('');
  const [attireInput, setAttireInput] = useState('');
  const [noteInput, setNoteInput] = useState('');

  if (!isOpen) return null;

  const handleAddDocument = (doc: string) => {
    if (!documents.includes(doc)) {
      setDocuments([...documents, doc]);
    }
  };

  const handleRemoveDocument = (doc: string) => {
    setDocuments(documents.filter(d => d !== doc));
  };

  const handleAddAttire = (attire: string) => {
    if (!workAttire.includes(attire)) {
      setWorkAttire([...workAttire, attire]);
    }
  };

  const handleRemoveAttire = (attire: string) => {
    setWorkAttire(workAttire.filter(a => a !== attire));
  };

  const handleAddNote = (note: string) => {
    if (!workNotes.includes(note)) {
      setWorkNotes([...workNotes, note]);
    }
  };

  const handleRemoveNote = (note: string) => {
    setWorkNotes(workNotes.filter(n => n !== note));
  };

  const handleDocumentInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && documentInput.trim()) {
      handleAddDocument(documentInput.trim());
      setDocumentInput('');
    }
  };

  const handleAttireInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && attireInput.trim()) {
      handleAddAttire(attireInput.trim());
      setAttireInput('');
    }
  };

  const handleNoteInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && noteInput.trim()) {
      handleAddNote(noteInput.trim());
      setNoteInput('');
    }
  };

  const handleConfirm = () => {
    if (documents.length === 0) {
      toast.error('제출 서류를 최소 1개 이상 선택해주세요');
      return;
    }
    onConfirm({ documents, workAttire, workNotes, message });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-mint-50 rounded-t-[24px] w-full max-w-[480px] max-h-[75vh] flex flex-col">
        {/* Header */}
        <div className="bg-white rounded-t-[24px] px-4 py-3 border-b border-mint-200">
          <h2 className="text-[18px] font-bold text-text-900">근무 전 필수 안내</h2>
          <p className="text-[12px] text-text-500 mt-1">근무 전 필요한 항목을 선택하거나 추가해주세요</p>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
          {/* 📄 제출 서류 */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[16px]">📄</span>
              <h3 className="text-[15px] font-semibold text-text-900">제출 서류</h3>
            </div>
            
            {/* 기본 키워드 Chip */}
            <div className="flex flex-wrap gap-1.5 mb-2">
              {documents.map((doc) => (
                <span
                  key={doc}
                  className="px-3 py-1.5 bg-mint-600 text-white rounded-full text-[12px] font-medium flex items-center gap-1.5"
                >
                  {doc}
                  <button
                    onClick={() => handleRemoveDocument(doc)}
                    className="hover:bg-mint-700 rounded-full p-0.5"
                  >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              ))}
            </div>

            {/* 추천 서류 */}
            <div className="mb-2">
              <button
                onClick={() => setShowRecommendedDocs(!showRecommendedDocs)}
                className="text-[12px] text-mint-600 font-medium flex items-center gap-1"
              >
                추천 키워드
                <svg 
                  className={`w-3 h-3 transition-transform ${showRecommendedDocs ? 'rotate-180' : ''}`}
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {showRecommendedDocs && (
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {recommendedDocuments.map((doc) => (
                    <button
                      key={doc}
                      onClick={() => handleAddDocument(doc)}
                      className="px-2.5 py-1 bg-white border border-mint-300 text-mint-700 rounded-full text-[11px] font-medium hover:bg-mint-100 transition-colors"
                    >
                      + {doc}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 직접 입력 */}
            <input
              type="text"
              value={documentInput}
              onChange={(e) => setDocumentInput(e.target.value)}
              onKeyDown={handleDocumentInputKeyDown}
              placeholder="서류명 입력 후 Enter"
              className="w-full px-3 py-2 bg-white border border-mint-300 rounded-[8px] text-[13px] focus:outline-none focus:ring-2 focus:ring-mint-500"
            />
          </div>

          {/* 👕 근무 복장 */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[16px]">👕</span>
              <h3 className="text-[15px] font-semibold text-text-900">근무 복장</h3>
            </div>

            {/* 기본 추천 */}
            <div className="mb-2">
              <p className="text-[11px] text-text-500 mb-1.5">추천 키워드</p>
              <div className="flex flex-wrap gap-1.5">
                {defaultAttire.map((attire) => (
                  <button
                    key={attire}
                    onClick={() => {
                      if (workAttire.includes(attire)) {
                        handleRemoveAttire(attire);
                      } else {
                        handleAddAttire(attire);
                      }
                    }}
                    className={`px-3 py-1.5 rounded-full text-[12px] font-medium transition-colors ${
                      workAttire.includes(attire)
                        ? 'bg-mint-600 text-white'
                        : 'bg-white border border-mint-300 text-mint-700 hover:bg-mint-100'
                    }`}
                  >
                    {attire}
                  </button>
                ))}
              </div>
            </div>

            {/* 선택된 복장 */}
            {workAttire.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-2">
                {workAttire.map((attire) => (
                  <span
                    key={attire}
                    className="px-3 py-1.5 bg-mint-600 text-white rounded-full text-[12px] font-medium flex items-center gap-1.5"
                  >
                    {attire}
                    <button
                      onClick={() => handleRemoveAttire(attire)}
                      className="hover:bg-mint-700 rounded-full p-0.5"
                    >
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* 직접 입력 */}
            <input
              type="text"
              value={attireInput}
              onChange={(e) => setAttireInput(e.target.value)}
              onKeyDown={handleAttireInputKeyDown}
              placeholder="복장 직접 입력 (Enter)"
              className="w-full px-3 py-2 bg-white border border-mint-300 rounded-[8px] text-[13px] focus:outline-none focus:ring-2 focus:ring-mint-500"
            />
          </div>

          {/* ⚠ 근무 시 유의 사항 */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[16px]">⚠</span>
              <h3 className="text-[15px] font-semibold text-text-900">근무 시 유의 사항</h3>
            </div>

            {/* 추천 항목 */}
            <div className="flex flex-wrap gap-1.5 mb-2">
              {recommendedNotes.map((note) => (
                <button
                  key={note}
                  onClick={() => {
                    if (workNotes.includes(note)) {
                      handleRemoveNote(note);
                    } else {
                      handleAddNote(note);
                    }
                  }}
                  className={`px-3 py-1.5 rounded-full text-[12px] font-medium transition-colors ${
                    workNotes.includes(note)
                      ? 'bg-mint-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {note}
                </button>
              ))}
            </div>

            {/* 선택된 유의 사항 */}
            {workNotes.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-2">
                {workNotes.map((note) => (
                  <span
                    key={note}
                    className="px-3 py-1.5 bg-mint-600 text-white rounded-full text-[12px] font-medium flex items-center gap-1.5"
                  >
                    {note}
                    <button
                      onClick={() => handleRemoveNote(note)}
                      className="hover:bg-mint-700 rounded-full p-0.5"
                    >
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* 직접 입력 */}
            <input
              type="text"
              value={noteInput}
              onChange={(e) => setNoteInput(e.target.value)}
              onKeyDown={handleNoteInputKeyDown}
              placeholder="유의 사항 직접 입력"
              className="w-full px-3 py-2 bg-white border border-mint-300 rounded-[8px] text-[13px] focus:outline-none focus:ring-2 focus:ring-mint-500"
            />
          </div>

          {/* 📝 전달 메시지 */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[16px]">📝</span>
              <h3 className="text-[15px] font-semibold text-text-900">전달 메시지</h3>
            </div>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="예) 첫 출근 시 준비물과 복장을 꼭 확인해주세요."
              rows={2}
              className="w-full px-3 py-2 bg-white border border-mint-300 rounded-[8px] text-[13px] focus:outline-none focus:ring-2 focus:ring-mint-500 resize-none"
            />
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="bg-white border-t border-mint-200 px-4 py-3 space-y-2">
          <button
            onClick={handleConfirm}
            disabled={documents.length === 0}
            className="w-full h-12 bg-mint-600 text-white rounded-[12px] text-[15px] font-semibold hover:bg-mint-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            합격 안내 보내기
          </button>
          <button
            onClick={onClose}
            className="w-full h-12 bg-white border-2 border-mint-300 text-mint-700 rounded-[12px] text-[15px] font-semibold hover:bg-mint-50 transition-colors"
          >
            나중에 설정하기
          </button>
        </div>
      </div>
    </div>
  );
};
