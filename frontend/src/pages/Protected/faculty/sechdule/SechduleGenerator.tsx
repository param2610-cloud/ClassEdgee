import React, { useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { domain } from '@/lib/constant';

export default function ScheduleGenerator() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const generateSchedule = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      const response = await fetch(`${domain}/api/v1/schedule/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error('Failed to generate schedule');
      }

      const data = await response.json();
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Schedule Generator</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {success && (
            <Alert>
              <AlertTitle>Success</AlertTitle>
              <AlertDescription>Schedule generated successfully!</AlertDescription>
            </Alert>
          )}
          
          <Button 
            className="w-full"
            onClick={generateSchedule}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Schedule...
              </>
            ) : (
              'Generate Schedule'
            )}
          </Button>
          
          <p className="text-sm text-gray-500 mt-4">
            This will generate a new schedule using available course data, faculty, rooms and time slots.
            The process may take a few minutes.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}