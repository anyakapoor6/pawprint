import { PetReport, Story } from '@/types/pet';

export const mockReports: PetReport[] = [
  {
    id: '1',
    userId: 'user1',
    name: 'Max',
    type: 'dog',
    breed: 'Golden Retriever',
    color: 'Golden',
    size: 'large',
    gender: 'male',
    age: '3 years',
    description: 'Last seen near the lake. Wearing a red collar with tags.',
    photos: [
      'https://images.pexels.com/photos/2253275/pexels-photo-2253275.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
    ],
    reportType: 'lost',
    status: 'active',
    isUrgent: true,
    dateReported: '2024-03-10',
    lastSeenDate: '2024-03-10',
    lastSeenLocation: {
      latitude: 40.785091,
      longitude: -73.968285,
      address: 'Central Park, New York'
    },
    reward: {
      amount: 500,
      description: 'Reward for safe return'
    },
    contactInfo: {
      name: 'John Smith',
      email: 'john.smith@example.com',
      phone: '555-0123'
    },
    tags: ['friendly', 'collar', 'microchipped']
  },
  {
    id: '2',
    userId: 'user2',
    name: 'Luna',
    type: 'cat',
    breed: 'Siamese',
    color: 'Cream',
    size: 'small',
    gender: 'female',
    description: 'Indoor cat, may be scared. Has a blue collar with bell.',
    photos: [
      'https://images.pexels.com/photos/1770918/pexels-photo-1770918.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
    ],
    reportType: 'lost',
    status: 'active',
    isUrgent: true,
    dateReported: '2024-03-09',
    lastSeenDate: '2024-03-09',
    lastSeenLocation: {
      latitude: 40.692532,
      longitude: -73.990997,
      address: 'Downtown Brooklyn'
    },
    contactInfo: {
      name: 'Sarah Johnson',
      email: 'sarah.j@example.com',
      phone: '555-0124'
    },
    tags: ['indoor', 'shy', 'microchipped']
  },
  {
    id: '3',
    userId: 'user3',
    name: 'Charlie',
    type: 'dog',
    breed: 'Labrador Retriever',
    color: 'Chocolate',
    size: 'large',
    gender: 'male',
    age: '2 years',
    description: 'Found wandering near the park. Very friendly, wearing a green collar.',
    photos: [
      'https://images.pexels.com/photos/1805164/pexels-photo-1805164.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
    ],
    reportType: 'found',
    status: 'active',
    isUrgent: false,
    dateReported: '2024-03-11',
    lastSeenLocation: {
      latitude: 40.761421,
      longitude: -73.981667,
      address: 'Bryant Park, New York'
    },
    contactInfo: {
      name: 'Michael Chen',
      email: 'michael.c@example.com',
      phone: '555-0125'
    },
    tags: ['friendly', 'collar']
  },
  {
    id: '4',
    userId: 'user4',
    name: 'Bella',
    type: 'cat',
    breed: 'Persian',
    color: 'White',
    size: 'small',
    gender: 'female',
    age: '4 years',
    description: 'Found in residential area. Long-haired white cat with blue eyes.',
    photos: [
      'https://images.pexels.com/photos/1521306/pexels-photo-1521306.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
    ],
    reportType: 'found',
    status: 'active',
    isUrgent: false,
    dateReported: '2024-03-12',
    lastSeenLocation: {
      latitude: 40.742054,
      longitude: -73.988211,
      address: 'Gramercy Park, New York'
    },
    contactInfo: {
      name: 'Emily Davis',
      email: 'emily.d@example.com',
      phone: '555-0126'
    },
    tags: ['long-hair', 'friendly']
  },
  {
    id: '5',
    userId: 'user5',
    name: 'Rocky',
    type: 'dog',
    breed: 'German Shepherd',
    color: 'Black and Tan',
    size: 'large',
    gender: 'male',
    age: '5 years',
    description: 'Missing since yesterday evening. Has a distinctive scar on right ear.',
    photos: [
      'https://images.pexels.com/photos/333083/pexels-photo-333083.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
    ],
    reportType: 'lost',
    status: 'active',
    isUrgent: true,
    dateReported: '2024-03-13',
    lastSeenDate: '2024-03-13',
    lastSeenLocation: {
      latitude: 40.775891,
      longitude: -73.976328,
      address: 'Upper East Side, New York'
    },
    reward: {
      amount: 1000,
      description: 'Substantial reward for finding our beloved Rocky'
    },
    contactInfo: {
      name: 'David Wilson',
      email: 'david.w@example.com',
      phone: '555-0127'
    },
    tags: ['trained', 'microchipped', 'distinctive-marks']
  },
  {
    id: '6',
    userId: 'user6',
    type: 'rabbit',
    breed: 'Holland Lop',
    color: 'Brown and White',
    size: 'small',
    description: 'Found hopping around in community garden. Very gentle.',
    photos: [
      'https://images.pexels.com/photos/4001296/pexels-photo-4001296.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
    ],
    reportType: 'found',
    status: 'active',
    isUrgent: false,
    dateReported: '2024-03-14',
    lastSeenLocation: {
      latitude: 40.722301,
      longitude: -73.984892,
      address: 'East Village, New York'
    },
    contactInfo: {
      name: 'Lisa Martinez',
      email: 'lisa.m@example.com',
      phone: '555-0128'
    },
    tags: ['gentle', 'domestic']
  }
];

export const mockStories: Story[] = [
  {
    id: '1',
    userId: 'user1',
    title: 'Bailey Found After 3 Weeks!',
    content: 'We never lost hope of finding our beloved Bailey after he ran away during the 4th of July fireworks. Thanks to a kind stranger who recognized him from PawPrint and the amazing AI matching feature, Bailey is finally back home where he belongs! The reunion was emotional and Bailey couldn\'t stop wagging his tail. We\'re so grateful to this wonderful community!',
    petReportId: '101',
    petName: 'Bailey',
    petPhoto: 'https://images.pexels.com/photos/2253275/pexels-photo-2253275.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    userPhoto: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    userName: 'Michael Anderson',
    date: '2024-03-01',
    likes: 342,
    comments: 57,
    photos: [
      'https://images.pexels.com/photos/2253275/pexels-photo-2253275.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      'https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
    ],
    donations: [
      {
        id: 'donation1',
        userId: 'user2',
        userName: 'Sarah Johnson',
        userPhoto: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
        amount: 50,
        message: 'So happy Bailey is home safe! ❤️',
        timestamp: '2024-03-02T10:30:00Z'
      }
    ],
    totalDonations: 50
  }
];

export { mockReports }