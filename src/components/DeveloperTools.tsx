import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { functions } from '@/lib/firebase';
import { httpsCallable } from 'firebase/functions';

export default function DeveloperTools() {
  const [functionInput, setFunctionInput] = useState('');
  const [systemInstruction, setSystemInstruction] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const testAI = async () => {
    setLoading(true);
    try {
      const testAIFunction = httpsCallable(functions, 'testAI');
      const response = await testAIFunction({
        input: functionInput,
        systemInstruction
      });
      setResult(JSON.stringify(response.data, null, 2));
    } catch (error) {
      console.error('Error testing AI:', error);
      setResult('Error: ' + JSON.stringify(error));
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">AI Function Testing</h2>
        <div className="space-y-4">
          <div>
            <Label htmlFor="input">Function Input</Label>
            <Input
              id="input"
              value={functionInput}
              onChange={(e) => setFunctionInput(e.target.value)}
              placeholder="Enter function input"
            />
          </div>
          <div>
            <Label htmlFor="instruction">System Instruction</Label>
            <Textarea
              id="instruction"
              value={systemInstruction}
              onChange={(e) => setSystemInstruction(e.target.value)}
              placeholder="Enter system instruction"
              rows={4}
            />
          </div>
          <Button onClick={testAI} disabled={loading}>
            {loading ? 'Testing...' : 'Test AI Function'}
          </Button>
          {result && (
            <div>
              <Label>Result</Label>
              <pre className="bg-muted p-4 rounded-lg overflow-auto max-h-96">
                {result}
              </pre>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}