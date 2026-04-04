import { useQuery, useMutation, useQueryClient } from 'react-query';
import api from '../services/api';
import { Ticket } from '../types';

export const useTickets = () => {
  return useQuery('tickets', async () => {
    const { data } = await api.get('/tickets');
    return data as Ticket[];
  });
};

export const useTicket = (id: string) => {
  return useQuery(['ticket', id], async () => {
    const { data } = await api.get(`/tickets/${id}`);
    return data as Ticket;
  });
};

export const useCreateTicket = () => {
  const queryClient = useQueryClient();
  return useMutation(
    (newTicket: { title: string; description: string; priority?: string }) =>
      api.post('/tickets/', newTicket),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('tickets');
      },
    }
  );
};

export const useUpdateTicket = () => {
  const queryClient = useQueryClient();
  return useMutation(
    ({ id, ...data }: { id: string } & Partial<Ticket>) =>
      api.put(`/tickets/${id}`, data),
    {
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries('tickets');
        queryClient.invalidateQueries(['ticket', variables.id]);
      },
    }
  );
};