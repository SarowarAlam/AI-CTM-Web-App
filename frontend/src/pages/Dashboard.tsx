import React from 'react';
import TicketForm from '../components/tickets/TicketForm';
import TicketList from '../components/tickets/TicketList';
import { useAuth } from '../contexts/AuthContext';

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      {user?.role === 'customer' && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Create New Ticket</h2>
          <TicketForm />
        </div>
      )}
      <div>
        <h2 className="text-xl font-semibold mb-4">Your Tickets</h2>
        <TicketList />
      </div>
    </div>
  );
};

export default Dashboard;