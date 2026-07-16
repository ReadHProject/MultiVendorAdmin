import { baseApi } from "../baseApi";

const ticketsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getTickets: builder.query({
      query: (params) => ({ url: "/tickets", params }),
      providesTags: ["Ticket"],
    }),
    getTicket: builder.query({
      query: (id) => `/tickets/${id}`,
      providesTags: (result, error, id) => [{ type: "Ticket", id }],
    }),
    createTicket: builder.mutation({
      query: (body) => ({ url: "/tickets", method: "POST", body }),
      invalidatesTags: ["Ticket"],
    }),
    updateTicket: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/tickets/${id}`, method: "PATCH", body }),
      invalidatesTags: ["Ticket"],
    }),
    addReply: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/tickets/${id}/replies`, method: "POST", body }),
      invalidatesTags: (result, error, { id }) => [{ type: "Ticket", id }],
    }),
  }),
});

const {
  useGetTicketsQuery,
  useGetTicketQuery,
  useCreateTicketMutation,
  useUpdateTicketMutation,
  useAddReplyMutation,
} = ticketsApi;

export default ticketsApi;
export {
  useGetTicketsQuery,
  useGetTicketQuery,
  useCreateTicketMutation,
  useUpdateTicketMutation,
  useAddReplyMutation,
};
