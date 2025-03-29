import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import LoginPage from "../pages/Login";
import UsersPage from "../pages/UserList";
import EditUserPage from "../pages/EditUser";

const AppRoutes: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/users" element={<UsersPage />} />
        <Route path="/users/edit/:id" element={<EditUserPage />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;
