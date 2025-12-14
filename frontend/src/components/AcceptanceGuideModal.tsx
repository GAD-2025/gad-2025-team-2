import { useState, useEffect } from 'react';
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
  firstWorkDate?: string; // YYYY-MM-DD format
  firstWorkTime?: string; // HH:mm format
  coordinationMessage?: string; // 조율 메시지
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
  const [showRecommendedDocs, setShowRecommendedDocs] = useState(false);
  const [documentInput, setDocumentInput] = useState('');
  const [attireInput, setAttireInput] = useState('');
  const [noteInput, setNoteInput] = useState('');
  
  // 첫 출근 날짜/시간
  const [firstWorkDate, setFirstWorkDate] = useState<string>('');
  const [firstWorkTime, setFirstWorkTime] = useState<string>('');
  const [customTime, setCustomTime] = useState<string>('');
  const [useCustomTime, setUseCustomTime] = useState(false);
  const [currentMonthOffset, setCurrentMonthOffset] = useState<number>(0);
  
  // 조율 메시지
  const [coordinationMessage, setCoordinationMessage] = useState('');

  // 모달이 열릴 때 초기화
  useEffect(() => {
    if (isOpen) {
      setDocuments(defaultDocuments);
      setWorkAttire([]);
      setWorkNotes([]);
      setFirstWorkDate('');
      setFirstWorkTime('');
      setCustomTime('');
      setUseCustomTime(false);
      setCoordinationMessage('');
      setCurrentMonthOffset(0);
    }
  }, [isOpen]);

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

  // 시간 옵션 생성 (30분 단위, 09:00 ~ 20:00)
  const timeOptions = [];
  for (let hour = 9; hour <= 20; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      timeOptions.push(timeStr);
    }
  }

  // 날짜 선택 핸들러
  const handleDateSelect = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    setFirstWorkDate(dateStr);
  };

  // 캘린더 관련 함수들
  const today = new Date();
  const displayDate = new Date(today.getFullYear(), today.getMonth() + currentMonthOffset, 1);
  const firstDayOfMonth = new Date(displayDate.getFullYear(), displayDate.getMonth(), 1).getDay();
  const daysInMonth = new Date(displayDate.getFullYear(), displayDate.getMonth() + 1, 0).getDate();
  
  const getDaysArray = () => {
    const days = [];
    // 빈 칸 (첫 주 시작 전)
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null);
    }
    // 날짜들
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(displayDate.getFullYear(), displayDate.getMonth(), day);
      days.push(date);
    }
    return days;
  };

  const isDateSelectable = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date >= today;
  };

  const handleConfirm = () => {
    if (documents.length === 0) {
      toast.error('제출 서류를 최소 1개 이상 선택해주세요');
      return;
    }
    
    const finalTime = useCustomTime && customTime.trim() ? customTime.trim() : firstWorkTime;
    
    onConfirm({ 
      documents, 
      workAttire, 
      workNotes, 
      firstWorkDate: firstWorkDate || undefined,
      firstWorkTime: finalTime || undefined,
      coordinationMessage: coordinationMessage.trim() || undefined,
    });
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

            {/* 추천 키워드 */}
            <div className="mb-2">
              <p className="text-[11px] text-text-500 mb-1.5">추천 키워드</p>
              <div className="flex flex-wrap gap-1.5">
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

          {/* 📅 첫 출근 날짜 */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[16px]">📅</span>
              <h3 className="text-[15px] font-semibold text-text-900">첫 출근 날짜</h3>
            </div>
            
            {/* 월 네비게이션 */}
            <div className="flex items-center justify-between mb-3">
              <button
                onClick={() => setCurrentMonthOffset(Math.max(0, currentMonthOffset - 1))}
                disabled={currentMonthOffset === 0}
                className="p-1.5 rounded-[6px] hover:bg-mint-100 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5 text-mint-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <span className="text-[14px] font-semibold text-text-900">
                {displayDate.getFullYear()}년 {displayDate.getMonth() + 1}월
              </span>
              <button
                onClick={() => setCurrentMonthOffset(currentMonthOffset + 1)}
                className="p-1.5 rounded-[6px] hover:bg-mint-100"
              >
                <svg className="w-5 h-5 text-mint-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* 캘린더 */}
            <div className="bg-white border border-mint-300 rounded-[8px] p-3 mb-2">
              <div className="grid grid-cols-7 gap-1 mb-2">
                {['일', '월', '화', '수', '목', '금', '토'].map((day) => (
                  <div key={day} className="text-center text-[11px] font-medium text-text-500 py-1">
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {getDaysArray().map((date, idx) => {
                  if (!date) {
                    return <div key={idx} className="aspect-square" />;
                  }
                  const dateStr = date.toISOString().split('T')[0];
                  const isSelected = firstWorkDate === dateStr;
                  const isSelectable = isDateSelectable(date);
                  const isToday = dateStr === new Date().toISOString().split('T')[0];
                  
                  return (
                    <button
                      key={idx}
                      onClick={() => isSelectable && handleDateSelect(date)}
                      disabled={!isSelectable}
                      className={`aspect-square rounded-[6px] text-[12px] font-medium transition-colors ${
                        isSelected
                          ? 'bg-mint-600 text-white'
                          : isToday
                          ? 'bg-mint-100 text-mint-700 border border-mint-300'
                          : isSelectable
                          ? 'bg-white text-text-700 hover:bg-mint-50 border border-mint-200'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {date.getDate()}
                    </button>
                  );
                })}
              </div>
            </div>
            
            {firstWorkDate && (
              <div className="mb-2">
                <span className="px-3 py-1.5 bg-mint-600 text-white rounded-full text-[12px] font-medium inline-flex items-center gap-1.5">
                  {new Date(firstWorkDate).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })}
                  <button
                    onClick={() => setFirstWorkDate('')}
                    className="hover:bg-mint-700 rounded-full p-0.5"
                  >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              </div>
            )}
          </div>

          {/* ⏰ 첫 출근 시간 */}
          {firstWorkDate && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[16px]">⏰</span>
                <h3 className="text-[15px] font-semibold text-text-900">첫 출근 시간</h3>
              </div>
              
              <div className="mb-2">
                <select
                  value={useCustomTime ? '' : firstWorkTime}
                  onChange={(e) => {
                    setFirstWorkTime(e.target.value);
                    setUseCustomTime(false);
                  }}
                  className="w-full px-3 py-2 bg-white border border-mint-300 rounded-[8px] text-[13px] focus:outline-none focus:ring-2 focus:ring-mint-500"
                >
                  <option value="">시간 선택</option>
                  {timeOptions.map((time) => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex items-center gap-2 mb-2">
                <input
                  type="checkbox"
                  id="customTime"
                  checked={useCustomTime}
                  onChange={(e) => {
                    setUseCustomTime(e.target.checked);
                    if (e.target.checked) {
                      setFirstWorkTime('');
                    }
                  }}
                  className="w-4 h-4 text-mint-600 border-mint-300 rounded focus:ring-mint-500"
                />
                <label htmlFor="customTime" className="text-[12px] text-text-700">
                  직접 입력
                </label>
              </div>
              
              {useCustomTime && (
                <input
                  type="text"
                  value={customTime}
                  onChange={(e) => setCustomTime(e.target.value)}
                  placeholder="예) 09:30"
                  className="w-full px-3 py-2 bg-white border border-mint-300 rounded-[8px] text-[13px] focus:outline-none focus:ring-2 focus:ring-mint-500"
                />
              )}
            </div>
          )}

          {/* 💬 조율 메시지 */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[16px]">💬</span>
              <h3 className="text-[15px] font-semibold text-text-900">조율 메시지</h3>
            </div>
            <textarea
              value={coordinationMessage}
              onChange={(e) => setCoordinationMessage(e.target.value)}
              placeholder="구직자에게 전달할 조율 메시지를 입력하세요"
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

