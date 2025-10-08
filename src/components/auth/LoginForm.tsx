import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface LoginFormProps {
  onToggleForm: () => void;
  onForgotPassword: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onToggleForm, onForgotPassword }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signIn(email, password);
      toast({ title: 'Success', description: 'Logged in successfully' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card rounded-xl p-6 w-full max-w-md">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-glass-primary mb-2">Welcome Back</h2>
        <p className="text-glass-secondary">Sign in to your account</p>
      </div>
      <div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-glass-primary">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-white/10 border-white/20 text-glass-primary placeholder:text-glass-secondary/60"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-glass-primary">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-white/10 border-white/20 text-glass-primary placeholder:text-glass-secondary/60"
            />
          </div>
          <Button type="submit" className="w-full cherry-red-btn" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Sign In
          </Button>
          <div className="flex justify-between text-sm">
            <button type="button" onClick={onForgotPassword} className="text-primary hover:text-primary/80 transition-colors">
              Forgot password?
            </button>
            <button type="button" onClick={onToggleForm} className="text-primary hover:text-primary/80 transition-colors">
              Create account
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
