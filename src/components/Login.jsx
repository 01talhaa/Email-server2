import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';

const API_BASE_URL = 'https://email.jumpintojob.com/api/v1';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleLogin = async (data) => {
        try {
            // Store user data, but make refresh token optional
            localStorage.setItem('user', JSON.stringify({
                token: data.token || data.access_token,
                refresh_token: data.refresh_token || null, // Make refresh_token optional
                ...data
            }));

            // Only set up token refresh if refresh token exists
            if (data.refresh_token) {
                setupTokenRefresh(data.refresh_token);
            }

            login(data);
            navigate('/dashboard');
        } catch (error) {
            console.error('Login error:', error);
            toast.error('Login failed');
        }
    };

    const refreshAccessToken = async (refresh_token) => {
        if (!refresh_token) {
            console.warn('No refresh token available');
            return null;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ refresh_token }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Token refresh failed');
            }

            // Update stored tokens
            const userData = JSON.parse(localStorage.getItem('user'));
            localStorage.setItem('user', JSON.stringify({
                ...userData,
                token: data.token || data.access_token,
                refresh_token: data.refresh_token || userData.refresh_token
            }));

            return data;
        } catch (error) {
            console.error('Token refresh error:', error);
            return null;
        }
    };

    // Update the setupTokenRefresh function to check if refresh token exists
    const setupTokenRefresh = (refresh_token) => {
        if (!refresh_token) return; // Don't set up refresh if no token

        // Refresh token every 14 minutes (assuming 15-minute token lifetime)
        const REFRESH_INTERVAL = 14 * 60 * 1000;

        const intervalId = setInterval(async () => {
            try {
                await refreshAccessToken(refresh_token);
            } catch (error) {
                clearInterval(intervalId);
            }
        }, REFRESH_INTERVAL);

        // Store interval ID to clear it on logout
        window.tokenRefreshInterval = intervalId;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Login failed');
            }

            // Handle the case where data.data might not exist
            const userData = data.data || data;

            // Allow login even if no refresh token
            await handleLogin(userData);

        } catch (error) {
            setError(error.message);
            toast.error(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
            <div className="max-w-6xl w-full mx-auto p-6">
                <div className="backdrop-blur-sm bg-white/80 rounded-3xl shadow-2xl overflow-hidden">
                    <div className="grid grid-cols-1 lg:grid-cols-2">
                        {/* Left side - Image */}
                        <div className="hidden lg:block relative">
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-purple-600 opacity-90"></div>
                            <img
                                src="/email.png"
                                alt="Email Illustration"
                                className="h-full w-full object-cover"
                            />
                            <div className="absolute inset-0 flex items-center justify-center p-12">
                                <div className="text-white text-center">
                                    <h2 className="text-4xl font-bold mb-6">Welcome to Our Platform</h2>
                                    <p className="text-lg text-blue-100">Access your account to manage your email campaigns and track your success.</p>
                                </div>
                            </div>
                        </div>

                        {/* Right side - Login Form */}
                        <div className="p-8 lg:p-12">
                            <div className="mb-10 text-center">
                                <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back!</h2>
                                <p className="text-gray-600">Please sign in to your account</p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-4">
                                    <div className="relative">
                                        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">
                                            Email Address
                                        </label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                                            <input
                                                id="email"
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="pl-10 w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                                                placeholder="Enter your email"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="relative">
                                        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="password">
                                            Password
                                        </label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                                            <input
                                                id="password"
                                                type={showPassword ? "text" : "password"}
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                className="pl-10 w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                                                placeholder="Enter your password"
                                                required
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                            >
                                                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {error && (
                                    <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm">
                                        {error}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium py-3 px-4 rounded-lg transition duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? (
                                        <div className="flex items-center justify-center">
                                            <svg className="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24">
                                                <circle
                                                    className="opacity-25"
                                                    cx="12"
                                                    cy="12"
                                                    r="10"
                                                    stroke="currentColor"
                                                    strokeWidth="4"
                                                />
                                                <path
                                                    className="opacity-75"
                                                    fill="currentColor"
                                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                />
                                            </svg>
                                            <span>Signing in...</span>
                                        </div>
                                    ) : (
                                        <span>Sign in</span>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;