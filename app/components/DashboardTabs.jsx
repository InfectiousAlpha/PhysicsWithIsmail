'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function DashboardTabs({ courses, level }) {
  const [activeTab, setActiveTab] = useState('physics');

  // Filter courses based on the active tab
  const filteredCourses = courses.filter(course => course.category === activeTab);

  return (
    <div>
      {/* Tab Navigation */}
      <div className="flex gap-4 mb-8 border-b-2 border-slate-200 pb-4">
        <button
          onClick={() => setActiveTab('physics')}
          className={`px-6 py-2 rounded-lg font-bold transition-all ${
            activeTab === 'physics' 
              ? 'bg-[var(--primary-blue)] text-white shadow-md' 
              : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
          }`}
        >
          Physics Academy
        </button>
        <button
          onClick={() => setActiveTab('math')}
          className={`px-6 py-2 rounded-lg font-bold transition-all ${
            activeTab === 'math' 
              ? 'bg-emerald-500 text-white shadow-md' 
              : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
          }`}
        >
          Mathematics
        </button>
      </div>

      <h2 style={{fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem'}}>
        Your {activeTab === 'physics' ? 'Physics' : 'Math'} Courses
      </h2>
      
      {/* Course Grid */}
      <div className="course-grid">
        {filteredCourses.map((course) => {
          const isLocked = level < course.requiredLevel;
          const isCompleted = level >= course.unlocksLevel;
          
          // Math gets a green theme, Physics gets blue
          const themeColor = activeTab === 'physics' ? 'var(--primary-blue)' : '#10b981'; 

          const CardContent = (
            <div className={`course-card ${isLocked ? 'locked' : ''} ${activeTab === 'math' && !isLocked ? 'hover:border-emerald-500' : ''}`}>
              <div className={`badge ${isLocked ? 'badge-gray' : activeTab === 'physics' ? 'badge-blue' : 'bg-emerald-100 text-emerald-700'}`}>
                {isLocked ? `Requires Level ${course.requiredLevel}` : isCompleted ? 'Completed' : 'Unlocked'}
              </div>
              <h3 style={{fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem', color: isLocked ? '#64748b' : 'var(--text-main)'}}>
                {course.title}
              </h3>
              <p style={{color: '#64748b', lineHeight: '1.5', flexGrow: 1}}>
                {course.description}
              </p>
              
              <div style={{marginTop: '1.5rem'}}>
                {isLocked ? (
                  <div style={{color: '#94a3b8', fontWeight: '500', textAlign: 'center'}}>Locked 🔒</div>
                ) : (
                  <div style={{color: themeColor, fontWeight: 'bold', textAlign: 'center'}}>
                    {isCompleted ? 'Review Course →' : 'Start Course →'}
                  </div>
                )}
              </div>
            </div>
          );

          if (isLocked) {
            return <div key={course.id}>{CardContent}</div>;
          }

          return (
            <Link key={course.id} href={`/courses/${course.id}`} style={{textDecoration: 'none'}}>
              {CardContent}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
