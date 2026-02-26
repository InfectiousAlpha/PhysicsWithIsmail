'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function DashboardTabs({ courses, levels, scores }) {
  const [activeTab, setActiveTab] = useState('physics');

  // Read the URL parameter to set the active tab (e.g., ?tab=math)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab');
    if (tabParam === 'math' || tabParam === 'physics') {
      setActiveTab(tabParam);
    }
  }, []);

  // Filter courses based on the active tab
  const filteredCourses = courses.filter(course => course.category === activeTab);
  
  // Use the specific level for the active category
  const currentLevel = levels[activeTab] || 0;

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
          const isLocked = currentLevel < course.requiredLevel;
          const isCompleted = currentLevel >= course.unlocksLevel;
          const courseScore = scores[course.id]; // Get dynamic score
          
          // Math gets a green theme, Physics gets blue
          const themeColor = activeTab === 'physics' ? 'var(--primary-blue)' : '#10b981'; 

          const CardContent = (
            <div className={`course-card relative ${isLocked ? 'locked' : ''} ${activeTab === 'math' && !isLocked ? 'hover:border-emerald-500' : ''}`}>
              
              <div className="flex justify-between items-start mb-2">
                <div className={`badge ${isLocked ? 'badge-gray' : activeTab === 'physics' ? 'badge-blue' : 'bg-emerald-100 text-emerald-700'}`}>
                  {isLocked ? `Requires Level ${course.requiredLevel}` : isCompleted ? 'Completed' : 'Unlocked'}
                </div>
                
                {/* Score Display */}
                {!isLocked && courseScore !== undefined && (
                  <div className="text-sm font-bold bg-slate-100 px-2 py-1 rounded text-slate-600 border border-slate-200">
                    Score: <span style={{color: themeColor}}>{courseScore}</span>
                  </div>
                )}
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
