import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import AdminRoute from './components/AdminRoute';
import Footer from './components/Footer';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageTutorials from './pages/admin/ManageTutorials';
import ManageUsers from './pages/admin/ManageUsers';
import ManageCategories from './pages/admin/ManageCategories';
import Bookmarks from './pages/Bookmarks';
import Categories from './pages/Categories';
import CreateTutorial from './pages/CreateTutorial';
import Dashboard from './pages/Dashboard';
import EditTutorial from './pages/EditTutorial';
import Home from './pages/Home';
import Login from './pages/Login';
import NotFound from './pages/NotFound';
import Profile from './pages/Profile';
import Register from './pages/Register';
import TutorialDetails from './pages/TutorialDetails';

function SiteLayout() {
  return <><Navbar /><Outlet /><Footer /></>;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<SiteLayout />}>
            <Route index element={<Home />} />
            <Route path="categories" element={<Categories />} />
            <Route path="tutorials/:id" element={<TutorialDetails />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="profile/:userId" element={<Profile />} />
            <Route element={<ProtectedRoute />}>
              <Route path="profile" element={<Profile />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="bookmarks" element={<Bookmarks />} />
              <Route path="tutorials/new" element={<CreateTutorial />} />
              <Route path="tutorials/:id/edit" element={<EditTutorial />} />
            </Route>
            <Route element={<AdminRoute />}>
              <Route path="admin" element={<AdminDashboard />} />
              <Route path="admin/users" element={<ManageUsers />} />
              <Route path="admin/tutorials" element={<ManageTutorials />} />
              <Route path="admin/categories" element={<ManageCategories />} />
            </Route>
            <Route path="not-found" element={<NotFound />} />
            <Route path="*" element={<Navigate to="/not-found" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
