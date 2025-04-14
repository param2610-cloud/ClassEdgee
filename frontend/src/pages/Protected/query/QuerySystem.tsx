import  { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MessageSquare, Send } from 'lucide-react';
import { domain } from '@/lib/constant';

interface Query {
  query_id: number;
  title: string;
  description: string;
  status: string;
  student_id: number;
  faculty_id: number;
  created_at: string;
  updated_at: string;
}

interface QueryMessage {
  message_id: number;
  query_id: number;
  sender_id: number;
  message: string;
  created_at: string;
  users?: {
    first_name: string;
    last_name: string;
    college_uid: string;
  };
}

const QuerySystem = ({ userId, userRole, facultyId }: { userId: number; userRole: string; facultyId: number }) => {
  const [queries, setQueries] = useState<Query[]>([]);
  const [selectedQuery, setSelectedQuery] = useState<Query | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [newQuery, setNewQuery] = useState({ title: '', description: '' });
  const [queryMessages, setQueryMessages] = useState<QueryMessage[]>([]);
  const [, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchQueries();
  }, [userId, userRole, facultyId]);

  const fetchQueries = async () => {
    try {
      setLoading(true);
      setError(null);
      const endpoint = userRole === 'faculty' 
        ? `${domain}/api/v1/query/queries/faculty/${facultyId}`
        : `${domain}/api/v1/query/queries/student/${userId}`;

      const response = await fetch(endpoint);
      if (!response.ok) throw new Error('Failed to fetch queries');
      
      const data = await response.json();
      setQueries(data);
    } catch (error) {
      console.error('Error fetching queries:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch queries');
    } finally {
      setLoading(false);
    }
  };

  const fetchQueryMessages = async (queryId: number) => {
    try {
      setLoading(true);
      const response = await fetch(`${domain}/api/v1/query/queries/${queryId}/messages`);
      if (!response.ok) throw new Error('Failed to fetch messages');
      
      const data = await response.json();
      setQueryMessages(data);
    } catch (error) {
      console.error('Error fetching messages:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch messages');
    } finally {
      setLoading(false);
    }
  };

  const handleNewQuery = async () => {
    if (!newQuery.title || !newQuery.description) {
      setError('Please fill in both title and description');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${domain}/api/v1/query/queries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newQuery.title,
          description: newQuery.description,
          studentId: userId,
          facultyId,
        }),
      });

      if (!response.ok) throw new Error('Failed to create query');

      setNewQuery({ title: '', description: '' });
      await fetchQueries();
    } catch (error) {
      console.error('Error creating query:', error);
      setError(error instanceof Error ? error.message : 'Failed to create query');
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedQuery) return;

    try {
      setLoading(true);
      const response = await fetch(`${domain}/api/v1/query/queries/${selectedQuery.query_id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: newMessage,
          senderId: userId,
        }),
      });

      if (!response.ok) throw new Error('Failed to send message');

      setNewMessage('');
      await fetchQueryMessages(selectedQuery.query_id);
    } catch (error) {
      console.error('Error sending message:', error);
      setError(error instanceof Error ? error.message : 'Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedQuery) {
      fetchQueryMessages(selectedQuery.query_id);
    }
  }, [selectedQuery]);

  if (error) {
    return <div className="text-red-500 p-4">{error}</div>;
  }

  return (
    <div className="flex h-screen">
      {/* Query List */}
      <div className="w-1/3 border-r p-4">
        <Card>
          <CardHeader>
            <CardTitle>Queries</CardTitle>
          </CardHeader>
          <CardContent>
            {userRole === 'student' && (
              <div className="mb-4">
                <Input
                  placeholder="Query Title"
                  value={newQuery.title}
                  onChange={(e) => setNewQuery({ ...newQuery, title: e.target.value })}
                  className="mb-2"
                />
                <Input
                  placeholder="Description"
                  value={newQuery.description}
                  onChange={(e) => setNewQuery({ ...newQuery, description: e.target.value })}
                  className="mb-2"
                />
                <Button onClick={handleNewQuery}>Create New Query</Button>
              </div>
            )}
            <div className="space-y-2">
              {queries.map((query) => (
                <div
                  key={query.query_id}
                  className={`p-2 rounded cursor-pointer ${
                    selectedQuery?.query_id === query.query_id
                      ? 'bg-blue-100'
                      : 'hover:bg-gray-100'
                  }`}
                  onClick={() => setSelectedQuery(query)}
                >
                  <h3 className="font-medium">{query.title}</h3>
                  <p className="text-sm text-gray-600">Status: {query.status}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chat Area */}
      <div className="flex-1 p-4">
        {selectedQuery ? (
          <Card className="h-full flex flex-col">
            <CardHeader>
              <CardTitle>{selectedQuery.title}</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto">
              <div className="space-y-4">
                {queryMessages.map((message) => {
                    console.log("message:",message);
                    
                    return (
                  <div
                    key={message.message_id}
                    className={`p-2 rounded ${
                      message.sender_id === userId
                        ? 'bg-blue-100 ml-auto'
                        : 'bg-gray-100'
                    }`}
                  >
                    <div className='flex font-bold'>
                        <p>{message?.users?.first_name}{"  "}{message?.users?.last_name}</p>
                    </div>
                    <p>{message.message}</p>
                    <span className="text-xs text-gray-500">
                      {new Date(message.created_at).toLocaleString()}
                    </span>
                  </div>
                )})}
              </div>
            </CardContent>
            <div className="p-4 border-t flex gap-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              />
              <Button onClick={sendMessage}>
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500">
            <MessageSquare className="w-8 h-8 mr-2" />
            Select a query to view the conversation
          </div>
        )}
      </div>
    </div>
  );
};

export default QuerySystem;