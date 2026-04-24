import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/auth';
import { TodoItem, ProcessedEmail } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';
import { ExternalLink, Clock, Tag, Mail, CheckCircle2, AlertTriangle, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import EmailList from './EmailList';
import { toast } from 'sonner';

const priorityColors = {
  low: 'bg-green-500/10 text-green-500',
  medium: 'bg-yellow-500/10 text-yellow-500',
  high: 'bg-red-500/10 text-red-500'
};

export default function TodoList() {
  const { user } = useAuth();
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null);
  const [showCompleted, setShowCompleted] = useState(false);
  const [resolutionInput, setResolutionInput] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [selectedTodo, setSelectedTodo] = useState<TodoItem | null>(null);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'todos'),
      where('assignedTo', '==', user.email),
      where('completed', '==', showCompleted),
      orderBy('priority', 'desc'),
      orderBy('dueDate', 'asc')
    );

    return onSnapshot(q, (snapshot) => {
      const todoData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      })) as TodoItem[];

      setTodos(todoData);
      
      const uniqueCategories = Array.from(
        new Set(todoData.map((todo) => todo.category))
      );
      setCategories(['all', ...uniqueCategories]);
    });
  }, [user, showCompleted]);

  const handleResolveTodo = async (todo: TodoItem) => {
    if (todo.resolution && !resolutionInput && todo.resolution.required) {
      toast.error('Please complete the required resolution steps');
      return;
    }

    await updateDoc(doc(db, 'todos', todo.id), {
      completed: true,
      completedAt: new Date(),
      completedBy: user?.email,
      notes: notes || undefined,
      'resolution.value': resolutionInput || undefined
    });

    toast.success('Task completed successfully');
    setSelectedTodo(null);
    setResolutionInput('');
    setNotes('');
  };

  const filteredTodos = todos.filter(
    (todo) => selectedCategory === 'all' || todo.category === selectedCategory
  );

  const renderResolutionInput = (todo: TodoItem) => {
    if (!todo.resolution) return null;

    switch (todo.resolution.type) {
      case 'input':
        return (
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Resolution Input {todo.resolution.required && '*'}
            </label>
            <Input
              value={resolutionInput}
              onChange={(e) => setResolutionInput(e.target.value)}
              placeholder={todo.resolution.placeholder}
              required={todo.resolution.required}
            />
          </div>
        );

      case 'select':
        return (
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Select Resolution {todo.resolution.required && '*'}
            </label>
            <Select
              value={resolutionInput}
              onValueChange={setResolutionInput}
              required={todo.resolution.required}
            >
              {todo.resolution.options?.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </Select>
          </div>
        );

      case 'checkbox':
        return (
          <div className="space-y-4">
            {todo.resolution.options?.map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <Checkbox
                  checked={resolutionInput.includes(option)}
                  onCheckedChange={(checked) => {
                    const current = resolutionInput ? resolutionInput.split(',') : [];
                    if (checked) {
                      setResolutionInput([...current, option].join(','));
                    } else {
                      setResolutionInput(current.filter(o => o !== option).join(','));
                    }
                  }}
                />
                <label className="text-sm">{option}</label>
              </div>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold">Todo List</h2>
            <Tabs value={showCompleted ? 'completed' : 'active'} onValueChange={(v) => setShowCompleted(v === 'completed')}>
              <TabsList>
                <TabsTrigger value="active">Active</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
            <TabsList>
              {categories.map((category) => (
                <TabsTrigger key={category} value={category} className="capitalize">
                  {category}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        <ScrollArea className="h-[calc(100vh-12rem)]">
          <div className="space-y-4">
            {filteredTodos.map((todo) => (
              <Card key={todo.id} className="p-4">
                <div className="flex items-start gap-4">
                  {!todo.completed && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setSelectedTodo(todo)}
                      className={cn(
                        "mt-0.5",
                        todo.resolution ? "text-blue-500" : "text-green-500"
                      )}
                    >
                      {todo.resolution ? (
                        <MessageSquare className="h-4 w-4" />
                      ) : (
                        <CheckCircle2 className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium">{todo.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {todo.description}
                        </p>
                      </div>
                      <Badge
                        variant="secondary"
                        className={cn('ml-2', priorityColors[todo.priority])}
                      >
                        {todo.priority}
                      </Badge>
                    </div>

                    <div className="flex flex-wrap gap-2 items-center text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Tag className="h-4 w-4" />
                        <span className="capitalize">{todo.category}</span>
                      </div>
                      {todo.dueDate && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{format(new Date(todo.dueDate), 'PP')}</span>
                        </div>
                      )}
                      <button
                        onClick={() => setSelectedEmailId(todo.emailId)}
                        className="flex items-center gap-1 text-primary hover:underline"
                      >
                        <Mail className="h-4 w-4" />
                        <span>View Email</span>
                      </button>
                    </div>

                    {todo.links.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {todo.links.map((link, index) => (
                          <a
                            key={index}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                          >
                            <ExternalLink className="h-3 w-3" />
                            {link.title}
                          </a>
                        ))}
                      </div>
                    )}

                    {todo.completed && (
                      <div className="text-sm text-muted-foreground">
                        Completed by {todo.completedBy} on {format(new Date(todo.completedAt!), 'PPp')}
                        {todo.notes && (
                          <p className="mt-1 italic">{todo.notes}</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}

            {filteredTodos.length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                No todos found
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      <Dialog open={!!selectedTodo} onOpenChange={(open) => !open && setSelectedTodo(null)}>
        <DialogContent className="max-w-md">
          <div className="space-y-4">
            <div className="space-y-2">
              <h2 className="text-lg font-semibold">{selectedTodo?.title}</h2>
              <p className="text-sm text-muted-foreground">
                {selectedTodo?.description}
              </p>
            </div>

            {selectedTodo?.resolution && (
              <div className="space-y-4">
                {renderResolutionInput(selectedTodo)}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">Additional Notes</label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any relevant notes about the resolution..."
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedTodo(null);
                  setResolutionInput('');
                  setNotes('');
                }}
              >
                Cancel
              </Button>
              <Button onClick={() => selectedTodo && handleResolveTodo(selectedTodo)}>
                Complete Task
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!selectedEmailId} onOpenChange={() => setSelectedEmailId(null)}>
        <DialogContent className="max-w-6xl max-h-[90vh]">
          <EmailList initialEmailId={selectedEmailId!} />
        </DialogContent>
      </Dialog>
    </>
  );
}