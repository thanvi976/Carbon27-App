import type { Question } from '../types';

export const QUESTIONS: Question[] = [
  {
    id: 'q1',
    text: 'How do you usually commute?',
    options: [
      { label: 'Drive alone', value: 1 },
      { label: 'Carpool', value: 2 },
      { label: 'Public transport', value: 3 },
      { label: 'Bike', value: 4 },
      { label: 'Walk', value: 5 },
    ],
  },
  {
    id: 'q2',
    text: 'How often do you fly?',
    options: [
      { label: '10+ flights/year', value: 1 },
      { label: '5–9 flights/year', value: 2 },
      { label: '1–4 flights/year', value: 3 },
      { label: 'Every few years', value: 4 },
      { label: 'Never', value: 5 },
    ],
  },
  {
    id: 'q3',
    text: 'Which best describes your diet?',
    options: [
      { label: 'Meat most meals', value: 1 },
      { label: 'Meat often', value: 2 },
      { label: 'Occasionally', value: 3 },
      { label: 'Vegetarian', value: 4 },
      { label: 'Vegan', value: 5 },
    ],
  },
  {
    id: 'q4',
    text: 'How far do you travel for work/school?',
    options: [
      { label: '30km+', value: 1 },
      { label: '20–30km', value: 2 },
      { label: '10–20km', value: 3 },
      { label: 'Under 10km', value: 4 },
      { label: 'Work from home', value: 5 },
    ],
  },
  {
    id: 'q5',
    text: 'How efficient are your home appliances?',
    options: [
      { label: 'Rarely efficient', value: 1 },
      { label: 'Sometimes efficient', value: 2 },
      { label: 'Usually efficient', value: 3 },
      { label: 'Always efficient', value: 4 },
      { label: 'Smart/optimized', value: 5 },
    ],
  },
  {
    id: 'q6',
    text: 'How often do you buy new clothes?',
    options: [
      { label: 'Weekly', value: 1 },
      { label: 'Monthly', value: 2 },
      { label: 'Every 2–3 months', value: 3 },
      { label: 'Rarely', value: 4 },
      { label: 'Mostly second-hand', value: 5 },
    ],
  },
  {
    id: 'q7',
    text: 'How often do you use single-use plastics?',
    options: [
      { label: 'Daily', value: 1 },
      { label: 'Several times/week', value: 2 },
      { label: 'Sometimes', value: 3 },
      { label: 'Rarely', value: 4 },
      { label: 'Almost never', value: 5 },
    ],
  },
  {
    id: 'q8',
    text: 'How do you manage waste?',
    options: [
      { label: 'No sorting', value: 1 },
      { label: 'Sometimes sort', value: 2 },
      { label: 'Dry/wet separation', value: 3 },
      { label: 'Recycle consistently', value: 4 },
      { label: 'Compost', value: 5 },
    ],
  },
  {
    id: 'q9',
    text: 'What is your typical shower length?',
    options: [
      { label: '20+ minutes', value: 1 },
      { label: '15–20 minutes', value: 2 },
      { label: '10–15 minutes', value: 3 },
      { label: '5–10 minutes', value: 4 },
      { label: 'Under 5 minutes', value: 5 },
    ],
  },
  {
    id: 'q10',
    text: 'What kind of energy powers your home?',
    options: [
      { label: 'Mostly fossil fuels', value: 1 },
      { label: 'Not sure', value: 2 },
      { label: 'Efficient grid mix', value: 3 },
      { label: 'Partially renewable', value: 4 },
      { label: 'Solar/renewable', value: 5 },
    ],
  },
  {
    id: 'q11',
    text: 'How often do you order deliveries?',
    options: [
      { label: 'Multiple times/week', value: 1 },
      { label: 'Weekly', value: 2 },
      { label: 'Monthly', value: 3 },
      { label: 'Occasionally', value: 4 },
      { label: 'Rarely', value: 5 },
    ],
  },
  {
    id: 'q12',
    text: 'How much food do you waste?',
    options: [
      { label: 'Often', value: 1 },
      { label: 'Sometimes', value: 2 },
      { label: 'Try not to', value: 3 },
      { label: 'Plan carefully', value: 4 },
      { label: 'Zero waste', value: 5 },
    ],
  },
  {
    id: 'q13',
    text: 'How often do you support environmental causes?',
    options: [
      { label: 'Never', value: 1 },
      { label: 'Rarely', value: 2 },
      { label: 'Occasionally', value: 3 },
      { label: 'Regularly', value: 4 },
      { label: 'Actively', value: 5 },
    ],
  },
  {
    id: 'q14',
    text: 'What describes your home size?',
    options: [
      { label: 'Very large', value: 1 },
      { label: 'Large apartment', value: 2 },
      { label: 'Medium', value: 3 },
      { label: 'Small', value: 4 },
      { label: 'Shared', value: 5 },
    ],
  },
  {
    id: 'q15',
    text: 'How would you rate your carbon awareness?',
    options: [
      { label: 'None', value: 1 },
      { label: 'Learning', value: 2 },
      { label: 'Inconsistent', value: 3 },
      { label: 'Active', value: 4 },
      { label: 'Core', value: 5 },
    ],
  },
];

