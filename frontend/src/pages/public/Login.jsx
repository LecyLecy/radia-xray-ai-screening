import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card } from '../../components/Card';
import { FormInput } from '../../components/FormInput';
import { Button } from '../../components/Button';
import { loginUser } from '../../services/authService';
import './auth.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleLoginSubmit = async (e) => {
    e.preventDefault();

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const session = await loginUser(email, password);
      const actualRole = session.user.role;

      if (actualRole === 'doctor' || actualRole === 'admin') {
        navigate('/doctor/dashboard');
      } else {
        navigate('/patient/history');
      }
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-container">
        <div className="auth-brand">
          <h1>RADIA</h1>
          <p>Clinical X-Ray AI Screening Panel</p>
        </div>
        <Card title="Account Login">
          <form onSubmit={handleLoginSubmit}>
            <FormInput
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter account email"
              required
            />
            <FormInput
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="********"
              required
            />

            <Button type="submit" variant="primary" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Signing In...' : 'Sign In'}
            </Button>
            {errorMessage && <p className="auth-error">{errorMessage}</p>}
          </form>
          <div className="auth-redirect">
            New patient? <Link to="/register">Create an account</Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
