import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MessageSquare, Send } from 'lucide-react';
import { domain } from '@/lib/constant';

const QuerySystem = ({ userId, userRole, facultyId }:{userId:number,userRole:string,facultyId:number}) => {
  const [queries, setQueries] = useState([]);
  const [selectedQuery, setSelectedQuery] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [newQuery, setNewQuery] = useState({ title: '', description: '' });
  const [queryMessages, setQueryMessages] = useState([]);

  useEffect(() => {
    fetchQueries();
  }, [userId, userRole]);

  const fetchQueries = async () => {
    try {
      const response = await fetch(
        `${domain}/api/v1/query/queries${userRole === 'faculty' ? `/faculty/${facultyId}` : `/student/${userId}`}`
      );
      const data = await response.json();
      setQueries(data);
    } catch (error) {
      console.error('Error fetching queries:', error);
    }
  };

  const fetchQueryMessages = async (queryId) => {
    try {
      const response = await fetch(`${domain}/api/v1/query/queries/${queryId}/messages`);
    //   console.log("response:",response);
      
      const data = await response.json();
      console.log("data:",data);
      
      setQueryMessages(data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleNewQuery = async () => {
    try {
      await fetch(`${domain}/api/v1/query/queries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newQuery,
          studentId: userId,
          facultyId: facultyId,
        }),
      });
      setNewQuery({ title: '', description: '' });
      fetchQueries();
    } catch (error) {
      console.error('Error creating query:', error);
    }
  };
  useEffect(()=>{
    if(selectedQuery){
      fetchQueryMessages(selectedQuery.query_id)
    }
  },[selectedQuery])

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      await fetch(`${domain}/api/v1/query/queries/${selectedQuery.query_id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: newMessage,
          senderId: userId,
        }),
      });
      setNewMessage('');
      fetchQueryMessages(selectedQuery.query_id);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

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
                {queryMessages.map((message) => (
                  <div
                    key={message.message_id}
                    className={`p-2 rounded ${
                      message.sender_id === userId
                        ? 'bg-blue-100 ml-auto'
                        : 'bg-gray-100'
                    }`}
                  >
                    <p>{message.message}</p>
                    <span className="text-xs text-gray-500">
                      {new Date(message.created_at).toLocaleString()}
                    </span>
                  </div>
                ))}
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