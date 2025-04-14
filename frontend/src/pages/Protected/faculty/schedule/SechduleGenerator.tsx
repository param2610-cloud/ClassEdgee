import { useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, Zap, CheckCircle, AlertCircle } from 'lucide-react';
import { domain } from '@/lib/constant';
import { useAuth } from '@/services/AuthContext';

export default function ScheduleGenerator() {
  const { user } = useAuth();
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
        body: JSON.stringify({
          created_by: user?.user_id
        }),
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error('Failed to generate schedule');
      }

       await response.json();
      setSuccess(true);
    } catch (err:any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto">
      <Card className="w-full max-w-3xl mx-auto border shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Zap className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">Automatic Schedule Generator</CardTitle>
          <CardDescription>
            Create optimized schedules based on available resources and constraints
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-4">
          {error && (
            <Alert variant="destructive" className="flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              <div>
                <AlertTitle className="font-medium">Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </div>
            </Alert>
          )}
          
          {success && (
            <Alert className="bg-green-50 border-green-200 flex items-center">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
              <div>
                <AlertTitle className="font-medium text-green-800">Success</AlertTitle>
                <AlertDescription className="text-green-700">
                  Schedule generated successfully! You can now view it in the schedule viewer.
                </AlertDescription>
              </div>
            </Alert>
          )}
          
          <div className="bg-muted/40 p-6 rounded-lg">
            <h3 className="font-medium mb-2">What happens when you generate a schedule?</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>System analyzes faculty availability and expertise</li>
              <li>Courses are assigned to appropriate time slots</li>
              <li>Rooms are allocated based on capacity and equipment needs</li>
              <li>Conflicts are automatically resolved when possible</li>
            </ul>
          </div>
          
          <Button 
            size="lg"
            className="w-full py-6 text-lg"
            onClick={generateSchedule}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Generating Schedule...
              </>
            ) : (
              <>Generate Complete Schedule</>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}