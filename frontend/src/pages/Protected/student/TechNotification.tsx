import React, { useState, useEffect } from 'react';
import { Bell, Calendar, ExternalLink, TrendingUp } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const TechNewsNotifications = () => {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const fetchStories = async () => {
      try {
        setLoading(true);
        // Fetch top stories IDs
        const response = await fetch('https://hacker-news.firebaseio.com/v0/topstories.json');
        if (!response.ok) throw new Error('Failed to fetch stories');
        const storyIds = await response.json();
        
        // Fetch details for top 15 stories
        const storyPromises = storyIds.slice(0, 15).map(id =>
          fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`)
            .then(res => res.json())
        );
        
        const storiesData = await Promise.all(storyPromises);
        
        // Transform and filter stories
        const transformedStories = storiesData
          .filter(story => story && story.url) // Only stories with URLs
          .map(story => ({
            id: story.id,
            title: story.title,
            url: story.url,
            score: story.score,
            date: new Date(story.time * 1000).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            }),
            author: story.by,
            commentCount: story.descendants || 0
          }));
        
        setStories(transformedStories);
        setError(null);
      } catch (err) {
        setError('Failed to load news. Please try again later.');
        console.error('Error fetching stories:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStories();
  }, []);

  const displayStories = showAll ? stories : stories.slice(0, 5);

  if (loading) {
    return (
      <div className="w-full max-w-2xl mx-auto p-4">
        <Alert>
          <AlertTitle>Loading news...</AlertTitle>
          <AlertDescription>Please wait while we fetch the latest tech news.</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-2xl mx-auto p-4">
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-4 space-y-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Bell className="h-5 w-5 text-blue-500" />
          <h2 className="text-xl font-semibold">Latest Tech News</h2>
        </div>
        {stories.length > 5 && (
          <button 
            onClick={() => setShowAll(!showAll)}
            className="text-sm text-blue-500 hover:text-blue-600"
          >
            {showAll ? 'Show Less' : 'Show All'}
          </button>
        )}
      </div>

      <div className="space-y-4">
        {displayStories.map((story) => (
          <Alert key={story.id} className="relative hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <AlertTitle className="text-lg font-semibold text-blue-600 pr-8">
                  {story.title}
                </AlertTitle>
                <AlertDescription>
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="h-4 w-4 mr-2" />
                      {story.date}
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <TrendingUp className="h-4 w-4 mr-2" />
                        {story.score} points
                      </div>
                      <div className="text-sm text-gray-600">
                        by {story.author}
                      </div>
                      <div className="text-sm text-gray-600">
                        {story.commentCount} comments
                      </div>
                    </div>
                  </div>
                </AlertDescription>
              </div>
              <a
                href={story.url}
                className="text-blue-500 hover:text-blue-600 ml-4 flex-shrink-0"
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="h-5 w-5" />
              </a>
            </div>
          </Alert>
        ))}
      </div>

      {stories.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No stories available at the moment
        </div>
      )}
    </div>
  );
};

export default TechNewsNotifications;