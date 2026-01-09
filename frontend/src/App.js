import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './components/common/ToastContainer';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import ScrollToTop from './components/common/ScrollToTop';
import LoadingSpinner from './components/common/LoadingSpinner';
import './App.css';
import './styles/accessibility.css';

// Lazy loaded components
const Landing = lazy(() => import('./pages/Landing'));
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const CreatePost = lazy(() => import('./pages/CreatePost'));
const Profile = lazy(() => import('./pages/Profile'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const PostDetail = lazy(() => import('./pages/PostDetail'));
const PublicProfile = lazy(() => import('./pages/PublicProfile'));
const Messages = lazy(() => import('./pages/Messages'));
const Stories = lazy(() => import('./pages/Stories'));
const AboutUs = lazy(() => import('./pages/AboutUs'));
const VerifyPage = lazy(() => import('./pages/VerifyPage'));
const AdminLogin = lazy(() => import('./pages/AdminLogin'));

// Admin components
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminVerifications = lazy(() => import('./pages/admin/AdminVerifications'));
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'));
const AdminReports = lazy(() => import('./pages/admin/AdminReports'));
const AdminPosts = lazy(() => import('./pages/admin/AdminPosts'));

function App() {
    return (
        <AuthProvider>
            <ToastProvider>
                <Router>
                    <a href="#main-content" className="skip-to-main">
                        Skip to main content
                    </a>
                    <Suspense fallback={<div className="page-loader"><LoadingSpinner /></div>}>
                        <Routes>
                            {/* Landing page without Header/Footer */}
                            <Route path="/" element={<Landing />} />
                            
                            {/* Other pages with Header/Footer */}
                            <Route path="/*" element={
                                <div className="App">
                                    <Header />
                                    <main id="main-content" className="main-content" role="main">
                                        <Suspense fallback={<div className="content-loader"><LoadingSpinner /></div>}>
                                            <Routes>
                                                <Route path="/home" element={<Home />} />
                                                <Route path="/login" element={<Login />} />
                                                <Route path="/register" element={<Register />} />
                                                <Route path="/create-post" element={<CreatePost />} />
                                                <Route path="/edit-post/:id" element={<CreatePost />} />
                                                <Route path="/profile" element={<Profile />} />
                                                <Route path="/user/:userId" element={<PublicProfile />} />
                                                <Route path="/dashboard" element={<Dashboard />} />
                                                <Route path="/post/:id" element={<PostDetail />} />
                                                <Route path="/messages" element={<Messages />} />
                                                <Route path="/stories" element={<Stories />} />
                                                <Route path="/about" element={<AboutUs />} />
                                                <Route path="/verify" element={<VerifyPage />} />
                                                {/* Admin routes */}
                                                <Route path="/admin/login" element={<AdminLogin />} />
                                                <Route path="/admin" element={<AdminDashboard />} />
                                                <Route path="/admin/verifications" element={<AdminVerifications />} />
                                                <Route path="/admin/users" element={<AdminUsers />} />
                                                <Route path="/admin/reports" element={<AdminReports />} />
                                                <Route path="/admin/posts" element={<AdminPosts />} />
                                                {/* Catch all route - redirect to home */}
                                                <Route path="*" element={<Home />} />
                                            </Routes>
                                        </Suspense>
                                    </main>
                                    <Footer />
                                    <ScrollToTop />
                                </div>
                            } />
                        </Routes>
                    </Suspense>
                </Router>
            </ToastProvider>
        </AuthProvider>
    );
}

export default App;