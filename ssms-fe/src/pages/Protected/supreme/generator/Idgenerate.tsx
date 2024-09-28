import React, { useState } from 'react';
import { domain } from "@/lib/constant";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, Copy, Send } from 'lucide-react';

const Idgenerate = () => {
    const [email, setEmail] = useState('');
    const [generatedId, setGeneratedId] = useState('');
    const [generatedPass, setGeneratedPass] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [copied, setCopied] = useState(false);

    const handleGenerate = async () => {
        setIsLoading(true);
        setError('');
        setCopied(false);

        try {
            const response = await fetch(`${domain}/api/v1/supreme/principal-create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email })
            });

            const data = await response.json();

            if (response.ok) {
                setGeneratedId(data.userid);
                setGeneratedPass(data.password);
            } else {
                setError(data.message || 'An error occurred');
            }
        } catch (error) {
            setError('Network error. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopy = () => {
        const text = `ID: ${generatedId}\nPassword: ${generatedPass}`;
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleSendEmail = () => {
        // Implement email sending functionality here
        console.log('Sending email...');
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-md">
            <h1 className="text-2xl font-bold mb-6">Generate Principal ID</h1>
            <div className="space-y-4">
                <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter email"
                    className="w-full"
                />
                <Button 
                    onClick={handleGenerate} 
                    disabled={isLoading || !email} 
                    className="w-full"
                >
                    {isLoading ? 'Generating...' : 'Generate'}
                </Button>
                
                {error && (
                    <Alert variant="destructive">
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {generatedId && generatedPass && (
                    <div className="space-y-2">
                        <p><strong>Generated ID:</strong> {generatedId}</p>
                        <p><strong>Generated Password:</strong> {generatedPass}</p>
                        <div className="flex space-x-2">
                            <Button onClick={handleCopy} className="flex-1">
                                {copied ? <Check className="mr-2" /> : <Copy className="mr-2" />}
                                {copied ? 'Copied!' : 'Copy'}
                            </Button>
                            <Button onClick={handleSendEmail} className="flex-1">
                                <Send className="mr-2" />
                                Send Email
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Idgenerate;