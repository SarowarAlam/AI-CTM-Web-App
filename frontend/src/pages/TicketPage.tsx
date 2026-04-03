import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import api from '../services/api';
import { useTicket, useUpdateTicket } from '../hooks/useTickets';
import { useAuth } from '../contexts/AuthContext';
import { User } from '../types';

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

// Helper functions to safely get colors
const getStatusColor = (status: string | undefined) => {
  if (!status) return 'bg-gray-100 text-gray-800';
  return statusColors[status] || 'bg-gray-100 text-gray-800';
};

const getPriorityColor = (priority: string | undefined) => {
  if (!priority) return 'bg-gray-100 text-gray-800';
  return priorityColors[priority] || 'bg-gray-100 text-gray-800';
};

const TicketPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: ticket, isLoading, error } = useTicket(id!);
  const updateTicket = useUpdateTicket();

  // Fetch all users for assignment dropdown
  const { data: users } = useQuery('users', async () => {
    const { data } = await api.get('/users');
    return data as User[];
  });

  // Reclassify mutation
  const reclassifyMutation = useMutation(
    () => api.post(`/tickets/${id}/reclassify`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['ticket', id]);
      },
    }
  );

  // Local state for edit form
  const [editStatus, setEditStatus] = useState('');
  const [editAssignedTo, setEditAssignedTo] = useState('');

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading ticket</div>;

  const canEdit = user?.role === 'admin' || user?.role === 'agent';

  const handleUpdate = () => {
    if (!ticket) return;
    const updates: any = {};
    if (editStatus && editStatus !== ticket.status) updates.status = editStatus;
    if (editAssignedTo !== undefined && editAssignedTo !== (ticket.assigned_to || '')) {
      updates.assigned_to = editAssignedTo === '' ? null : editAssignedTo;
    }
    if (Object.keys(updates).length > 0) {
      updateTicket.mutate({ id: ticket.id, ...updates });
      setEditStatus('');
      setEditAssignedTo('');
    }
  };

  const handleReclassify = () => {
    reclassifyMutation.mutate();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">{ticket?.title}</h1>
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Ticket Details</h3>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
          <dl className="sm:divide-y sm:divide-gray-200">
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Description</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{ticket?.description}</dd>
            </div>

            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Status</dt>
              <dd className="mt-1 text-sm sm:mt-0 sm:col-span-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket?.status)}`}>
                  {ticket?.status?.replace('_', ' ') || 'Unknown'}
                </span>
                {canEdit && (
                  <select
                    value={editStatus || ticket?.status}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="ml-4 text-sm border rounded px-2 py-1"
                  >
                    <option value="open">open</option>
                    <option value="in_progress">in_progress</option>
                    <option value="resolved">resolved</option>
                    <option value="closed">closed</option>
                  </select>
                )}
              </dd>
            </div>

            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Priority</dt>
              <dd className="mt-1 text-sm sm:mt-0 sm:col-span-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(ticket?.priority)}`}>
                  {ticket?.priority || 'Not set'}
                </span>
              </dd>
            </div>

            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Assigned To</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {ticket?.assigned_to || 'Unassigned'}
                {canEdit && (
                  <select
                    value={editAssignedTo !== undefined ? editAssignedTo : (ticket?.assigned_to || '')}
                    onChange={(e) => setEditAssignedTo(e.target.value)}
                    className="ml-4 text-sm border rounded px-2 py-1"
                  >
                    <option value="">Unassigned</option>
                    {users?.filter(u => u.role === 'agent' || u.role === 'admin').map(u => (
                      <option key={u.id} value={u.id}>{u.email}</option>
                    ))}
                  </select>
                )}
              </dd>
            </div>

            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Category</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{ticket?.category}</dd>
            </div>

            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Confidence</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {ticket?.classification_confidence?.toFixed(2)}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {canEdit && (
        <div className="mt-6 flex gap-4">
          <button
            onClick={handleUpdate}
            disabled={updateTicket.isLoading}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm hover:bg-indigo-700 disabled:opacity-50"
          >
            {updateTicket.isLoading ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            onClick={handleReclassify}
            disabled={reclassifyMutation.isLoading}
            className="bg-gray-600 text-white px-4 py-2 rounded-md text-sm hover:bg-gray-700 disabled:opacity-50"
          >
            {reclassifyMutation.isLoading ? 'Reclassifying...' : 'Re-run AI Classification'}
          </button>
        </div>
      )}
    </div>
  );
};

export default TicketPage;