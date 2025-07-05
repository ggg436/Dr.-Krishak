import React, { useState } from 'react';
import Header from '@/components/Header';
import PostForm from '@/components/community/PostForm';
import PostList from '@/components/community/PostList';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';

const COMMUNITY_TAGS = [
  'crops', 'farming', 'organic', 'irrigation', 'soil', 
  'seeds', 'harvest', 'livestock', 'technology', 'tools'
];

const COMMUNITIES = [
  'Farmers', 'Gardeners', 'Agriculture Experts', 
  'Crop Specialists', 'Organic Farming'
];

const UPCOMING_EVENTS = [
  {
    title: 'Organic Farming Workshop',
    date: 'May 15, 2023',
    time: '10:00 AM',
    description: 'Join us for a hands-on workshop on organic farming techniques.'
  },
  {
    title: 'Crop Disease Prevention',
    date: 'May 22, 2023',
    time: '2:00 PM',
    description: 'Expert tips on preventing and treating common crop diseases.'
  },
  {
    title: 'Water Conservation Techniques',
    date: 'June 5, 2023',
    time: '11:00 AM',
    description: 'Learn how to reduce water usage while maintaining crop yields.'
  }
];

const POPULAR_MEMBERS = [
  'Rajiv Kumar', 'Anita Sharma', 'Prakash Verma', 'Neha Singh'
];

const Community = () => {
  const { currentUser } = useAuth();
  const [selectedTag, setSelectedTag] = useState<string | undefined>(undefined);
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="min-h-screen bg-gray-50 pt-8">
        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Sidebar */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Communities</h3>
                <ul className="space-y-3">
                  {COMMUNITIES.map((item, index) => (
                    <li key={index} className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded-md">
                      <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                        <span className="text-green-600 font-medium">{item.charAt(0)}</span>
                      </div>
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
                
                <div className="mt-6">
                  <button className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors">
                    Create Community
                  </button>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6 mt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {COMMUNITY_TAGS.map((tag, index) => (
                    <Badge 
                      key={index} 
                      variant={selectedTag === tag ? "default" : "secondary"}
                      className="cursor-pointer"
                      onClick={() => setSelectedTag(selectedTag === tag ? undefined : tag)}
                    >
                      #{tag}
                    </Badge>
                  ))}
                </div>
                {selectedTag && (
                  <button
                    onClick={() => setSelectedTag(undefined)}
                    className="text-sm text-blue-600 mt-4 hover:text-blue-800"
                  >
                    Clear filter
                  </button>
                )}
              </div>
            </div>
            
            {/* Main Feed */}
            <div className="lg:col-span-6">
              <PostForm />
              <PostList selectedTag={selectedTag} />
            </div>
            
            {/* Right Panel */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Upcoming Events</h3>
                <ul className="space-y-4">
                  {UPCOMING_EVENTS.map((event, index) => (
                    <li key={index} className={index < UPCOMING_EVENTS.length - 1 ? "border-b border-gray-100 pb-4" : ""}>
                      <p className="font-medium text-blue-600">{event.title}</p>
                      <p className="text-sm text-gray-700 mt-1">{event.date} • {event.time}</p>
                      <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                      <div className="mt-2">
                        <button className="text-sm text-blue-600 hover:text-blue-800">Learn more</button>
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="mt-4">
                  <button className="w-full border border-blue-600 text-blue-600 py-2 px-4 rounded-md hover:bg-blue-50 transition-colors">
                    View All Events
                  </button>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6 mt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Popular Members</h3>
                <ul className="space-y-3">
                  {POPULAR_MEMBERS.map((name, index) => (
                    <li key={index} className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-600 font-medium">{name.charAt(0)}</span>
                      </div>
                      <span className="text-gray-700">{name}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Community; 