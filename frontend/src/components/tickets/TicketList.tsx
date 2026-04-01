import React from 'react';
import { Link } from 'react-router-dom';
import { useTickets } from '../../hooks/useTickets';

const TicketList: React.FC = () => {
  const { data: tickets, isLoading, error } = useTickets();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading tickets</div>;

  return (
    <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
      <table className="min-w-full divide-y divide-gray-300">
        <thead className="bg-gray-50">
          <tr>
            <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">Title</th>
            <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
            <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Category</th>
            <th className="relative py-3.5 pl-3 pr-4 sm:pr-6">
              <span className="sr-only">View</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {tickets?.map((ticket) => (
            <tr key={ticket.id}>
              <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">
                {ticket.title}
              </td>
              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{ticket.status}</td>
              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{ticket.category}</td>
              <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                <Link to={`/tickets/${ticket.id}`} className="text-indigo-600 hover:text-indigo-900">
                  View
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TicketList;