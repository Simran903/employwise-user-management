import React from "react";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface UserCardProps {
  user: User;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

const UserCard: React.FC<UserCardProps> = ({ user, onEdit, onDelete }) => {
  return (
    <div className="border p-4 rounded-lg shadow-md flex justify-between items-center">
      <div>
        <h2 className="text-lg font-semibold">{user.name}</h2>
        <p className="text-gray-600">{user.email}</p>
        <p className="text-sm text-gray-500">Role: {user.role}</p>
      </div>
      <div className="flex gap-2">
        <button className="px-4 py-2 bg-blue-500 text-white rounded" onClick={() => onEdit(user.id)}>
          Edit
        </button>
        <button className="px-4 py-2 bg-red-500 text-white rounded" onClick={() => onDelete(user.id)}>
          Delete
        </button>
      </div>
    </div>
  );
};

export default UserCard;
