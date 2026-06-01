import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card } from '../../components/Card';
import { FormInput } from '../../components/FormInput';
import { Button } from '../../components/Button';
import { registerPatient } from '../../services/authService';
import './auth.css';

const calculateAge = (dateOfBirth) => {
  if (!dateOfBirth) return null;

  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthOffset = today.getMonth() - birthDate.getMonth();

  if (monthOffset < 0 || (monthOffset === 0 && today.getDate() < birthDate.getDate())) {
    age -= 1;
  }

  return Number.isFinite(age) ? age : null;
};

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    dob: '',
    gender: '',
    password: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');

    if (formData.password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      setIsSubmitting(false);
      return;
    }

    try {
      await registerPatient({
        email: formData.email,
        password: formData.password,
        full_name: formData.name,
        phone_number: formData.phone || null,
        age: calculateAge(formData.dob),
        gender: formData.gender || null,
      });

      alert('Registration successful. Please sign in.');
      navigate('/login');
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
          <p>Patient Account Registration</p>
        </div>
        <Card title="Medical Profile Registration">
          <form onSubmit={handleRegisterSubmit}>
            <FormInput
              label="Full Name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Example: Andi Wijaya"
              required
            />
            <FormInput
              label="Email Address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="andi@mail.com"
              required
            />
            <FormInput
              label="Phone Number"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="08123456789"
              required
            />
            <FormInput
              label="Date of Birth"
              name="dob"
              type="date"
              value={formData.dob}
              onChange={handleInputChange}
              required
            />
            <div className="radia-form-group">
              <label className="radia-label" htmlFor="register-gender">Gender</label>
              <select
                id="register-gender"
                name="gender"
                className="radia-input"
                value={formData.gender}
                onChange={handleInputChange}
                required
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
            <FormInput
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Minimum 6 characters"
              minLength={6}
              required
            />
            <Button type="submit" variant="primary" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Creating Account...' : 'Complete Registration'}
            </Button>
            {errorMessage && <p className="auth-error">{errorMessage}</p>}
          </form>
          <div className="auth-redirect">
            Already registered? <Link to="/login">Sign in here</Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
