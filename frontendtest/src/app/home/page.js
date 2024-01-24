'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation'; 
import Header from '../header/page';

export default function Home() {
  const [selectedArea, setSelectedArea] = useState(null);
  const {push} = useRouter();
 

  return (
    <>
    <Header/>
    <div className="flex flex-col min-h-screen bg-gradient-to-r from-purple-800 to-purple-500">
      <main className="flex flex-col items-center justify-center flex-grow p-24">
        <div className="flex flex-col items-center">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <AreaOption
              title="Academics"
              description="View academic information"
              onClick={() => push('/academics')}
            />
            <AreaOption
              title="Transcript"
              description="View your transcript"
              onClick={() => handleAreaClick("Transcript")}
            />
            <AreaOption
              title="Financials"
              description="Check financial details"
              onClick={() => handleAreaClick("Financials")}
            />
          </div>
          {selectedArea && (
            <AreaContent selectedArea={selectedArea} />
          )}
        </div>
      </main>
    </div>
    </>
  );
}

function AreaOption({ title, description, onClick }) {
  return (
    <div
      className="cursor-pointer p-4 border border-purple-300 rounded-md shadow-md text-center hover:bg-purple-300 transition duration-300"
      onClick={onClick}
    >
      <h2 className="text-white text-lg mb-2">{title}</h2>
      <p className="text-gray-300">{description}</p>
    </div>
  );
}

