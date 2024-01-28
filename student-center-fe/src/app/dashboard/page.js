'use client';

import { useRouter } from 'next/navigation';
import Header from '@/components/header';

const Dashboard = () => {
  const { push } = useRouter();

  const navigateTo = (path) => {
    push(path);
  };

  return (
    <>
    <Header/>
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-purple-800 to-purple-500">
      <div className="p-6 max-w-4xl w-full bg-gradient-to-r from-purple-300 to-purple-100 rounded-2xl shadow-md">
        <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">Student Center Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Program Status */}
          <div onClick={() => navigateTo('/program-status')} className="bg-white rounded-lg p-6 shadow-lg hover:shadow-xl transition hover:bg-purple-200 cursor-pointer">
            <h2 className="text-xl font-semibold text-purple-800 mb-2">Program Status</h2>
            <span className="inline-block mt-4 text-purple-600 hover:text-purple-700 font-semibold">→</span>
          </div>

          {/* Course Registration */}
          <div onClick={() => navigateTo('/course-registration')} className="bg-white rounded-lg p-6 shadow-lg hover:shadow-xl transition hover:bg-purple-200 cursor-pointer">
            <h2 className="text-xl font-semibold text-purple-800 mb-2">Course Registration</h2>
            <span className="inline-block mt-4 text-purple-600 hover:text-purple-700 font-semibold">→</span>
          </div>

          {/* Grades */}
          <div onClick={() => navigateTo('/grades')} className="bg-white rounded-lg p-6 shadow-lg hover:shadow-xl transition hover:bg-purple-200 cursor-pointer">
            <h2 className="text-xl font-semibold text-purple-800 mb-2">Grades</h2>
            <span className="inline-block mt-4 text-purple-600 hover:text-purple-700 font-semibold">→</span>
          </div>

          {/* Schedule */}
          <div onClick={() => navigateTo('/schedule')} className="bg-white rounded-lg p-6 shadow-lg hover:shadow-xl transition hover:bg-purple-200 cursor-pointer">
            <h2 className="text-xl font-semibold text-purple-800 mb-2">Schedule</h2>
            <span className="inline-block mt-4 text-purple-600 hover:text-purple-700 font-semibold"> →</span>
          </div>

        </div>
      </div>
    </div>
    </>
  );
};

export default Dashboard;
