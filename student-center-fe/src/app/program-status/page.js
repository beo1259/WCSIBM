'use client'

import {React, useState} from 'react';
import Header from '@/components/header';

const program_status = () => {
    return(
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-purple-800 to-purple-500">
            <div className="fixed top-0 left-0 w-full z-50">
                <Header />
            </div>
            <div className='grid grid-cols-2 w-full'>
                <div className='bg-white p-6 m-16 rounded-lg drop-shadow-lg w-[%]'>
                    <p className='text-black'>Hello</p>
                </div>
                <div className='bg-white p-6 m-16 rounded-lg drop-shadow-lg w-[%]'>
                    <p className='text-black'>Hello</p>
                </div>
            </div>
        </div>
    );
}

export default program_status;