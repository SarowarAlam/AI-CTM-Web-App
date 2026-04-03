import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { User, Ticket } from '../types';

// Color maps for status and priority
const statusColors: Record<string, string> = {
  open: 'bg-red-100 text-red-800',
  in_progress: 'bg-yellow-100 text-yellow-800',
  resolved: 'bg-green-100 text-green-800',
  closed: 'bg-gray-100 text-gray-800',
};

const priorityColors: Record<string, string> = {
  low: 'bg-blue-100 text-blue-800',
  medium: 'bg-orange-100 text-orange-800',
  high: 'bg-purple-100 text-purple-800',
};

const AdminPortal: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch users
  const { data: users, isLoading: usersLoading} = useQuery('users', async () => {
    const { data } = await api.get('/users');
    return data as User[];
  });

  // Fetch all tickets (admin sees all)
  const { data: tickets, isLoading: ticketsLoading } = useQuery('adminTickets', async () => {
    const { data } = await api.get('/tickets');
    return data as Ticket[];
  });

  // Fetch stats
  const { data: stats } = useQuery('stats', async () => {
    const { data } = await api.get('/admin/stats');
    return data;
  });

  // Fetch categories
  const { data: categories, isLoading: categoriesLoading } = useQuery('categories', async () => {
    const { data } = await api.get('/admin/categories');
    return data.labels as string[];
  });


  // State for category editing
  const [newCategory, setNewCategory] = useState('');

  // Delete user mutation
  const deleteUser = useMutation(
    (userId: string) => api.delete(`/users/${userId}`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('users');
      },
    }
  );

  // Delete ticket mutation
  const deleteTicket = useMutation(
    (ticketId: string) => api.delete(`/tickets/${ticketId}`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('adminTickets');
        queryClient.invalidateQueries('stats');
      },
    }
  );

  // Update categories mutation
  const updateCategories = useMutation(
    (newLabels: string[]) => api.put('/admin/categories', { labels: newLabels }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('categories');
      },
    }
  );

  // State for new user creation
  const [newUser, setNewUser] = useState({ email: '', password: '', full_name: '', role: 'agent' });
  const createUserMutation = useMutation(
    (userData: any) => api.post('/users', userData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('users');
        setNewUser({ email: '', password: '', full_name: '', role: 'agent' });
      }
    }
  );

  const handleAddCategory = () => {
    if (newCategory.trim() && categories && !categories.includes(newCategory.trim())) {
      const updated = [...categories, newCategory.trim()];
      updateCategories.mutate(updated);
      setNewCategory('');
    }
  };

  const handleRemoveCategory = (categoryToRemove: string) => {
    if (categories) {
      const updated = categories.filter(c => c !== categoryToRemove);
      updateCategories.mutate(updated);
    }
  };

  const handleDeleteUser = (userId: string, userEmail: string) => {
    if (window.confirm(`Are you sure you want to delete user ${userEmail}?`)) {
      deleteUser.mutate(userId);
    }
  };

  const handleDeleteTicket = (ticketId: string, ticketTitle: string) => {
    if (window.confirm(`Are you sure you want to delete ticket "${ticketTitle}"?`)) {
      deleteTicket.mutate(ticketId);
    }
  };

  if (user?.role !== 'admin') {
    return <div className="text-center mt-10">Access denied. Only admins can view this page.</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Admin Portal</h1>

      {/* Statistics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Total Tickets Card */}
        <div className="bg-white p-6 shadow rounded-lg border border-gray-200">
          <h3 className="text-lg font-medium text-gray-700 mb-2">Total Tickets</h3>
          <div className="text-4xl font-bold text-indigo-600">{stats?.total_tickets || 0}</div>
        </div>

        {/* Status Distribution Card */}
        <div className="bg-white p-6 shadow rounded-lg border border-gray-200">
          <h3 className="text-lg font-medium text-gray-700 mb-4">By Status</h3>
          {stats?.by_status && Object.entries(stats.by_status).map(([status, count]) => (
            <div key={status} className="flex justify-between items-center mb-2">
              <span className="capitalize text-gray-600">{status.replace('_', ' ')}</span>
              <span className="font-semibold text-gray-900">{count as number}</span>
            </div>
          ))}
        </div>

        {/* Category Distribution Card */}
        <div className="bg-white p-6 shadow rounded-lg border border-gray-200">
          <h3 className="text-lg font-medium text-gray-700 mb-4">By Category</h3>
          {stats?.by_category && Object.entries(stats.by_category).length > 0 ? (
            Object.entries(stats.by_category).map(([category, count]) => (
              <div key={category} className="flex justify-between items-center mb-2">
                <span className="text-gray-600">{category}</span>
                <span className="font-semibold text-gray-900">{count as number}</span>
              </div>
            ))
          ) : (
            <p className="text-gray-500">No tickets yet</p>
          )}
        </div>
      </div>

      {/* AI Categories Section */}
      <div className="bg-white p-4 shadow rounded mb-8">
        <h2 className="text-lg font-semibold mb-2">AI Categories</h2>
        {categoriesLoading ? (
          <div>Loading...</div>
        ) : (
          <div>
            <div className="flex flex-wrap gap-2 mb-4">
              {categories?.map((cat) => (
                <span key={cat} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100">
                  {cat}
                  <button
                    onClick={() => handleRemoveCategory(cat)}
                    className="ml-2 text-red-600 hover:text-red-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="New category name"
                className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
              <button
                onClick={handleAddCategory}
                className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm hover:bg-indigo-700"
              >
                Add
              </button>
            </div>
            <button
              onClick={() => updateCategories.mutate(['billing', 'technical', 'account', 'feature request', 'bug', 'general inquiry'])}
              className="mt-4 text-sm text-gray-600 hover:text-gray-900"
            >
              Reset to Default
            </button>
          </div>
        )}
      </div>

      {/* Tickets Section */}
      <div className="bg-white p-4 shadow rounded mb-8">
        <h2 className="text-lg font-semibold mb-4">All Tickets</h2>
        {ticketsLoading ? (
          <div>Loading tickets...</div>
        ) : tickets && tickets.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-300">
              <thead>
                <tr>
                  <th className="px-3 py-2 text-left text-sm font-semibold">Title</th>
                  <th className="px-3 py-2 text-left text-sm font-semibold">Status</th>
                  <th className="px-3 py-2 text-left text-sm font-semibold">Priority</th>
                  <th className="px-3 py-2 text-left text-sm font-semibold">Category</th>
                  <th className="px-3 py-2 text-left text-sm font-semibold">Created By</th>
                  <th className="px-3 py-2 text-left text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2 text-sm">{ticket.title}</td>
                    <td className="px-3 py-2 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[ticket.status]}`}>
                        {ticket.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityColors[ticket.priority]}`}>
                        {ticket.priority}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-sm">{ticket.category}</td>
                    <td className="px-3 py-2 text-sm">{ticket.created_by}</td>
                    <td className="px-3 py-2 text-sm">
                      <button
                        onClick={() => handleDeleteTicket(ticket.id, ticket.title)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>No tickets found.</p>
        )}
      </div>

      {/* Users Section */}
      <div className="bg-white p-4 shadow rounded">
        <h2 className="text-lg font-semibold mb-4">Users</h2>
        
        {/* Create New User Form */}
        <div className="mt-4 p-4 border rounded mb-4">
          <h3 className="font-medium mb-2">Create New User</h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
            <input
              type="email"
              placeholder="Email"
              value={newUser.email}
              onChange={e => setNewUser({...newUser, email: e.target.value})}
              className="border rounded p-1"
            />
            <input
              type="text"
              placeholder="Full Name"
              value={newUser.full_name}
              onChange={e => setNewUser({...newUser, full_name: e.target.value})}
              className="border rounded p-1"
            />
            <input
              type="password"
              placeholder="Password"
              value={newUser.password}
              onChange={e => setNewUser({...newUser, password: e.target.value})}
              className="border rounded p-1"
            />
            <select
              value={newUser.role}
              onChange={e => setNewUser({...newUser, role: e.target.value})}
              className="border rounded p-1"
            >
              <option value="agent">Agent</option>
              <option value="admin">Admin</option>
              <option value="customer">Customer</option>
            </select>
            <button
              onClick={() => createUserMutation.mutate(newUser)}
              className="bg-green-600 text-white px-3 py-1 rounded"
            >
              Add User
            </button>
          </div>
        </div>

        {usersLoading ? (
          <div>Loading users...</div>
        ) : users && users.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-300">
              <thead>
                <tr>
                  <th className="px-3 py-2 text-left text-sm font-semibold">Email</th>
                  <th className="px-3 py-2 text-left text-sm font-semibold">Name</th>
                  <th className="px-3 py-2 text-left text-sm font-semibold">Role</th>
                  <th className="px-3 py-2 text-left text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td className="px-3 py-2 text-sm">{u.email}</td>
                    <td className="px-3 py-2 text-sm">{u.full_name}</td>
                    <td className="px-3 py-2 text-sm">{u.role}</td>
                    <td className="px-3 py-2 text-sm">
                      <button
                        onClick={() => handleDeleteUser(u.id, u.email)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>No users found.</p>
        )}
      </div>
    </div>
  );
};

export default AdminPortal;