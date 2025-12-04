import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import type { Employee } from '@/types/schedule';

export const EmployeeScheduleList = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      
      // TODO: Implement API call to fetch employees
      // const response = await fetch('/api/schedule/employees');
      // const data = await response.json();
      // setEmployees(data);
      
      setEmployees([]);
    } catch (error) {
      console.error('Failed to fetch employees:', error);
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredEmployees = employees.filter(emp =>
    searchQuery === '' || emp.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header title="일정 관리" showBack />

      {/* Search & Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="mb-4">
          <h2 className="text-[20px] font-bold text-gray-900 mb-1">
            직원 일정 관리
          </h2>
          <p className="text-[14px] text-gray-600">
            직원을 선택하여 일정을 확인하고 관리하세요
          </p>
        </div>

        {/* Search */}
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="직원 이름 검색"
            className="w-full h-11 pl-10 pr-4 bg-gray-50 rounded-xl border border-gray-200
                     text-[14px] text-gray-900 placeholder:text-gray-500
                     focus:outline-none focus:ring-2 focus:ring-mint-600 focus:border-transparent"
          />
        </div>
      </div>

      {/* Employee List */}
      <div className="p-4">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-mint-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className="text-[14px] text-gray-500">불러오는 중...</p>
            </div>
          </div>
        ) : filteredEmployees.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-6">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <p className="text-[15px] font-medium text-gray-900 mb-1">직원이 없습니다</p>
            <p className="text-[13px] text-gray-500 text-center">
              {searchQuery ? '검색 결과가 없습니다' : '직원을 추가해보세요'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredEmployees.map((employee) => (
              <button
                key={employee.id}
                onClick={() => navigate(`/employer/schedule/${employee.id}`)}
                className="w-full bg-white rounded-2xl p-4 shadow-sm border border-gray-100 
                         hover:shadow-md transition-all text-left"
              >
                <div className="flex items-center gap-3 mb-3">
                  {/* Avatar */}
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-mint-100 to-mint-200 
                               flex items-center justify-center overflow-hidden flex-shrink-0">
                    {employee.profileImageUrl ? (
                      <img src={employee.profileImageUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xl">👤</span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-[16px] font-bold text-gray-900">
                        {employee.name}
                      </h3>
                      {employee.nationality && (
                        <span className="text-[12px] text-gray-500">
                          {employee.nationality}
                        </span>
                      )}
                    </div>
                    {employee.position && (
                      <p className="text-[13px] text-gray-600">
                        {employee.position}
                      </p>
                    )}
                  </div>

                  {/* Arrow */}
                  <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-gray-50 rounded-xl p-2.5 text-center">
                    <p className="text-[18px] font-bold text-gray-900 mb-0.5">
                      {employee.totalShifts}
                    </p>
                    <p className="text-[11px] text-gray-600">총 근무</p>
                  </div>
                  <div className="bg-emerald-50 rounded-xl p-2.5 text-center">
                    <p className="text-[18px] font-bold text-emerald-700 mb-0.5">
                      {employee.completedShifts}
                    </p>
                    <p className="text-[11px] text-emerald-700">완료</p>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-2.5 text-center">
                    <p className="text-[18px] font-bold text-blue-700 mb-0.5">
                      {employee.upcomingShifts}
                    </p>
                    <p className="text-[11px] text-blue-700">예정</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

