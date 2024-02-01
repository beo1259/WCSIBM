'use client';

import { useRouter } from 'next/navigation'; 
import Header from '@/components/header';
import Image from 'next/image';

const Dashboard = () => {
  const { push } = useRouter();

  const navigateTo = (path) => {
    push(path);
  };

  return (
    <>
      <div className="fixed top-0 left-0 w-full z-50">
        <Header />
      </div>
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-purple-800 to-purple-500">
        <div className="p-6 max-w-4xl w-full bg-gradient-to-r from-purple-300 to-purple-100 rounded-2xl shadow-md">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

            {/* Program Status */}
            <div onClick={() => navigateTo('/program-status')} className="bg-white rounded-lg p-6 shadow-lg hover:shadow-xl transition hover:bg-purple-200 cursor-pointer relative">
              <h2 className="text-xl font-semibold text-purple-800 mb-2">Program Status</h2>
              <div className="relative h-20 w-20 m-6 mx-auto"> {/* Set dimensions for your icon */}
                <Image
                  src="/code.png" // Adjust the path to your image's location
                  alt="Program Status"
                  layout="fill"
                  objectFit="contain"
                />
              </div>
            </div>

            {/* Course Registration */}
            <div onClick={() => navigateTo('/course-registration')} className="bg-white rounded-lg p-6 shadow-lg hover:shadow-xl transition hover:bg-purple-200 cursor-pointer relative">
              <h2 className="text-xl font-semibold text-purple-800 mb-2">Course Registration</h2>
              <div className="relative h-20 m-6 w-20 mx-auto"> {/* Set dimensions for your icon */}
                <Image
                  src="/calendar.png" // Adjust the path to your image's location
                  alt="Course Registration"
                  layout="fill"
                  objectFit="contain"
                />
              </div>
            </div>

            {/* Grades */}
            <div onClick={() => navigateTo('/grades')} className="bg-white rounded-lg p-6 shadow-lg hover:shadow-xl transition hover:bg-purple-200 cursor-pointer relative">
              <h2 className="text-xl font-semibold text-purple-800 mb-2">Grades</h2>
              <div className="relative h-20 m-6 w-20 mx-auto"> {/* Set dimensions for your icon */}
                <Image
                  src="/test.png" // Adjust the path to your image's location
                  alt="Grades"
                  layout="fill"
                  objectFit="contain"
                />
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
