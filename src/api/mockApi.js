import axios from 'axios';

const mockEmails = [
  {
    id: 1,
    company: 'TechCorp',
    subject: 'New Partnership Opportunity',
    sender: 'john@techcorp.com',
    date: '2023-05-01T10:00:00Z',
    content: 'Dear Admin, We would like to discuss a potential partnership...',
  },
  {
    id: 2,
    company: 'Marketing Solutions',
    subject: 'Campaign Results',
    sender: 'sarah@marketingsolutions.com',
    date: '2023-05-02T14:30:00Z',
    content: 'Hello, Please find attached the results of our recent marketing campaign...',
  },
  {
    id: 3,
    company: 'Marketing Solutions',
    subject: 'Campaign Results',
    sender: 'sarah@marketingsolutions.com',
    date: '2023-05-02T14:30:00Z',
    content: 'Hello, Please find attached the results of our recent marketing campaign...',
  },
  {
    id: 4,
    company: 'Marketing Solutions',
    subject: 'Campaign Results',
    sender: 'sarah@marketingsolutions.com',
    date: '2023-05-02T14:30:00Z',
    content: 'Hello, Please find attached the results of our recent marketing campaign...',
  },
  {
    id: 5,
    company: 'Marketing Solutions',
    subject: 'Campaign Results',
    sender: 'sarah@marketingsolutions.com',
    date: '2023-05-02T14:30:00Z',
    content: 'Hello, Please find attached the results of our recent marketing campaign...',
  },
  {
    id: 6,
    company: 'Marketing Solutions',
    subject: 'Campaign Results',
    sender: 'sarah@marketingsolutions.com',
    date: '2023-05-02T14:30:00Z',
    content: 'Hello, Please find attached the results of our recent marketing campaign...',
  },
  {
    id: 7,
    company: 'Marketing Solutions',
    subject: 'Campaign Results',
    sender: 'sarah@marketingsolutions.com',
    date: '2023-05-02T14:30:00Z',
    content: 'Hello, Please find attached the results of our recent marketing campaign...',
  },
  {
    id: 8,
    company: 'Marketing Solutions',
    subject: 'Campaign Results',
    sender: 'sarah@marketingsolutions.com',
    date: '2023-05-02T14:30:00Z',
    content: 'Hello, Please find attached the results of our recent marketing campaign...',
  },
  {
    id: 9,
    company: 'Marketing Solutions',
    subject: 'Campaign Results',
    sender: 'sarah@marketingsolutions.com',
    date: '2023-05-02T14:30:00Z',
    content: 'Hello, Please find attached the results of our recent marketing campaign...',
  },
  {
    id: 10,
    company: 'Marketing Solutions',
    subject: 'Campaign Results',
    sender: 'sarah@marketingsolutions.com',
    date: '2023-05-02T14:30:00Z',
    content: 'Hello, Please find attached the results of our recent marketing campaign...',
  },
  // Add more mock emails as needed
];

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const getEmails = async () => {
  await delay(500); // Simulate network delay
  return mockEmails;
};

export const getEmailById = async (id) => {
  await delay(300); // Simulate network delay
  const email = mockEmails.find((email) => email.id === parseInt(id));
  if (!email) {
    throw new Error('Email not found');
  }
  return email;
};

// In a real application, you would replace these functions with actual API calls
// For example:
// export const getEmails = () => axios.get('/api/emails');
// export const getEmailById = (id) => axios.get(`/api/emails/${id}`);