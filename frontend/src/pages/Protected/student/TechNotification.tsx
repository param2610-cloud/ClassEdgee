import React, { useState, useEffect } from 'react';
import { Bell, Calendar, MapPin, ExternalLink } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const TechEventsNotifications = () => {
  // Simulated events data since we don't have direct API access
  const sampleEvents = [
    {
      id: 1,
      title: "AWS re:Invent 2024",
      date: "December 2-6, 2024",
      location: "Las Vegas, NV",
      description: "Annual cloud computing conference focusing on AWS services and innovations",
      type: "Conference",
      url: "#"
    },
    {
      id: 2,
      title: "React Summit 2024",
      date: "June 14-16, 2024",
      location: "Amsterdam, Netherlands",
      description: "The biggest React conference worldwide",
      type: "Conference",
      url: "#"
    },
    {
      id: 3,
      title: "Google I/O Extended",
      date: "May 14-15, 2024",
      location: "Virtual Event",
      description: "Google's annual developer conference with focus on latest technologies",
      type: "Virtual Conference",
      url: "#"
    }
  ];

  const [events, setEvents] = useState([]);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    // Simulate API fetch
    setEvents(sampleEvents);
  }, []);

  const displayEvents = showAll ? events : events.slice(0, 2);

  return (
    <div className="w-full max-w-2xl mx-auto p-4 space-y-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Bell className="h-5 w-5 text-blue-500" />
          <h2 className="text-xl font-semibold">Upcoming Tech Events</h2>
        </div>
        <button 
          onClick={() => setShowAll(!showAll)}
          className="text-sm text-blue-500 hover:text-blue-600"
        >
          {showAll ? 'Show Less' : 'Show All'}
        </button>
      </div>

      <div className="space-y-4">
        {displayEvents.map((event) => (
          <Alert key={event.id} className="relative hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <AlertTitle className="text-lg font-semibold text-blue-600">
                  {event.title}
                </AlertTitle>
                <AlertDescription>
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="h-4 w-4 mr-2" />
                      {event.date}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-2" />
                      {event.location}
                    </div>
                    <p className="mt-2 text-sm text-gray-700">
                      {event.description}
                    </p>
                    <div className="flex items-center mt-3">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {event.type}
                      </span>
                    </div>
                  </div>
                </AlertDescription>
              </div>
              <a
                href={event.url}
                className="text-blue-500 hover:text-blue-600 ml-4"
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="h-5 w-5" />
              </a>
            </div>
          </Alert>
        ))}
      </div>

      {events.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No upcoming events at the moment
        </div>
      )}
    </div>
  );
};

export default TechEventsNotifications;